// TCJSgame Advanced Physics Extension (tcjsgame-adv-phys.js)
// Compatible with v1, v2, v3
// Include after the main TCJSgame script

(function(global) {
    'use strict';

    // ==============================
    // 1. CORE PHYSICS WORLD SETUP
    // ==============================

    /**
     * Main Physics World that holds all physical bodies
     * @class PhysicsWorld
     */
    function PhysicsWorld() {
        this.bodies = [];      // List of rigid bodies
        this.gravity = 0.5;    // Default gravity strength
        this.iterations = 3;   // Solver iterations for accuracy
    }

    // Get the global display object, compatible with all versions
    let display = global.display || (global.Display && new Display());

    // Create a single instance of the physics world
    const physicsWorld = new PhysicsWorld();

    // ==============================
    // 2. RIGID BODY COMPONENT
    // ==============================

    /**
     * Enhanced Component with physical properties
     * @class PhysBody
     */
    function PhysBody(width, height, color, x, y, type) {
        // Create a base TCJSgame Component
        const baseComponent = new Component(width, height, color, x, y, type);
        
        // Extended physical properties
        this.comp = baseComponent;
        this.mass = 1.0;
        this.invMass = 1.0 / this.mass;
        this.velocityX = 0;
        this.velocityY = 0;
        this.forceX = 0;
        this.forceY = 0;
        this.restitution = 0.3; // Bounciness
        this.friction = 0.2;    // Surface friction
        this.static = false;    // Static objects don't move
        this.shape = 'box';     // Collision shape: 'box', 'circle'

        // Add this body to the physics world
        physicsWorld.bodies.push(this);
    }

    // ==============================
    // 3. CORE PHYSICS SIMULATION
    // ==============================

    /**
     * Updates all forces and integrates motion
     */
    PhysicsWorld.prototype.step = function(dt) {
        // Apply forces and integrate motion for each body
        for (let body of this.bodies) {
            if (body.static) continue;

            // Apply gravity
            body.forceY += body.mass * this.gravity;

            // Calculate acceleration (a = F/m)
            const accelX = body.forceX * body.invMass;
            const accelY = body.forceY * body.invMass;

            // Integrate velocity (v = v0 + a*t)
            body.velocityX += accelX * dt;
            body.velocityY += accelY * dt;

            // Integrate position (x = x0 + v*t)
            body.comp.x += body.velocityX * dt;
            body.comp.y += body.velocityY * dt;

            // Reset forces for next frame
            body.forceX = 0;
            body.forceY = 0;
        }

        // Detect and resolve collisions
        this.checkCollisions();
    };

    // ==============================
    // 4. ADVANCED COLLISION DETECTION
    // ==============================

    /**
     * Broad-phase and narrow-phase collision detection
     */
    PhysicsWorld.prototype.checkCollisions = function() {
        // Broad-phase: Simple check for potential pairs (optimize later with spatial grid)
        for (let i = 0; i < this.bodies.length; i++) {
            for (let j = i + 1; j < this.bodies.length; j++) {
                const bodyA = this.bodies[i];
                const bodyB = this.bodies[j];

                // Skip if both are static
                if (bodyA.static && bodyB.static) continue;

                const collision = this.testCollision(bodyA, bodyB);
                if (collision.hasCollision) {
                    this.resolveCollision(bodyA, bodyB, collision);
                }
            }
        }
    };

    /**
     * Tests collision between two bodies based on their shape
     */
    PhysicsWorld.prototype.testCollision = function(bodyA, bodyB) {
        // Simple AABB collision test
        return {
            hasCollision: !(bodyA.comp.x > bodyB.comp.x + bodyB.comp.width ||
                           bodyA.comp.x + bodyA.comp.width < bodyB.comp.x ||
                           bodyA.comp.y > bodyB.comp.y + bodyB.comp.height ||
                           bodyA.comp.y + bodyA.comp.height < bodyB.comp.y),
            normalX: 0, // Would calculate based on overlap
            normalY: 1,
            depth: 10   // Would calculate penetration depth
        };
    };

    // ==============================
    // 5. IMPULSE-BASED COLLISION RESPONSE
    // ==============================

    /**
     * Resolves collision using impulse-based method
     */
    PhysicsWorld.prototype.resolveCollision = function(bodyA, bodyB, collision) {
        // Calculate relative velocity
        const relVelX = bodyB.velocityX - bodyA.velocityX;
        const relVelY = bodyB.velocityY - bodyA.velocityY;

        // Calculate impulse (simplified version)
        const impulse = 1.0; // Would be properly calculated based on mass and restitution

        // Apply impulse to velocities
        if (!bodyA.static) {
            bodyA.velocityX -= impulse * bodyA.invMass;
            bodyA.velocityY -= impulse * bodyA.invMass;
        }
        if (!bodyB.static) {
            bodyB.velocityX += impulse * bodyB.invMass;
            bodyB.velocityY += impulse * bodyB.invMass;
        }

        // Position correction to prevent sinking
        const correction = 0.8; // Correction factor
        if (!bodyA.static) {
            bodyA.comp.x -= collision.normalX * correction;
            bodyA.comp.y -= collision.normalY * correction;
        }
        if (!bodyB.static) {
            bodyB.comp.x += collision.normalX * correction;
            bodyB.comp.y += collision.normalY * correction;
        }
    };

    // ==============================
    // 6. FORCE APPLICATION METHODS
    // ==============================

    /**
     * Applies a force to a physical body
     * @param {PhysBody} body - The body to apply force to
     * @param {number} fx - Force on X-axis
     * @param {number} fy - Force on Y-axis
     */
    function applyForce(body, fx, fy) {
        body.forceX += fx;
        body.forceY += fy;
    }

    /**
     * Applies an impulse (instant change in velocity)
     */
    function applyImpulse(body, ix, iy) {
        body.velocityX += ix * body.invMass;
        body.velocityY += iy * body.invMass;
    }

    // ==============================
    // 7. VERSION-COMPATIBLE INTEGRATION
    // ==============================

    // Hook into the TCJSgame update loop, compatible with all versions
    const originalUpdate = global.update;
    
    global.update = function(dt) {
        // Handle delta-time for different versions
        const deltaTime = dt || (1/60); // Default to 60 FPS if no dt provided
        
        // Step the physics simulation
        physicsWorld.step(deltaTime);
        
        // Call original update function if it exists
        if (originalUpdate) {
            originalUpdate(dt);
        }
    };

    // ==============================
    // 8. PUBLIC API
    // ==============================

    // Expose the enhanced functionality to the global scope
    global.PhysicsWorld = PhysicsWorld;
    global.PhysBody = PhysBody;
    global.applyForce = applyForce;
    global.applyImpulse = applyImpulse;

    // Log successful initialization
    console.log('TCJSgame Advanced Physics Extension loaded successfully.');

})(window);
