import GIFPlayerV2 from "../GIFPlayerV2.js"

export default {
    //LOAD & PARSE
     async loadGif(gifs = []) {

         this.addToQueueStack(gifs)
         for(const source of this.parent.vars.loadQueue.list){
             await new Promise(async (resolve, reject) => {

                 const xhr = new XMLHttpRequest()
                 xhr.open('GET', source)
                 xhr.responseType = 'blob'
                 xhr.onload = async (e) => {
                     if(xhr.status === 404){
                         this.parent.vars.state = GIFPlayerV2.states.ERROR
                         reject("File not found.")
                     }

                     this.parent.vars.gifs.push({
                         src: source,
                         frames: [],
                     })

                     this.parseGif(new Uint8Array(await e.target.response.arrayBuffer()), source).then(_ => {
                         resolve()
                     }).catch(err => {
                         this.parent.vars.state = GIFPlayerV2.states.ERROR
                         reject(err)
                     })
                     this.addToResolvedQueueStack(source)
                 }
                 xhr.onerror = () => {
                     this.parent.vars.state = GIFPlayerV2.states.ERROR
                     reject("File not found.")
                 }
                 xhr.send()
             })
         }
    },

    addToQueueStack(urls){
        if(Array.isArray(urls) !== true) urls = [urls]
        urls.forEach(url => this.parent.vars.loadQueue.list.push(url))
    },
    addToResolvedQueueStack(url){
        this.parent.vars.loadQueue.resolved.push(url)
    },
    flashQueueStack(){
        this.parent.vars.loadQueue.list = []
        this.parent.vars.loadQueue.resolved = []
    },

    parseGif(gif, src) {
        return new Promise(async (resolve, reject) => {
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
                        } else reject("Couldn't parse the GIF.")
                    } else if (blockId === 0x2c) {
                        pos += 9
                        pos += 1 + +!!(gif[pos] & 0x80) * (Math.pow(2, (gif[pos] & 0x07) + 1) * 3)
                        while (gif[++pos]) pos += gif[pos]
                        imageData = gif.subarray(offset, pos + 1)
                        frames.push(URL.createObjectURL(new Blob([gifHeader, graphicControl, imageData], {type: 'image/jpeg'})))
                        await this.loadGifFrames(frames.at( - 1), src)
                    } else reject("Couldn't parse the GIF.")

                    pos++
                    if(!(gif[pos] && gif[pos] !== 0x3b)) {
                        //check if loadQueue empty
                        if(this.parent.vars.loadQueue.list.length === this.parent.vars.loadQueue.resolved.length){
                            this.flashQueueStack()
                            if(this.parent.vars.state === GIFPlayerV2.states.LOADING) this.parent.vars.state = GIFPlayerV2.states.READY
                        }
                        resolve()
                    }
                }
            }
            else reject("File type not supported.")
        })
    },

    loadGifFrames(src, gifSrc){
        return new Promise(resolve => {
            let frame = new Image()
            frame.src = src
            frame.onload = () => {
                this.parent.vars.frames.push(frame)
                this.parent.vars.gifs.forEach((gif, i) => {
                    if(gif.src === gifSrc) this.parent.vars.gifs[i].frames.push(frame)
                })
                resolve()
            }
        })
    },

    awaitGIFLoad(){
        return  new Promise(async (resolve, reject) => {
            if (this.parent.vars.state === GIFPlayerV2.states.LOADING) {
                const timeout   = 4000
                let begin       = (performance || Date).now()
                let awaitForReady = setInterval(async ()=>{
                    if(this.parent.vars.state !== GIFPlayerV2.states.LOADING){
                        clearInterval(awaitForReady)
                        resolve()
                    }
                    if((performance || Date).now() - begin > timeout) {
                        clearInterval(awaitForReady)
                        reject("Load time limit exceeded.")
                    }
                }, 20)
            }
            else resolve()
        })
    },
}
