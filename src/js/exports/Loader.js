import GIFPlayerV2 from "../../GIFPlayerV2.js"

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
                     this.parse(this, new Uint8Array(await e.target.response.arrayBuffer()), source, this.loadGifFrames, this.checkQueueStack).then(_ => {
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
    checkQueueStack(){
        //check if loadQueue empty
        if(this.parent.vars.loadQueue.list.length === this.parent.vars.loadQueue.resolved.length){
            this.flashQueueStack()
            if(this.parent.vars.state === GIFPlayerV2.states.LOADING) this.parent.vars.state = GIFPlayerV2.states.READY
        }
    },

    //RIP loader
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
        return new Promise(async (resolve, reject) => {
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
