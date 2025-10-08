---
title: "TCJSGame Display Class: Complete Reference Guide"
seoTitle: "display, tcjsgame display class"
seoDescription: "The Display Class is the heart of TCJSGame, serving as the main controller that manages the game canvas, rendering loop, input handling, and scene managemen"
datePublished: Wed Oct 08 2025 01:28:00 GMT+0000 (Coordinated Universal Time)
cuid: cmghb7jfe000402iid3ojhbaq
slug: tcjsgame-display-class-complete-reference-guide
ogImage: https://cdn.hashnode.com/res/hashnode/image/upload/v1759886780391/c8e4dc25-7501-49ae-9662-cbc91efa6c9d.jpeg
tags: javascript, web-development, game-development, coding, tcjsgame

---

![Canvas Game Development](https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80 align="left")

## Introduction to the Display Class

The **Display Class** is the heart of TCJSGame, serving as the main controller that manages the game canvas, rendering loop, input handling, and scene management. It's the first class you'll interact with when creating any TCJSGame project.

## 🏗️ Class Constructor and Initialization

### Basic Instantiation

```javascript
// Create a new display instance
const display = new Display();

// Start the game with default dimensions (480x270)
display.start();

// Or specify custom dimensions
display.start(800, 600);

// With custom parent element
const gameContainer = document.getElementById('game-container');
display.start(800, 600, gameContainer);
```

### Constructor Properties

When a Display instance is created, it automatically initializes:

```javascript
class Display {
    constructor() {
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");
        this.frameNo = 0;                    // Frame counter
        this.keys = [];                      // Keyboard state array
        this.x = false;                      // Mouse/touch X
        this.y = false;                      // Mouse/touch Y
        this.interval = null;                // Game loop interval
        this.tile = null;                    // Tile definitions
        this.map = null;                     // Map data
        this.tileFace = null;                // TileMap instance
        this.scene = 0;                      // Current scene index
        this.camera = new Camera();          // Camera instance
    }
}
```

## 🎮 Core Methods

### Starting and Stopping the Game

```javascript
// Start the game loop
display.start(width = 480, height = 270, parent = document.body);

// Stop the game loop
display.stop();

// Example: Full game lifecycle
const display = new Display();
display.start(800, 600);

// Later, when pausing the game
display.stop();

// Resume the game
display.start(); // Maintains previous dimensions
```

### Canvas Styling and Appearance

```javascript
// Background colors and gradients
display.backgroundColor("navy");                    // Solid color
display.lgradient("bottom", "blue", "lightblue");   // Linear gradient
display.rgradient("blue", "darkblue");              // Radial gradient

// Border styling
display.borderColor("white");
display.borderSize("2px");
display.borderStyle("solid");

// Text styling
display.fontColor("white");

// Fullscreen control
display.fullScreen();    // Enter fullscreen mode
display.exitScreen();    // Exit fullscreen mode

// Canvas scaling
display.scale(1024, 768); // Resize canvas dimensions
```

## 🖥️ Rendering and Scene Management

### The Game Loop

```javascript
// The internal update method handles:
display.updat() {
    this.clear();                           // Clear canvas
    this.frameNo += 1;                      // Increment frame counter
    this.context.save();                    // Save context state
    this.context.translate(-this.camera.x, -this.camera.y); // Apply camera
    
    try {
        update();                          // Global update function
    } catch (e) {
        // Handle errors silently
    }
    
    // Render components in current scene
    comm.forEach(component => {
        if(component.scene == this.scene) {
            component.x.move();
            component.x.update(this.context);
        }
    });
    
    this.context.restore();                // Restore context state
}
```

### Scene System

```javascript
// Add components to specific scenes
const player = new Component(30, 30, "blue", 100, 100, "rect");
const menuBg = new Component(800, 600, "darkblue", 0, 0, "rect");
const gameBg = new Component(800, 600, "lightblue", 0, 0, "rect");

// Add to scenes (scene 0 = menu, scene 1 = game)
display.add(menuBg, 0);
display.add(gameBg, 1);
display.add(player, 1);

// Switch between scenes
display.scene = 0;    // Show menu
display.scene = 1;    // Show game

// Check current scene
console.log("Current scene:", display.scene);
```

## ⌨️ Input Handling System

### Keyboard Input

```javascript
// Keyboard states are stored in display.keys array
function update() {
    // Arrow keys (key codes: 37=left, 38=up, 39=right, 40=down)
    if (display.keys[37]) { /* Left arrow pressed */ }
    if (display.keys[39]) { /* Right arrow pressed */ }
    if (display.keys[38]) { /* Up arrow pressed */ }
    if (display.keys[40]) { /* Down arrow pressed */ }
    
    // Spacebar (key code 32)
    if (display.keys[32]) { /* Space pressed */ }
    
    // Letter keys (65='A', 66='B', etc.)
    if (display.keys[65]) { /* A key pressed */ }
    if (display.keys[87]) { /* W key pressed */ }
}

// Common key codes:
// 13: Enter, 27: Escape, 32: Space, 16: Shift, 17: Ctrl
// 65-90: A-Z, 48-57: 0-9
```

### Mouse and Touch Input

```javascript
function update() {
    // Mouse/touch position (relative to canvas)
    if (display.x !== false && display.y !== false) {
        console.log("Input at:", display.x, display.y);
    }
    
    // Check if mouse/touch is currently down
    if (display.x !== false) {
        // Input is active (mouse down or touch)
    }
}

// Global mouse object (alternative access)
console.log("Mouse position:", mouse.x, mouse.y);
console.log("Mouse down:", mouse.down);
```

## 🗺️ TileMap Integration

### Setting Up TileMaps

```javascript
// Define tiles (index 0 is reserved for empty)
const tiles = [
    new Component(0, 0, "green", 0, 0, "rect"),  // Index 1 - ground
    new Component(0, 0, "gray", 0, 0, "rect")    // Index 2 - wall
];

// Create map layout
const mapLayout = [
    [2, 2, 2, 2, 2],
    [2, 1, 1, 1, 2],
    [2, 1, 1, 1, 2],
    [2, 2, 2, 2, 2]
];

// Assign to display and create TileMap
display.tile = tiles;
display.map = mapLayout;
display.tileMap();              // Creates tileFace instance
display.tileFace.show();        // Renders the tilemap
```

### TileMap Access and Manipulation

```javascript
// Access the TileMap instance
const tilemap = display.tileFace;

// Check collisions
if (tilemap.crashWith(player)) {
    // Player collided with any tile
}

if (tilemap.crashWith(player, 2)) {
    // Player collided with wall tiles (id=2)
}

// Get specific tiles
const groundTiles = tilemap.tiles(1); // All ground tiles
const specificTile = tilemap.rTile(2, 3); // Tile at column 2, row 3

// Modify tilemap dynamically
tilemap.add(1, 2, 2);  // Add ground at position (2,2)
tilemap.remove(3, 1);  // Remove tile at position (3,1)
```

## 📷 Camera System

### Camera Control

```javascript
// Camera is automatically created with Display
const camera = display.camera;

// Set world boundaries
camera.worldWidth = 2000;
camera.worldHeight = 1500;

// Follow a component
camera.follow(player, false);  // Direct follow (no smoothing)
camera.follow(player, true);   // Smooth follow (lerping)

// Manual camera control
camera.x = 500;  // Set camera position directly
camera.y = 300;

// Camera properties
console.log("Camera position:", camera.x, camera.y);
console.log("World size:", camera.worldWidth, camera.worldHeight);
```

## 🎯 Practical Examples

### Complete Game Setup

```javascript
// Complete game initialization example
const display = new Display();

// Setup display
display.start(800, 600);
display.lgradient("bottom", "#87CEEB", "#E0F7FA");
display.borderColor("#333");
display.borderSize("1px");

// Create game objects
const player = new Component(30, 30, "red", 100, 100, "rect");
player.physics = true;
player.gravity = 0.5;
display.add(player);

// Setup camera
display.camera.worldWidth = 1600;
display.camera.worldHeight = 1200;
display.camera.follow(player, true);

// Global update function
function update() {
    // Input handling
    if (display.keys[37]) player.speedX = -5;  // Left
    if (display.keys[39]) player.speedX = 5;   // Right
    if (display.keys[38]) player.speedY = -10; // Jump
    
    // Game logic here...
}
```

### Scene Management Example

```javascript
// Menu scene (scene 0)
const menuBg = new Component(800, 600, "darkblue", 0, 0, "rect");
const startButton = new Component(200, 50, "green", 300, 300, "rect");
startButton.text = "Start Game";
display.add(menuBg, 0);
display.add(startButton, 0);

// Game scene (scene 1)
const gameBg = new Component(800, 600, "lightblue", 0, 0, "rect");
const player = new Component(30, 30, "red", 100, 100, "rect");
display.add(gameBg, 1);
display.add(player, 1);

// Scene switching logic
function update() {
    if (display.scene === 0 && startButton.clicked()) {
        display.scene = 1; // Switch to game scene
    }
    
    if (display.scene === 1 && display.keys[27]) { // ESC key
        display.scene = 0; // Switch to menu scene
    }
}
```

## ⚡ Performance Tips

### Optimizing the Display

```javascript
// 1. Use appropriate frame rate
// Default is 50 FPS (20ms interval), adjust as needed
display.interval = setInterval(() => display.updat(), 33); // ~30 FPS

// 2. Minimize context operations in update loop
// Bad: Creating gradients every frame
// Good: Create gradients once in setup

// 3. Use scene system to disable rendering of invisible objects
// Only objects in current scene are rendered

// 4. Leverage TileMap for static level geometry
// More efficient than individual Component objects
```

### Memory Management

```javascript
// Proper cleanup when destroying the game
function destroyGame() {
    display.stop();                    // Stop game loop
    display.canvas.remove();           // Remove canvas from DOM
    // Additional cleanup as needed
}

// Remove components properly
function removeComponent(component) {
    const index = comm.findIndex(c => c.x === component);
    if (index !== -1) {
        comm.splice(index, 1);
    }
}
```

## 🔧 Advanced Features

### Custom Rendering Pipeline

```javascript
// Access the raw canvas context for custom drawing
const ctx = display.context;

// Custom rendering example
function customRender() {
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx.beginPath();
    ctx.arc(400, 300, 50, 0, Math.PI * 2);
    ctx.fill();
}

// Call in update function
function update() {
    customRender();
    // Other game logic...
}
```

### Multiple Display Instances

```javascript
// Create multiple game instances on same page
const game1 = new Display();
const game2 = new Display();

game1.start(400, 300, document.getElementById('game1-container'));
game2.start(400, 300, document.getElementById('game2-container'));

// Each has independent state, input, and rendering
```

## 🐛 Common Issues and Solutions

### Canvas Not Appearing

```javascript
// Ensure parent element exists and is visible
const container = document.getElementById('game-container');
if (container) {
    display.start(800, 600, container);
} else {
    console.error("Container element not found!");
}
```

### Input Not Working

```javascript
// Check if event listeners are properly set
// Verify key codes are correct
function update() {
    console.log("Keys pressed:", display.keys.filter(k => k));
    // Debugging output to see what keys are detected
}
```

### Performance Issues

```javascript
// Reduce frame rate for better performance
display.interval = setInterval(() => display.updat(), 33); // 30 FPS

// Use fewer active components
// Implement object pooling for frequently created/destroyed objects
```

## 📚 Conclusion

The **Display Class** is the foundation of every TCJSGame project, providing:

* **Canvas management** and rendering pipeline
    
* **Input handling** for keyboard, mouse, and touch
    
* **Scene system** for organizing game states
    
* **TileMap integration** for level design
    
* **Camera control** for scrolling worlds
    
* **Game loop management** with consistent timing
    

Mastering the Display Class is essential for creating robust TCJSGame applications. Its simplicity belies powerful capabilities that can scale from simple prototypes to complex games.

For more examples and advanced usage, refer to the official TCJSGame documentation and community resources.