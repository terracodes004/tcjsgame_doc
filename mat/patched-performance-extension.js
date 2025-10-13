// TCJSGame Performance Extension - Patched Version
(function() {
    if (typeof Display === 'undefined') {
        console.warn('TCJSGame Performance Extension: Display class not found');
        return;
    }

    console.log('TCJSGame Performance Extension loaded - patched version');

    // Store the original start method
    const originalStart = Display.prototype.start;

    // Override the start method with proper compatibility
    Display.prototype.start = function(width, height, config = {}) {
        console.log('Performance Extension: Starting game with patches');
        
        // Set configuration with defaults
        this.useDelta = config.useDelta ?? true;
        this.enableCulling = config.enableCulling ?? true;
        this.enableCaching = config.enableCaching ?? true;

        // Store the original update reference
        this._originalUpdate = this.update;
        
        // Initialize performance tracking
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.lastFpsUpdate = this.lastTime;
        this.currentFPS = 0;

        // Enhanced game loop with proper error handling
        this.gameLoop = (timestamp) => {
            if (!this.lastTime) this.lastTime = timestamp;
            
            const deltaTime = this.useDelta ? (timestamp - this.lastTime) / 1000 : (1/60);
            this.lastTime = timestamp;

            try {
                // Call the original update function with proper context
                if (typeof this._originalUpdate === 'function') {
                    this._originalUpdate.call(this, deltaTime);
                } else if (typeof this.update === 'function') {
                    this.update.call(this, deltaTime);
                }
                
                // Performance optimizations
                this._renderWithOptimizations();
                
            } catch (error) {
                console.error('Performance Extension Game Loop Error:', error);
            }

            // Update FPS counter
            this._updateFPS(timestamp);
            
            // Continue the loop
            this.gameLoopId = requestAnimationFrame(this.gameLoop);
        };

        // Start the game loop
        this.gameLoopId = requestAnimationFrame(this.gameLoop);
        
        // Call any original start logic if it exists
        if (originalStart) {
            originalStart.call(this, width, height, config);
        }

        return this;
    };

    // Enhanced rendering with optimizations
    Display.prototype._renderWithOptimizations = function() {
        const ctx = this.ctx;
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, this.width, this.height);
        
        // Render all components with optimizations
        for (let i = 0; i < this.components.length; i++) {
            const component = this.components[i];
            if (!component.visible) continue;
            
            // Apply culling if enabled
            if (this.enableCulling && this._isOutsideViewport(component)) {
                continue;
            }
            
            // Apply caching if enabled
            if (this.enableCaching) {
                this._renderWithCaching(component);
            } else {
                this._renderComponent(component);
            }
        }
    };

    // Viewport culling check
    Display.prototype._isOutsideViewport = function(component) {
        // Simple viewport check - adjust based on your camera system
        return component.x + component.width < 0 || 
               component.x > this.width ||
               component.y + component.height < 0 || 
               component.y > this.height;
    };

    // Cached rendering
    Display.prototype._renderWithCaching = function(component) {
        if (!component._cacheValid || !component._cachedData) {
            // Update cache
            component._cachedData = this._prepareComponentData(component);
            component._cacheValid = true;
        }
        this._renderFromCache(component);
    };

    // FPS counter
    Display.prototype._updateFPS = function(timestamp) {
        this.frameCount++;
        
        if (timestamp - this.lastFpsUpdate >= 1000) {
            this.currentFPS = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = timestamp;
            
            // Optional: Display FPS in console
            if (this.showFPS) {
                console.log(`FPS: ${this.currentFPS}`);
            }
        }
    };

    // Add FPS display method
    Display.prototype.showFPS = function(show = true) {
        this.showFPS = show;
        return this;
    };

    // Method to disable/enable optimizations
    Display.prototype.setOptimizations = function(options) {
        if (options.useDelta !== undefined) this.useDelta = options.useDelta;
        if (options.enableCulling !== undefined) this.enableCulling = options.enableCulling;
        if (options.enableCaching !== undefined) this.enableCaching = options.enableCaching;
        return this;
    };

    console.log('TCJSGame Performance Extension - Patched version ready');
})();
