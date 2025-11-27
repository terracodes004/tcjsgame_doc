Display.prototype.fps = 0
Display.prototype.deltaTime = 0
Display.prototype.frame = 0
Component.prototype.cache = false
let refresh = false
let TCJSgameGameArea;

Display.prototype.perform = function () {
    Display.prototype.start = function(width = 480, height = 270, no = document.body) {
        this.canvas.width = width;
        this.canvas.height = height;
        no.insertBefore(this.canvas, no.childNodes[0]);
        TCJSgameGameArea = new Component(width, height, "black", 0, 0)
        this.interval = ani()
        this.mapWidth = this.canvas.width;
        this.mapHeight = this.canvas.height;
        this.addEventListeners();
        setInterval(()=>{
            display.deltaTime = 1/ display.fps
            refresh = true
        }, 1000)
        fake.start()
    }
}

function ani(){
    display.frame++
    
    // Update delta time logic
    if(refresh){
        display.fps = display.frame
        display.frame = 0
        refresh = false
        display.deltaTime = 1/ display.fps
    }
    
    // STEP 1: Render to fake canvas (offscreen buffer)
    fake.clear()
    fake.context.save()
    fake.context.translate(-fake.camera.x, -fake.camera.y)
    
    // Render all components to fake canvas
    commp.forEach(component => {
        if(component.scene == fake.scene){
            component.x.move()
            try {
                // Use the bUpdate method which doesn't have angle transformations
                component.x.bUpdate(fake.context)
            } catch (e) {
                console.error("Fake canvas render error:", e)
            }
        }
    })
    fake.context.restore()
    
    // STEP 2: Now render fake canvas content to main display
    display.clear()
    display.context.save()
    display.context.translate(-display.camera.x, -display.camera.y)
    
    // Draw the cached fake canvas as an image to main display
    let cachePic = new Component(display.canvas.width, display.canvas.height, 
                                fake.canvas.toDataURL(), 
                                display.camera.x, display.camera.y, "image")
    
    // Update game logic
    try {
        update(display.deltaTime) // Pass deltaTime to your update function
    } catch (e) {
        console.error("Update error:", e)
    }
    
    // Render the cached image to main display
    cachePic.update(display.context)
    
    // Also render any dynamic components that need real-time updates
    comm.forEach(component => {
        if(component.scene == display.scene){
            component.x.move()
            try {
                component.x.update(display.context)
            } catch (e) {
                console.error("Main display render error:", e)
            }
        }
    })
    
    display.context.restore()
    return requestAnimationFrame(ani)
}

let commp = []
let fake = new Display()
fake.scene = 0

fake.start = function(width = 480, height = 270, no = document.body) {
    fake.canvas.width = width
    fake.canvas.height = height
    // Hide the fake canvas - it's just an offscreen buffer
    fake.canvas.style.display = "none"
    no.appendChild(this.canvas) // Add to DOM but hidden
    fake.mapWidth = fake.canvas.width
    fake.mapHeight = fake.canvas.height
    // Add event listeners for fake canvas if needed
    fake.addEventListeners()
}

fake.add = function(x, scene = 0) {
    com = {
        x : x,
        scene : scene
    }
    commp.push(com);
}

// Remove or update fake.updat since it's handled by ani() now
fake.updat = function(){
    // This function is no longer needed since ani() handles fake canvas rendering
    console.log("fake.updat is deprecated - use ani() instead")
}

fake.refresh = function(){
    fake.clear()
    // Don't call fake.updat() here - the ani() loop handles rendering
    // If you need to force a refresh, you might need to modify the approach
}

fake.borderColor("green")
fake.borderSize("12px")
fake.borderStyle("groove")