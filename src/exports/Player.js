import GIFPlayerV2 from "../GIFPlayerV2.js"

export default {
    helpers: {
        isHTMLElement(v) { return v instanceof Element},
        isNumber(v) { return  typeof v == 'number' || v instanceof Number },
        isPositivNumber(v) { return this.isNumber(v) && v > 0 && Math.round(v) === v},
        isUndefined(v)  { return typeof v == 'undefined' },
        isValidUrl(v) {
            try {
                new URL(v)
                return true
            } catch {
                return false
            }
        }
    },

    construct(urls, wrapperSelector, config, parent){
        config.player = config.player ?? {}
        config = this.validate(wrapperSelector, config, urls)

        this.parent = parent
        this.parent.vars.wrapper = document.querySelector(wrapperSelector)

        this.parent.vars.autoplay = config.player.autoplay === true
        this.parent.vars.currIndex = this.helpers.isPositivNumber(config.player.current_frame) ? config.player.frame : this.parent.vars.currIndex
        this.parent.vars.fps = config.player.fps ?? Math.ceil(this.parent.vars.fps)

        this.build()
        this.setUpPlugIns(config)
        this.init(config, urls).then()
    },

    //INIT
    async init(config, urls) {
        this.initThrottling()
        await this.loadGif(urls)
        await this.awaitGIFLoad()

        if(this.parent.vars.state === GIFPlayerV2.states.READY){
            this.parent.vars.currIndex = this.parent.frames_length <= this.parent.vars.currIndex ? 0 : this.parent.vars.currIndex

            if(this.parent.vars.autoplay === true){
                if(config.player.direction === 'backward') await this.parent.play_backward()
                else this.parent.play_forward().then()
            }
            else this.draw()
        }

    },

    build(){
        this.parent.vars.canvas = document.createElement('canvas')
        this.parent.vars.canvas.style = `
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
        `
        this.parent.vars.wrapper.appendChild(this.parent.vars.canvas)
        this.parent.vars.ctx = this.parent.vars.canvas.getContext('2d')
    },

    //CANVAS
    draw(){
        this.setCanvasSize()
        this.parent.vars.ctx.drawImage(this.parent.vars.frames[this.parent.vars.currIndex], 0, 0)
    },

    animate(){
        this.parent.vars.currIndex = this.parent.vars.currIndex === this.parent.vars.frames.length - 1 ? 0 : ++this.parent.vars.currIndex

        this.draw()

        setTimeout(() => {
            if(this.parent.vars.state === GIFPlayerV2.states.PAUSED) cancelAnimationFrame(this.animate)
            else requestAnimationFrame(this.animate.bind(this))
        }, 1000 / this.parent.vars.fps)
    },

    setCanvasSize(){
        if(this.parent.vars.canvas.height === this.parent.vars.frames[this.parent.vars.currIndex].naturalHeight
            && this.parent.vars.canvas.width === this.parent.vars.frames[this.parent.vars.currIndex].naturalWidth) return

        this.parent.vars.canvas.height = this.parent.vars.frames[this.parent.vars.currIndex].naturalHeight
        this.parent.vars.canvas.width = this.parent.vars.frames[this.parent.vars.currIndex].naturalWidth
    }
}