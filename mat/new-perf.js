Display.prototype.interval = ani

function ani(){
    Mouse.x = mouse.x
        Mouse.y = mouse.y
        this.frameNo += 1;
        this.context.save();
        this.context.translate(-this.camera.x, -this.camera.y);
        try {
            update();
        } catch (e) {
            //console.error("Update error:", e);
        }
        comm.forEach(component => {
            if(component.scene == this.scene){

                component.x.move();
                try {
                    component.x.update(this.context);
                    
                } catch {
                    
                }
            }
        });
        return requestAnimationFrame(ani)
}