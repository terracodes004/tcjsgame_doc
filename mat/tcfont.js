class Tctxt extends Component{
    constructor(size = "16px", font = "Arial", color = "black", x = 0, y = 0, 
                align = "left", storke = false, baseline = "alphabetic", 
                background = null, paddingX = 0, paddingY = 0) {
        super(size, font, color, x, y, "text")
        this.size = size
        this.font = font
        this.color = color
        this.x = x
        this.y = y
        this.align = align
        this.storke = storke
        this.text = ""
        this.baseline = baseline
        this.background = background
        this.paddingX = paddingX
        this.paddingY = paddingY
    }
    update(ctx=display.context){
        this.rect()
        if(this.storke){
            ctx.font =  `${this.size} ${this.font}`;

            ctx.strokeStyle = this.color
            ctx.textBaseline = this.baseline
            ctx.textAlign = this.align
            this.textWidth = ctx.measureText(this.text).width
            ctx.strokeText(this.text, this.x, this.y)
            
        }else{
            ctx.font = `${this.size} ${this.font}`;
            ctx.fillStyle = this.color
            ctx.textBaseline = this.baseline
            ctx.textAlign = this.align
            this.textWidth = ctx.measureText(this.text).width
            ctx.fillText(this.text, this.x, this.y)
        }
    }
    bUpdate(ctx = display.context){
        this.rect()
        if(this.storke){
            ctx.font = this.size+ " "+ this.font
            ctx.strokeStyle = this.color
            ctx.textAlign = this.align
            this.textWidth = ctx.measureText(this.text).width
            ctx.textBaseline = this.baseline
            
            ctx.strokeText(this.text, this.x, this.y)
        }else{
            ctx.font = this.size+ " "+ this.font
            ctx.fillStyle = this.color
            ctx.textAlign = this.align
            this.textWidth = ctx.measureText(this.text).width
            ctx.textBaseline = this.baseline
            
            ctx.fillText(this.text, this.x, this.y)
        }
    }
    setText(txt){
        this.text = txt
        return this.text
    }
    rect(ctx = display.context){
        let xx = this.x
        let yy = this.y
        if(this.align == "right"){
            xx = this.x - this.textWidth
        }
        if(this.align == "center"){
            xx = this.x - this.textWidth/2
        }
        ctx.fillStyle = this.background
        ctx.fillRect(xx-this.paddingX/2, this.y-this.paddingY/2, this.textWidth+ this.paddingX, Number(this.size.replace("px", ""))+this.paddingY)
    }
}