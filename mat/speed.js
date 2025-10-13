Display.prototype.start = function(width = 480, height = 270, no = document.body) {
    this.canvas.width = width;
    this.canvas.height = height;
    no.insertBefore(this.canvas, no.childNodes[0]);
    
    // REPLACE the setInterval with requestAnimationFrame
    this.interval = requestAnimationFrame(ani); // Start the animation loop
    
    this.mapWidth = this.canvas.width;
    this.mapHeight = this.canvas.height;
    this.addEventListeners();
}

Display.prototype.stop = function() {
    // Cancel the animation frame instead of clearing interval
    cancelAnimationFrame(this.interval);
}

function ani(){
    Mouse.x = mouse.x;
    Mouse.y = mouse.y;
    
    display.clear();
    
    display.frameNo += 1;
    display.context.save();
    display.context.translate(-display.camera.x, -display.camera.y);
    
    try {
        update();
    } catch (e) {
        //console.error("Update error:", e);
    }
    
    comm.forEach(component => {
        if(component.scene == display.scene){
            component.x.move();
            try {
                component.x.update(display.context);
            } catch {
                // Handle error
            }
        }
    });
    
    display.context.restore();
    
    // Continue the loop by requesting next frame
    display.interval = requestAnimationFrame(ani);
}
