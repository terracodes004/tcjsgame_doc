/**
 * tcjsgame-perf.js
 * Lightweight performance-extension for TCJSgame v1/v2/v3
 *
 * Usage:
 *  <script src="tcjsgame-v3.js"></script>
 *  <script src="tcjsgame-perf.js"></script>
 *
 *  // after creating display:
 *  enableTCJSPerf(display, { useDelta: true, cullMargin: 32, cacheTiles: true });
 *
 * Notes:
 *  - Non-invasive: does not rewrite engine source files; patches runtime behavior.
 *  - Works with different method names (updat/update).
 */

(function globalWrapper() {
  if (typeof window === "undefined") return;

  // rAF polyfill (very small)
  window.requestAnimationFrame = window.requestAnimationFrame ||
                                 window.webkitRequestAnimationFrame ||
                                 window.mozRequestAnimationFrame ||
                                 function (cb) { return setTimeout(function() { cb(performance.now()); }, 1000/60); };
  window.cancelAnimationFrame = window.cancelAnimationFrame ||
                                window.webkitCancelAnimationFrame ||
                                window.mozCancelAnimationFrame ||
                                function (id) { clearTimeout(id); };

  // Simple object pool utility
  const Pool = {
    create(factory) {
      const pool = { _items: [], factory };
      pool.acquire = function() {
        return this._items.length ? this._items.pop() : this.factory();
      };
      pool.release = function(item) {
        this._items.push(item);
      };
      return pool;
    }
  };

  // Default options
  const DEFAULTS = {
    useDelta: true,       // pass delta (seconds) to update(dt) if user update accepts it
    cull: true,           // skip components that are offscreen
    cullMargin: 32,       // pixels outside viewport to still consider visible (preload)
    cacheTiles: true,     // cache TileMap to offscreen canvas when possible
    fpsCap: 0,            // 0 = uncapped, >0 caps fps (internal)
    debug: false          // draw debug info (fps, counts)
  };

  // Helper: safe call to user update with dt support
  function callUserUpdate(deltaSeconds) {
    try {
      if (typeof window.update === "function") {
        // if update expects args, call with dt; else call without (maintain compatibility)
        if (window.update.length >= 1) {
          window.update(deltaSeconds);
        } else {
          window.update();
        }
      } else if (typeof window.update === "undefined") {
        // nothing to call
      }
    } catch (err) {
      // don't break the game loop
      // console.error("user update error", err);
    }
  }

  // Determine if an object is drawable component in comm array
  function isComponentWrapper(entry) {
    // engine uses comm array of { x: component, scene } or similar.
    return entry && (entry.x || entry.component) && (typeof entry.scene !== "undefined");
  }

  // Primary enable function: call this after display is created
  window.enableTCJSPerf = function enableTCJSPerf(display, opts = {}) {
    if (!display) throw new Error("enableTCJSPerf: display instance required");
    const cfg = Object.assign({}, DEFAULTS, opts);

    // If already enabled on this display, return
    if (display.__tcjs_perf_enabled) return display.__tcjs_perf_enabled;

    // Save original state for fallback
    const orig = {
      start: display.start ? display.start.bind(display) : null,
      stop: display.stop ? display.stop.bind(display) : null,
      updat: display.updat ? display.updat.bind(display) : null
    };

    // Internal cached state
    const state = {
      rafId: null,
      lastTs: performance.now(),
      running: false,
      fpsLast: performance.now(),
      framesThisSecond: 0,
      fps: 0,
      pools: {}
    };

    // Tile cache map per display.tileFace instance
    const tileCache = {
      canvas: null,
      width: 0,
      height: 0,
      mapHash: null // naive change detection
    };

    // Compute viewport rectangle in world coords
    function getViewportRect() {
      const x = display.camera && display.camera.x ? display.camera.x : 0;
      const y = display.camera && display.camera.y ? display.camera.y : 0;
      const w = display.canvas.width;
      const h = display.canvas.height;
      return { x: x - cfg.cullMargin, y: y - cfg.cullMargin, w: w + 2*cfg.cullMargin, h: h + 2*cfg.cullMargin };
    }

    // Simple AABB test
    function rectIntersects(ax, ay, aw, ah, bx, by, bw, bh) {
      return !(ax + aw < bx || ax > bx + bw || ay + ah < by || ay > by + bh);
    }

    // Prepare tile cache (offscreen) for a tileFace if present
    function prepareTileCache() {
      try {
        const tface = display.tileFace;
        if (!tface || !tface.map || !cfg.cacheTiles) return;
        // compute a hash of map length and tile count quickly to detect changes
        const hash = tface.map.length + "_" + (tface.tile ? tface.tile.length : 0);
        if (tileCache.mapHash === hash && tileCache.canvas) return; // reused

        const map = tface.map;
        const tileDefs = tface.tile || [];
        const tileW = Math.round(tface.tileWidth || (display.mapWidth / (map[0] ? map[0].length : 1)));
        const tileH = Math.round(tface.tileHeight || (display.mapHeight / (map.length || 1)));
        const cols = map[0] ? map[0].length : 0;
        const rows = map.length || 0;
        const totalW = cols * tileW;
        const totalH = rows * tileH;
        if (totalW === 0 || totalH === 0) return;

        // create offscreen
        let off = document.createElement("canvas");
        off.width = totalW;
        off.height = totalH;
        let ctx = off.getContext("2d");

        // draw every tile once
        for (let ry = 0; ry < rows; ry++) {
          for (let rx = 0; rx < cols; rx++) {
            const id = map[ry][rx];
            if (!id) continue;
            const tile = tileDefs[id];
            if (!tile) continue;
            // tile may be a Component-like object; draw with its update/bUpdate logic or as rect/image
            try {
              // If tile.type === "image" and tile.image exists, draw image
              if (tile.type === "image" && tile.image && tile.image.complete) {
                ctx.drawImage(tile.image, rx*tileW, ry*tileH, tileW, tileH);
              } else {
                // fallback: draw color rect
                ctx.fillStyle = tile.color || "#000";
                ctx.fillRect(rx*tileW, ry*tileH, tileW, tileH);
              }
            } catch (e) {
              // ignore tile draw errors
            }
          }
        }

        tileCache.canvas = off;
        tileCache.width = totalW;
        tileCache.height = totalH;
        tileCache.mapHash = hash;
        if (cfg.debug) console.info("tcjs-perf: tilemap cached", totalW, totalH);
      } catch (e) {
        // ignore cache errors
      }
    }

    // Cull + draw loop (runs per rAF)
    function loop(ts) {
      if (!state.running) return;

      // fps measurement
      state.framesThisSecond++;
      if (ts - state.fpsLast >= 1000) {
        state.fps = state.framesThisSecond;
        state.framesThisSecond = 0;
        state.fpsLast = ts;
      }

      const deltaMs = Math.min(ts - state.lastTs, 200); // clamp large dt
      state.lastTs = ts;
      const dt = cfg.useDelta ? (deltaMs / 1000) : (1/60);

      // call user update if any: either update(dt) or update()
      callUserUpdate(dt);

      // update mouse sync if display exposes mouse coords (best-effort)
      try {
        if (display && display.context) {
          // clear
          display.clear();
        }
      } catch (e) {}

      // draw world with camera offset
      const ctx = display.context;
      ctx.save();
      // camera translate
      const camX = display.camera && typeof display.camera.x === "number" ? display.camera.x : 0;
      const camY = display.camera && typeof display.camera.y === "number" ? display.camera.y : 0;
      ctx.translate(-camX, -camY);

      // Tilemap: if caching enabled and tileFace present, blit portion
      if (cfg.cacheTiles && display.tileFace && display.tileFace.tileList) {
        prepareTileCache();
        if (tileCache.canvas) {
          // compute source rect in tilecache that corresponds to viewport
          const view = getViewportRect();
          // src coords are view.x/view.y (already world coords)
          // destination: same world coords
          try {
            ctx.drawImage(tileCache.canvas,
                          Math.max(0, view.x), Math.max(0, view.y),
                          Math.min(tileCache.width - view.x, view.w), Math.min(tileCache.height - view.y, view.h),
                          Math.max(0, view.x), Math.max(0, view.y),
                          Math.min(tileCache.width - view.x, view.w), Math.min(tileCache.height - view.y, view.h));
          } catch (e) {
            // fallback: call original tile rendering
            try { display.tileFace.show(); } catch (e2) {}
          }
        } else {
          // no cache available: fallback to engine tile rendering
          try { display.tileFace.show(); } catch (e) {}
        }
      }

      // Draw components: iterate comm or display-specific list
      try {
        const list = (typeof comm !== "undefined" && Array.isArray(comm)) ? comm : (display.comm || []);
        const view = getViewportRect();
        let drawCount = 0;
        for (let i = 0; i < list.length; i++) {
          const entry = list[i];
          const wrapper = isComponentWrapper(entry) ? entry : null;
          if (!wrapper) continue;
          const comp = wrapper.x;
          if (!comp) continue;
          if (wrapper.scene !== display.scene) continue;

          // cull if requested and component supports bounds
          if (cfg.cull) {
            const cw = comp.width || 0, ch = comp.height || 0;
            const cx = (typeof comp.x === "number") ? comp.x : 0;
            const cy = (typeof comp.y === "number") ? comp.y : 0;
            if (!rectIntersects(cx, cy, cw, ch, view.x, view.y, view.w, view.h)) {
              // skip update/draw but still allow movement logic occasionally if desired
              continue;
            }
          }

          // optionally move using dt-aware signature if present (keeps compatibility)
          try {
            if (typeof comp.move === "function") {
              // prefer move(dt) if the implementation expects dt (we don't enforce)
              try { comp.move(dt); } catch (e) { comp.move(); }
            }
            // draw: prefer comp.update(ctx) but protect against modifications
            try { comp.update(ctx); } catch (e) { if (typeof comp.bUpdate === "function") try { comp.bUpdate(ctx); } catch(_) {} }
            drawCount++;
          } catch (e) {
            // ignore per-component errors
          }
        }

        if (cfg.debug) {
          // simple overlay (drawn in world coords)
          ctx.restore();
          ctx.save();
          ctx.fillStyle = "rgba(0,0,0,0.6)";
          ctx.fillRect(camX + 8, camY + 8, 120, 48);
          ctx.fillStyle = "#fff";
          ctx.font = "12px monospace";
          ctx.fillText("FPS: " + state.fps, camX + 12, camY + 26);
          ctx.fillText("Drawn: " + (typeof drawCount === "number" ? drawCount : "-"), camX + 12, camY + 42);
        } else {
          ctx.restore();
        }
      } catch (e) {
        // drawing loop fail-safe
        try { ctx.restore(); } catch (err) {}
      }

      // schedule next frame (respect fps cap if configured)
      if (cfg.fpsCap > 0) {
        // approximate: use setTimeout then rAF (keeps compatibility)
        window.setTimeout(() => {
          state.rafId = requestAnimationFrame(loop);
        }, Math.max(0, (1000/cfg.fpsCap) - deltaMs));
      } else {
        state.rafId = requestAnimationFrame(loop);
      }
    } // end loop

    // visibility handling: pause loop when hidden to save CPU
    function handleVisibility() {
      if (document.hidden) {
        if (state.running) {
          state.running = false;
          if (state.rafId) { cancelAnimationFrame(state.rafId); state.rafId = null; }
        }
      } else {
        if (!state.running) {
          state.running = true;
          state.lastTs = performance.now();
          state.rafId = requestAnimationFrame(loop);
        }
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);

    // apply patched start/stop behavior for this display instance
    function patchedStart(width = 480, height = 270, parent = document.body) {
      // call original start if present to keep canvas insertion and listeners
      if (orig.start) {
        try { orig.start(width, height, parent); } catch (e) { /* ignore */ }
      } else {
        // fallback: create canvas like engine would
        try {
          display.canvas.width = width;
          display.canvas.height = height;
          parent.insertBefore(display.canvas, parent.childNodes[0]);
        } catch (_) {}
      }

      // init loop state and start RAF
      state.lastTs = performance.now();
      state.fpsLast = performance.now();
      state.framesThisSecond = 0;
      state.running = true;
      // prepare tile cache immediately if desired
      if (cfg.cacheTiles) prepareTileCache();
      // start RAF loop
      if (state.rafId) cancelAnimationFrame(state.rafId);
      state.rafId = requestAnimationFrame(loop);
    }

    function patchedStop() {
      state.running = false;
      if (state.rafId) { cancelAnimationFrame(state.rafId); state.rafId = null; }
      if (orig.stop) {
        try { orig.stop(); } catch (e) {}
      }
    }

    // attach helpers to display
    display.__tcjs_perf_enabled = {
      cfg, state, Pool, enableTCJSPerf, patchedStart, patchedStop
    };

    // patch only this instance's start/stop (do not mutate prototype globally)
    display.start = patchedStart;
    display.stop = patchedStop;
    // alias resume/pause
    display.pause = function() { state.running = false; if (state.rafId) { cancelAnimationFrame(state.rafId); state.rafId = null; } };
    display.resume = function() { if (!state.running) { state.running = true; state.lastTs = performance.now(); state.rafId = requestAnimationFrame(loop); } };
    // expose a small API to refresh tile cache or change config at runtime
    display.tcjsPerf = {
      refreshTileCache: prepareTileCache,
      setOption: function(k,v){ cfg[k]=v; },
      getOption: function(k){ return cfg[k]; },
      getFPS: () => state.fps
    };

    // If engine had an "interval" based loop previously running, cancel it (best-effort)
    try { if (display.interval) { clearInterval(display.interval); display.interval = null; } } catch (e) {}

    // start automatically if display was already started previously (heuristic)
    // we avoid auto-start; user should call display.start(...) normally.

    return display.__tcjs_perf_enabled;
  }; // end enableTCJSPerf

})();
