TCJSgame - Lightweight JavaScript Game Engine
Overview
TCJSgame is a lightweight and easy-to-use JavaScript game engine designed for creating 2D games in the browser using HTML5 Canvas. It provides a simple API for handling graphics, physics, input, and game logic, making it perfect for beginners and educational projects.

Note: TCJSgame is a browser-based game engine and requires a browser environment to run.

Installation
Browser (CDN)
html
<script src="https://tcjsgame.vercel.app/mat/tcjsgamev2.js"></script>
Manual Setup
Download the TCJSgame library

Include it in your HTML file:

html
<script src="path/to/tcjsgamev2.js"></script>
Quick Start
html
<!DOCTYPE html>
<html>
<head>
    <title>My TCJSgame Project</title>
    <script src="https://tcjsgame.vercel.app/mat/tcjsgamev2.js"></script>
</head>
<body>
    <script>
        // Initialize the game display
        const display = new Display();
        display.start(800, 600);

        // Create a player component
        const player = new Component(30, 30, "blue", 100, 100, "rect");
        player.physics = true;
        player.gravity = 0.5;

        // Add component to display
        display.add(player);

        // Handle keyboard input
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') player.speedX = 5;
            if (e.key === 'ArrowLeft') player.speedX = -5;
            if (e.key === ' ') player.gravitySpeed = -15;
        });

        // Game loop
        function update() {
            display.clear();
            
            // Boundary checking
            if (player.x < 0) player.x = 0;
            if (player.x > display.canvas.width - player.width) {
                player.x = display.canvas.width - player.width;
            }
            
            requestAnimationFrame(update);
        }

        update();
    </script>
</body>
</html>
Core Classes
Display Class
Manages the game canvas and rendering.

javascript
const display = new Display();
display.start(width, height, parentElement);
display.backgroundColor(color);
display.borderColor(color);
display.stop();
Component Class
Represents game objects.

javascript
const component = new Component(width, height, color, x, y, type);
component.physics = true;
component.gravity = 0.5;
component.bounce = 0.6;
Camera Class
Controls the viewport for scrolling games.

javascript
const camera = new Camera(x, y, worldWidth, worldHeight);
camera.follow(playerComponent, smooth=true);
Utility Functions
Movement Utilities
javascript
move.accelerate(component, accelX, accelY, maxSpeedX, maxSpeedY);
move.decelerate(component, decelX, decelY);
move.project(component, initialVelocity, angle, gravity);
move.pointTo(component, targetX, targetY);
move.position(component, direction, offset);
State Utilities
javascript
state.distance(component1, component2);
state.rect(component);
state.physics(component);
Input Handling
TCJSgame provides built-in input handling:

javascript
// Keyboard input
if (display.keys[37]) { /* Left arrow pressed */ }

// Mouse input
if (mouse.down) {
    console.log("Mouse at:", mouse.x, mouse.y);
}
Physics System
The engine includes a simple physics system:

javascript
component.physics = true;
component.gravity = 0.5;
component.bounce = 0.6;
Examples
Check out the examples directory for complete game implementations:

Platformer game

Shooting game

Physics demonstrations

Documentation
Full API documentation is available at: TCJSgame Documentation

Contributing
Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

License
TCJSgame is released under the MIT License.

Support
For questions and support, please open an issue on our GitHub repository.
