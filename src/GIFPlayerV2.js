/**
 * @name GIFPlayerV2
 * @version 2.4.1
 * @author Artur Papikian
 * @description small GIF controller
 * @licence MIT
 *
 */


import GIFLoader from "./exports/Loader.js"
import GIFPlayer from "./exports/Player.js"
import PluginsController from "./exports/PluginsController.js"
import Validator from "./exports/Validator.js"
import Defaults from "./exports/Defaults.js"

export default class GIFPlayerV2{
    static states = Object.freeze({
        LOADING: 'loading',
        READY: 'ready',
        PAUSED: 'paused',
        PLAYING: 'playing',
        ERROR: 'error',

        FORWARD: 'forward',
        BACKWARD: 'backward',

        //loop
        //once
    })

    static AllPlugins = Object.freeze({
        Scroller: 'scroller',
        GUI: 'gui',
    })

    vars = {
        canvas: {},
        wrapper: {},
        ctx: {},
        gifs: [],
        frames: [],

        queue: {
            list: [],
            resolved: [],
        },

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
        Object.assign(this.background, GIFPlayer, GIFLoader, PluginsController, Validator)
        this.background.construct(url, canvasSelector, config, this)
    }

    //CONTROLLERS
    play(){
        return new Promise(async resolve => {
            await this.background.awaitGIFLoad()
            if (!(this.vars.state === GIFPlayerV2.states.ERROR || this.vars.state === GIFPlayerV2.states.PLAYING)){

                await this.pause()
                this.vars.state = GIFPlayerV2.states.PLAYING
                this.background.animate()
                resolve()
            }
        })
    }

    pause() {
        return new Promise(async resolve => {
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

    async step(){
        this.frame = this.vars.frames[this.current_frame_index + 1] ? this.current_frame_index + 1 : 0
    }

    async step_back(){
        this.frame = this.vars.frames[this.current_frame_index - 1] ? this.current_frame_index - 1 : this.vars.frames.length - 1
    }

    //GIF MUTATORS
    async shuffle_frames(){
        await this.background.awaitGIFLoad()
        //https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
        for (let i = this.vars.frames.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[this.vars.frames[i], this.vars.frames[j]] = [this.vars.frames[j], this.vars.frames[i]]
        }

    }

    async add_frames(...sources){
        await this.background.awaitGIFLoad()
        this.background.validateURLS(sources)
        await this.background.loadGifFrames(sources)
    }

    async remove_frames(...indexes){
        const stateBuffer = this.vars.state

        let bufferedFrameIndex = this.current_frame_index
        const toRemove = []
        indexes.forEach(index => {
            if(this.get_frame(index)) toRemove.push(this.get_frame(index))
        })

        toRemove.forEach(frame => {
            this.vars.gifs.forEach(url => {
                const i = this.vars.gifs.indexOf(url)
                if(url.frames.includes(frame)){
                    this.vars.gifs[i].frames.splice(this.vars.gifs[i].frames.indexOf(frame), 1)
                }
                if(this.vars.gifs[i].frames.length === 0) this.vars.gifs.splice(i , 1)
            })

            this.vars.frames.splice(this.vars.frames.indexOf(frame), 1)
            this.frame = 0
        })
    }


    async remove_gifs(...gifs){
        const frames = []
        gifs.forEach(gif => {
            this.vars.gifs.forEach(url => {
                if(url.src === gif) url.frames.forEach(frame => frames.push(this.vars.frames.indexOf(frame)))
            })
        })

        await this.remove_frames(...frames)
    }

    async add_gifs(...gifs){
        await this.background.awaitGIFLoad()
        this.background.validateURLS(gifs)

        await this.background.loadGif(gifs)
    }


    //SETTERS
    set direction(direction){
        //also frames mutator
        const frame = this.vars.frames[this.vars.currIndex]

        if(direction === GIFPlayerV2.states.BACKWARD){
            if(this.direction === GIFPlayerV2.states.FORWARD) this.vars.frames.reverse()
            this.vars.direction = direction
        }

        else if(direction === GIFPlayerV2.states.FORWARD){
            if(this.direction === GIFPlayerV2.states.BACKWARD) this.vars.frames.reverse()
            this.vars.direction = direction

        }
        this.frame = this.vars.frames.indexOf(frame)
    }

    set fps(fps){
        this.background.validateFPS(fps)
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
    get current_frame()             { return this.vars.frames[this.current_frame_index]}
    get direction()                 { return this.vars.direction }
    get fps()                       { return this.vars.fps }
    //get gifs()                      { return this.vars.gifs}
    get_frame(index)                { return (index >= 0 && index < this.vars.frames.length) ? this.vars.frames[index] : this.vars.frames[this.vars.currIndex] }

}