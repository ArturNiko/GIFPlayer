import {GIFPlayerV2} from "../GIFPlayerV2.js";

export default {
    helpers: {
        isCanvas: function(v) { return v instanceof Element && v.tagName === 'CANVAS' },
        isNumber: function(v) { return  typeof v == 'number' || v instanceof Number },
        isWholeNumber: function(v) { return this.isNumber(v) && v > 0 && Math.round(v) === v},
        isUndefined: function(v)  { return typeof v == 'undefined' },
        isValidUrl: function(v) {
            try {
                new URL(v)
                return true
            } catch {
                return false
            }
        }
    },

    validate: function (canvasSelector, config) {
        if (this.helpers.isCanvas(document.querySelector(canvasSelector)) !== true) throw new Error('Invalid canvas element.')

        if (typeof config.player.fps != 'undefined' && !(typeof config.player.fps == 'number' && Math.ceil(config.player.fps) >= 0))
            throw new Error('Passed FPS limiter must be a number and higher than 0.')

    },

    construct(url, canvasSelector, config, parent){
        config.player = config.player ?? {}
        this.validate(canvasSelector, config)

        this.parent = parent
        this.parent.vars.canvas = document.querySelector(canvasSelector)
        this.parent.vars.ctx = this.parent.vars.canvas.getContext('2d')
        this.parent.vars.url = url


        this.parent.vars.autoplay = config.player.autoplay === true
        this.parent.vars.currIndex = this.helpers.isWholeNumber(config.player.frame) ? config.player.frame : this.parent.vars.currIndex
        this.parent.vars.fps = config.player.fps ?? Math.ceil(this.parent.vars.fps)

        this.init(config).then()
    },

    //INIT
    init: async function(config){
        this.loadGif()
        await this.awaitGIFLoad()

        if(this.parent.vars.state === GIFPlayerV2.states.READY){
            this.parent.vars.currIndex = this.parent.frames_length <= this.parent.vars.currIndex ? 0 : this.parent.vars.currIndex
            this.parent.vars.canvas.height = this.parent.vars.frames[this.parent.vars.currIndex].naturalHeight
            this.parent.vars.canvas.width = this.parent.vars.frames[this.parent.vars.currIndex].naturalWidth

            if(this.parent.vars.autoplay === true){
                if(config.player.direction === 'backward') await this.parent.play_backward()
                else this.parent.play_forward().then()
            }
            else this.draw()
        }
    },


    //CANVAS
    draw: function (){
        this.parent.vars.ctx.drawImage(this.parent.vars.frames[this.parent.vars.currIndex], 0, 0)
    },

    animate: function (){
        this.parent.vars.currIndex = this.parent.vars.currIndex === this.parent.vars.frames.length - 1 ? 0 : ++this.parent.vars.currIndex

        this.draw()

        setTimeout(() => {
            if(this.parent.vars.state === GIFPlayerV2.states.PAUSED) cancelAnimationFrame(this.animate)
            else requestAnimationFrame(this.animate.bind(this))
        }, 1000 / this.parent.vars.fps)
    },
}