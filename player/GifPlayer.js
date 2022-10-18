/**
 * @name GifPlayer
 * @version 1.1
 * @author Artur Papikian
 * @description small GIF controller
 * @licence MIT
 *
 */

class GifPlayer {
    static states = Object.freeze({
        LOADING: 0,
        READY: 1,
        PAUSED: 2,
        PLAYING: 3,
        ERROR: 4,

        FORWARD: 5,
        BACKWARD: 6,

    })

    #vars = {
        canvas: {},
        url: '',
        frames: [],
        currIndex: 0,
        state: 0,
        pauseTriggered: false,
        debug: false,
        autoplay: false,
        direction: GifPlayer.states.FORWARD,
        reversed: false

    }

    #helpers = {
        isCanvas: (v) => { return v instanceof Element && v.tagName === 'CANVAS'},
        isNumber: (v) => { return typeof v == 'number' || v instanceof Number},
        isWholeNumber: (v) => { return this.#helpers.isNumber(v) && v > 0 && Math.round(v) === v },
        isValidUrl: (v) => {
            try {
                new URL(v)
                return true
            } catch {
                return false
            }
        },
        isUndefined: (v) => { return typeof v == 'undefined'},
    }

    constructor(url, canvasSelector, config){
        this.#validate(canvasSelector)

        this.#vars.canvas = document.querySelector(canvasSelector)
        this.#vars.url = url
        this.direction = config.player && config.player.direction ? config.player.direction : this.#vars.direction
        this.#vars.autoplay = config.player && config.player.autoplay ? config.player.autoplay : this.#vars.autoplay
        this.#vars.reversed = this.#vars.direction !== GifPlayer.states.BACKWARD

        this.#init().then()
    }


    #validate(canvasSelector){
        if(this.#helpers.isCanvas(document.querySelector(canvasSelector)) !== true) throw new Error('Invalid canvas element.')
    }

    //INIT
    async #init(){
        await this.#loadGif()

        if(this.#vars.state === GifPlayer.states.READY){
            this.#vars.canvas.height = this.#vars.frames[this.#vars.currIndex].naturalHeight
            this.#vars.canvas.width = this.#vars.frames[this.#vars.currIndex].naturalWidth

            if(this.#vars.autoplay === true){
                await this.play()
            }
            else await this.set_frame(this.#vars.currIndex)

        }
    }

    //CONTROLLERS
    play(){
        new Promise(async resolve => {
            await this.#onload().catch(er => {
                throw new Error(er)
            })
            if (!(this.#vars.state === GifPlayer.states.ERROR || this.#vars.state === GifPlayer.states.PLAYING)){
                this.#vars.state = GifPlayer.states.PLAYING
                this.#animate()
                resolve()
            }
        })
    }


    pause() {
        new Promise(async resolve => {
            await this.#onload().catch(er => {
                throw new Error(er)
            })
            if(!(this.#vars.state === GifPlayer.states.ERROR)) {
                if(this.#vars.state === GifPlayer.states.PLAYING) this.#vars.pauseTriggered = true
                this.#vars.state = GifPlayer.states.PAUSED
                resolve()
            }
        })
    }

    async play_backward(){
        this.direction = GifPlayer.states.BACKWARD
        await this.play()

    }

    async play_forward(){
        this.direction = GifPlayer.states.FORWARD
        await this.play()
    }

    async stop(){
        await this.#onload().catch(er => {
            throw new Error(er)
        })
        await this.pause()
        if(this.#vars.direction === GifPlayer.states.FORWARD && this.#vars.currIndex !== 0) await this.set_frame(0)
        else if(this.#vars.currIndex !== this.#vars.frames.length - 1) await this.set_frame(this.#vars.frames.length -1)

    }

    //SETTERS
    set direction(direction){
        const frame = this.#vars.frames[this.#vars.currIndex]
        if(direction === GifPlayer.states.BACKWARD){
            if(this.#vars.reversed !== true) { this.#vars.frames.reverse() }
            this.#vars.direction = direction
            this.#vars.reversed = true
        }
        else if(direction === GifPlayer.states.FORWARD){
            if(this.#vars.reversed === true) this.#vars.frames.reverse()
            this.#vars.direction = direction
            this.#vars.reversed = false
        }
        this.set_frame(this.#vars.frames.indexOf(frame))
    }

    async set_frame(index = this.#vars.currIndex){
        return new Promise(async resolve => {
            await this.#onload().catch(er => {
                throw new Error(er)
            })

            if(this.#vars.state !== GifPlayer.states.ERROR){

                if((typeof index === 'number') && (index >= 0 && index < this.#vars.frames.length)){
                    this.#vars.currIndex = index
                    this.#vars.currIndex = this.#vars.reversed === true ? this.frames_length - this.#vars.currIndex - 1 : this.#vars.currIndex
                    console.log(this.#vars.currIndex)
                }

                if(this.#vars.state !== GifPlayer.states.PLAYING) this.#draw()
            }
            resolve()
        })
    }

    //GETTERS
    get all()                       { return this.#vars }
    get canvas()                    { return this.#vars.canvas }
    get state()                     { return this.#vars.state }
    get frames_length()             { return this.#vars.frames.length }
    get current_frame_index()       { return this.#vars.currIndex }
    get_frame(index)                { return (index >= 0 && index < this.#vars.frames.length) ? this.#vars.frames[index] : this.#vars.frames[this.#vars.currIndex] }

    //LOAD & PARSE
    #loadGif() {
         return new Promise(resolve => {
            const xhr = new XMLHttpRequest()
            xhr.open('GET', this.#vars.url)
            xhr.responseType = 'blob'
            xhr.onload = async (e) => {
                if(xhr.status === 404){
                    this.#vars.state = GifPlayer.states.ERROR
                    console.warn("File not found.")
                }

                await this.#parseGif(new Uint8Array(await e.target.response.arrayBuffer())).then(_ => { resolve() })
            }
            xhr.onerror = () => {
                this.#vars.state = GifPlayer.states.ERROR
                console.warn("Load error.")
            }
            xhr.send()
        })
    }

    #parseGif(gif) {
        return new Promise(async resolve => {
            let pos = 0
            let delayTimes = []
            let graphicControl = null
            let imageData = null
            let frames = []
            let loopCnt = 0
            if (gif[0] === 0x47 && gif[1] === 0x49 && gif[2] === 0x46 && // 'GIF'
                gif[3] === 0x38 && gif[4] === 0x39 && gif[5] === 0x61) { // '89a'

                pos += 13 + +!!(gif[10] & 0x80) * Math.pow(2, (gif[10] & 0x07) + 1) * 3
                let gifHeader = gif.subarray(0, pos)
                while (gif[pos] && gif[pos] !== 0x3b) {
                    let offset = pos, blockId = gif[pos]
                    if (blockId === 0x21) {
                        let label = gif[++pos]
                        if ([0x01, 0xfe, 0xf9, 0xff].indexOf(label) !== -1) {
                            label === 0xf9 && (delayTimes.push((gif[pos + 3] + (gif[pos + 4] << 8)) * 10))
                            label === 0xff && (loopCnt = gif[pos + 15] + (gif[pos + 16] << 8))
                            while (gif[++pos]) pos += gif[pos]
                            label === 0xf9 && (graphicControl = gif.subarray(offset, pos + 1))
                        } else {
                            this.#vars.state = GifPlayer.states.ERROR
                            throw new Error("Couldn't parse the GIF")
                        }
                    } else if (blockId === 0x2c) {
                        pos += 9
                        pos += 1 + +!!(gif[pos] & 0x80) * (Math.pow(2, (gif[pos] & 0x07) + 1) * 3)
                        while (gif[++pos]) pos += gif[pos]
                        imageData = gif.subarray(offset, pos + 1)
                        frames.push(URL.createObjectURL(new Blob([gifHeader, graphicControl, imageData], {type: 'image/jpeg'})))
                        await this.#loadGifFrames(frames[frames.length - 1])
                    } else {
                        this.#vars.state = GifPlayer.states.ERROR
                        throw new Error("Couldn't parse the GIF")
                    }
                    pos++

                    if(!(gif[pos] && gif[pos] !== 0x3b)) this.#vars.state = GifPlayer.states.READY
                }
                resolve()
            }
        })
    }

    #loadGifFrames(src){
         return new Promise(resolve => {
            let frame = new Image()
            frame.src = src
            frame.onload = ()=> {
                this.#vars.frames.push(frame)
                resolve()
            }
        })
    }

    //CANVAS
    #draw(){
        const ctx = this.#vars.canvas.getContext('2d')
        ctx.drawImage(this.#vars.frames[this.#vars.currIndex], 0, 0)
    }

    #animate(){
        if(this.#vars.state !== GifPlayer.states.PLAYING || this.#vars.pauseTriggered){
            this.#vars.pauseTriggered = false
            return
        }
        this.#vars.currIndex = this.#vars.currIndex === this.#vars.frames.length - 1 ? 0 : ++this.#vars.currIndex

        this.#draw()
        requestAnimationFrame(() => this.#animate())
    }

    //TOOLS
    #onload(){
         return new Promise(async (resolve, reject) => {
            if (this.#vars.state === GifPlayer.states.LOADING) {
                const timeout   = 5000
                let begin       = (performance || Date).now()
                setTimeout(async ()=> {},0)
                let awaitForReady = setInterval(async ()=>{
                    if(this.#vars.state !== GifPlayer.states.LOADING){
                        clearInterval(awaitForReady)
                        resolve()
                    }
                    if((performance || Date).now() - begin > timeout) {
                        clearInterval(awaitForReady)
                        reject('Time limit exceed')
                    }
                }, 16.666)
            }
            else resolve()
        })
    }

}