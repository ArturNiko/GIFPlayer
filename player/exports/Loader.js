import {GIFPlayerV2} from "../GIFPlayerV2.js";

export default {
    //LOAD & PARSE
    loadGif: function () {
        const xhr = new XMLHttpRequest()
        xhr.open('GET', this.parent.vars.url)
        xhr.responseType = 'blob'
        xhr.onload = async (e) => {
            if(xhr.status === 404){
                this.parent.vars.state = GIFPlayerV2.states.ERROR
                throw new Error("File not found.")
            }
            await this.parseGif(new Uint8Array(await e.target.response.arrayBuffer()))
        }
        xhr.onerror = () => {
            this.parent.vars.state = GIFPlayerV2.states.ERROR
            throw new Error("Load error.")
        }
        xhr.send()
    },
    parseGif: async function (gif) {
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
                        this.parent.vars.state = GIFPlayerV2.states.ERROR
                        throw new Error("Couldn't parse the GIF")
                    }
                } else if (blockId === 0x2c) {
                    pos += 9
                    pos += 1 + +!!(gif[pos] & 0x80) * (Math.pow(2, (gif[pos] & 0x07) + 1) * 3)
                    while (gif[++pos]) pos += gif[pos]
                    imageData = gif.subarray(offset, pos + 1)
                    frames.push(URL.createObjectURL(new Blob([gifHeader, graphicControl, imageData], {type: 'image/jpeg'})))
                    await this.loadGifFrames(frames.at( - 1))
                } else {
                    this.parent.vars.state = GIFPlayerV2.states.ERROR
                    throw new Error("Couldn't parse the GIF")
                }
                pos++
                if(!(gif[pos] && gif[pos] !== 0x3b)) this.parent.vars.state = GIFPlayerV2.states.READY
            }
        }
        else {
            this.parent.vars.state = GIFPlayerV2.states.ERROR
            throw new Error("Exstansion not supported.")
        }
    },

    loadGifFrames: function (src){
        return new Promise(resolve => {
            let frame = new Image()
            frame.src = src
            frame.onload = ()=> {
                this.parent.vars.frames.push(frame)
                resolve()
            }
        })
    },

    awaitGIFLoad: function (){
        return new Promise(async (resolve) => {
            if (this.parent.vars.state === GIFPlayerV2.states.LOADING) {
                const timeout   = 40000
                let begin       = (performance || Date).now()
                //setTimeout(async ()=> {},0)
                let awaitForReady = setInterval(async ()=>{
                    if(this.parent.vars.state !== GIFPlayerV2.states.LOADING){
                        clearInterval(awaitForReady)
                        resolve()
                    }
                    if((performance || Date).now() - begin > timeout) {
                        clearInterval(awaitForReady)
                        throw new Error("Load time limit exceeded.")
                    }
                }, 20)
            }
            else resolve()
        })
    },
}