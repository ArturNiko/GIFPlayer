export default {
    queueableFuncs: [
        'play', 'pause',
    ],

    initThrottling(){
        Object.getOwnPropertyNames(Object.getPrototypeOf(this.parent)).forEach(prototypeName => {
            if(this.queueableFuncs.includes(prototypeName)){
                const bufferFunc = this.parent[prototypeName]

                ///overwrite
                this.parent[prototypeName] = async function (){
                    const callQueueName = this.background.initializeCall(prototypeName)
                    await this.background.awaitCallTurn(callQueueName)

                    await bufferFunc.apply(this)
                    this.background.removeCall(callQueueName)

                }.bind(this.parent)
            }
        })
    },


    initializeCall(name){
        name = name + '_' + (++this.parent.vars.calls)
        this.parent.vars.callQueue.push(name)
        return name
    },
    removeCall(name){
        this.parent.vars.callQueue.splice(this.parent.vars.callQueue.indexOf(name), 1)
    },

    awaitCallTurn(name){
        return new Promise(resolve => {
            const interval = setInterval( () => {
                if(this.parent.vars.callQueue[0] === name) {
                    clearInterval(interval)
                    setTimeout(() => {
                        resolve()
                    }, 1000 / this.parent.vars.fps)
                }
            }, 1000 / this.parent.vars.fps)
        })
    }
}