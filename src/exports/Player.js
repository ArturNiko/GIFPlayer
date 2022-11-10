import {GIFPlayerV2} from "../GIFPlayerV2.js";

export default {
    helpers: {
        isHTMLElement: function(v) { return v instanceof Element},
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
        if (this.helpers.isHTMLElement(document.querySelector(canvasSelector)) !== true) throw new Error('Invalid HTML element.')

        if (typeof config.player.fps != 'undefined' && !(typeof config.player.fps == 'number' && Math.ceil(config.player.fps) >= 0))
            throw new Error('Passed FPS limiter must be a positiv number.')

        if(typeof config.plugins != "undefined" && Array.isArray(config.plugins) !== true) {
                console.warn("Plug-ins should be passed in an array.")
                config.plugins = [config.plugins]
        }
        else if(typeof config.plugins == "undefined") config.plugins = []

    },

    construct(url, canvasSelector, config, parent){
        config.player = config.player ?? {}
        config.plugins = config.plugins ?? GIFPlayerV2.AllPlugins.GUI

        this.validate(canvasSelector, config)

        this.parent = parent
        this.parent.vars.wrapper = document.querySelector(canvasSelector)
        this.parent.vars.url = url

        this.parent.vars.autoplay = config.player.autoplay === true
        this.parent.vars.currIndex = this.helpers.isWholeNumber(config.player.frame) ? config.player.frame : this.parent.vars.currIndex
        this.parent.vars.fps = config.player.fps ?? Math.ceil(this.parent.vars.fps)

        this.parent.vars.plugins.passed = config.plugins
        Object.entries(config).forEach(entry => {
            const [key, value] = entry
            if(key !== 'player' && key !== 'plugins') {
                this.parent.vars.plugins.config[key] = value
                delete config[key]
            }
        })

        this.build()
        this.init(config).then(_ => this.lookForPlugins())
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

    build: function(){
        this.parent.vars.canvas = document.createElement('canvas')
        this.parent.vars.canvas.style = `
            width: 100%;
            height: 100%;
        `
        this.parent.vars.wrapper.appendChild(this.parent.vars.canvas)
        this.parent.vars.ctx = this.parent.vars.canvas.getContext('2d')
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