/**
 * @name Scroller
 * @version 0.2
 * @author Artur Papikian
 * @description synchron play-on-scroll animation
 * @licence MIT
 *
 */

export default {
    name: 'scroller',

    parent: {},
    config: {},
    sectionsAt: [],

    init: function (parent){
        this.parent = parent
        this.config = this.parent.vars.plugins.config[this.name] ?? {}
        this.check()
        this.precalculate()
        this.calculate()
        this.config.target.addEventListener('scroll', () => this.scroll(), {passive: true})
        ////
    },

    check: function() {
        if(typeof this.config.flow != "undefined" && Array.isArray(this.config.flow) !== true){
            console.warn("Flow values must be passed in an array.")
            this.config.flow = [0, 1]
        }
        else if(Array.isArray(this.config.flow) && this.config.flow.some(p => typeof p != "number")) {
            console.warn("Flow step's values must be type of number between 0 and 1.")
            this.config.flow = [0, 1]
        }
        else if(typeof this.config.flow == "undefined") this.config.flow = [0, 1]
    },

    calculate: function (){

        if(this.config.target === window ){
            this.config.scrollHeight = document.body.scrollHeight - window.innerHeight
            this.config.scrollTop = this.config.target.scrollY
        }
        else{
            this.config.scrollHeight = this.config.target.scrollHeight - this.config.target.offsetHeight
            this.config.scrollTop = this.config.target.scrollTop
        }
    },

    precalculate: function(){
        this.calculate()

        this.config.flow.forEach(point => {
            this.sectionsAt.push(this.config.scrollHeight * (100 * point) / 100)
        })
    },

    scroll: function(){
        this.calculate()

    }



}
