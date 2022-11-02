/**
 * @name Scroller
 * @version 1.0
 * @author Artur Papikian
 * @description synchron play-on-scroll animation
 * @licence MIT
 *
 */

export default {
    name: 'scroller',
    parent: {},
    config: {},

    progress: 0,

    init: function (parent) {
        this.parent = parent
        this.config = this.parent.vars.plugins.config[this.name] ?? {}

        this.parent.pause()
        this.overwrite()
        ///The part below is individual
        this.check()

        this.precalculate()
        this.config.target.addEventListener('scroll', () => this.calculate(), {passive: true})
    },

    check: function () {
        if (typeof this.config.flow != "undefined" && Array.isArray(this.config.flow) !== true) {
            console.warn("Flow values must be passed in an array.")
            this.config.flow = [0, 1]
        }
        else if (Array.isArray(this.config.flow) && this.config.flow.some(p => typeof p != "number")) {
            console.warn("Flow step's values must be type of number between 0 and 1.")
            this.config.flow = [0, 1]
        }
        else if (typeof this.config.flow == "undefined") this.config.flow = [0, 1]
    },

    overwrite: function () {
        this.parent.reverse = this.reverse

        //emptying
        this.parent.play
            = this.parent.play_backward
            = this.parent.play_forward
            = this.parent.pause
            = this.parent.stop
            = function () { console.warn('This function was overwritten by the plug-in') }
    },

    reverse: function () {
        this.config.flow.reverse()
    },

    precalculate: function () {
        this.calculate('prim')

        this.config.scrollZonesHeight = this.config.scrollHeight / this.config.flow.length

        this.config.scrollZonesDelimiters = []
        this.config.flow.forEach((_, i) => this.config.scrollZonesDelimiters.push(this.config.scrollZonesHeight * i))
    },

    calculate: function (call = '') {
        if (this.config.target === window) {
            this.config.scrollHeight = document.body.scrollHeight - window.innerHeight
            this.config.scrollTop = this.config.target.scrollY
        }
        else {
            this.config.scrollHeight = this.config.target.scrollHeight - this.config.target.offsetHeight
            this.config.scrollTop = this.config.target.scrollTop
        }

        if (call !== 'prim') this.findScrollZone()
    },

    findScrollZone: function () {
        this.config.scrollZonesDelimiters.reduce((pointA, pointB) => {
            if (pointA <= this.config.scrollTop && this.config.scrollTop < pointB) {
                this.calculateStep(
                    this.config.scrollZonesDelimiters.indexOf(pointA),
                    this.config.scrollZonesDelimiters.indexOf(pointB),
                    pointA >= pointB
                )
            }

            return pointB
        })
    },

    calculateStep: function (a, b, forward) {
        const flowStepSize = this.config.flow[b] - this.config.flow[a]
        const inSectionStep = (this.config.scrollTop - this.config.scrollZonesDelimiters[a]) / this.config.scrollZonesHeight * flowStepSize
        this.progress = (this.config.flow[a] + inSectionStep) * 100
        this.set_progress()
    },

    set_progress: function () {
        this.parent.frame = Math.round(this.parent.vars.frames.length / 100 * this.progress)
    }
}
