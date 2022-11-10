/**
 * @name GIFPlayerV2
 * @version 2.1
 * @author Artur Papikian
 * @description small GIF controller
 * @licence MIT
 *
 */


import GIFLoader from "./exports/Loader.js"
import GIFPlayer from "./exports/Player.js"
import PluginsController from "./exports/PluginsController.js"
import Defaults from "./exports/Defaults.js"

export class GIFPlayerV2{

    static states = Object.freeze({
        LOADING: 'loading',
        READY: 'ready',
        PAUSED: 'paused',
        PLAYING: 'playing',
        ERROR: 'error',

        FORWARD: 'forward',
        BACKWARD: 'backward',
    })

    static AllPlugins = Object.freeze({
        Scroller: 'scroller',
        GUI: 'gui',
    })

    vars = {
        canvas: {},
        wrapper: {},
        ctx: {},
        url: '',
        frames: [],
        currIndex: 0,
        fps: 60,
        state: 'loading',
        pauseTriggered: false,
        autoplay: false,
        direction: GIFPlayerV2.states.FORWARD,
        plugins: {
            config: {},
            passed: [],
            loaded: {}
        }
    }

    static defaults = Defaults

    //Background methods
    background = {}

    constructor(url, canvasSelector, config) {
        Object.assign(this.background, GIFPlayer, GIFLoader, PluginsController)
        this.background.construct(url, canvasSelector, config, this)
    }

    //CONTROLLERS
    async play(){
        new Promise(async resolve => {
            await this.background.awaitGIFLoad()
            if (!(this.vars.state === GIFPlayerV2.states.ERROR || this.vars.state === GIFPlayerV2.states.PLAYING)){
                await this.pause()
                this.vars.state = GIFPlayerV2.states.PLAYING
                this.background.animate()
                resolve()
            }
        })
    }

    async pause() {
        new Promise(async resolve => {
            await this.background.awaitGIFLoad()
            if(!(this.vars.state === GIFPlayerV2.states.ERROR)) {
                this.vars.state = GIFPlayerV2.states.PAUSED
                resolve()
            }
        })
    }

    async play_backward(){
        this.direction = GIFPlayerV2.states.BACKWARD
        await this.play()

    }

    async play_forward(){
        this.direction = GIFPlayerV2.states.FORWARD
        await this.play()
    }

    async stop(){
        await this.pause()
        this.frame = 0
    }

    async reverse(){
        if(this.vars.direction === GIFPlayerV2.states.FORWARD) this.direction = GIFPlayerV2.states.BACKWARD
        else this.direction = GIFPlayerV2.states.FORWARD
    }

    //GIF Mutators

    async shuffle_frames(){
        await this.background.awaitGIFLoad()
        //https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
        for (let i = this.vars.frames.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[this.vars.frames[i], this.vars.frames[j]] = [this.vars.frames[j], this.vars.frames[i]]
        }

    }

    async add_frame(source){
        await this.background.awaitGIFLoad(source)
        try{
            await this.background.loadGifFrames(source)
        }
        catch (e){
            console.error("Passed source doesn't provide any image.")
        }
    }

    async remove_frame(index){
        if(this.vars.frames[index]) this.vars.frames.splice(index, 1)
    }


    async add_gif(gif){
        const stateBuffer = this.vars.state
        const directionBuffer = this.vars.direction

        await this.pause()
        this.vars.direction = GIFPlayerV2.states.FORWARD
        this.vars.state = GIFPlayerV2.states.LOADING

        await this.background.loadGif(gif)
        await this.background.awaitGIFLoad()

        this.vars.direction = directionBuffer
        if(stateBuffer === GIFPlayerV2.states.PLAYING) await this.play()
    }



    //SETTERS

    set direction(direction){
        //also frames mutator
        const frame = this.vars.frames[this.vars.currIndex]

        if(direction === GIFPlayerV2.states.BACKWARD){
            if(this.vars.direction === GIFPlayerV2.states.FORWARD) this.vars.frames.reverse()
            this.vars.direction = direction
        }

        else if(direction === GIFPlayerV2.states.FORWARD){
            if(this.vars.direction === GIFPlayerV2.states.BACKWARD) this.vars.frames.reverse()
            this.vars.direction = direction

        }
        this.frame = this.vars.frames.indexOf(frame)
    }

    set fps(fps){
        if(fps instanceof Number && Math.ceil(fps) <= 0) return
        this.vars.fps = Math.ceil(fps)
    }

    set frame(index){
        return new Promise(async resolve => {
            await this.background.awaitGIFLoad()

            if(this.vars.state !== GIFPlayerV2.states.ERROR){
                if((typeof index === 'number') && (index >= 0 && index < this.vars.frames.length)) this.vars.currIndex = index
                if(this.vars.state !== GIFPlayerV2.states.PLAYING) this.background.draw()
            }
            resolve()
        })
    }


    //GETTERS
    get all()                       { return this.vars }
    get canvas()                    { return this.vars.canvas }
    get wrapper()                   { return this.vars.wrapper }
    get state()                     { return this.vars.state }
    get frames_length()             { return this.vars.frames.length }
    get current_frame_index()       { return this.vars.currIndex }
    get_frame(index)                { return (index >= 0 && index < this.vars.frames.length) ? this.vars.frames[index] : this.vars.frames[this.vars.currIndex] }

}

if(typeof module != "undefined") module.exports.GIFPlayerV2 = GIFPlayerV2