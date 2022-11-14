/**
 * @name Scroller
 * @version 1.1.2
 * @author Artur Papikian
 * @description synchron play-on-scroll animation
 * @licence MIT
 *
 */

export default class Scroller{
    name = 'scroller'
    parent = {}
    config = {}

    progress = 0

    constructor(parent) {
        this.parent = parent
        this.config = this.parent.vars.plugins.config[this.name] ?? {}
        this.check()
        this.init()
    }

    init(parent) {
        this.parent.pause()
        this.overwrite()
        this.precalculate()

        this.config.target.addEventListener('scroll', () => this.calculate(), {passive: true})
    }

    check() {
        if (typeof this.config.flow != "undefined" && Array.isArray(this.config.flow) !== true) {
            console.warn("Flow values must be passed in an array.")
            this.config.flow = [0, 1]
        }
        else if (Array.isArray(this.config.flow) && this.config.flow.some(p => typeof p != "number")) {
            console.warn("Flow step's values must be a number between 0 and 1.")
            this.config.flow = [0, 1]
        }
        else if (typeof this.config.flow == "undefined") this.config.flow = [0, 1]

        if(this.parent.background.helpers.isHTMLElement(this.config.target) !== true && this.config.target !== window) {
            this.config.target = window
        }
    }

    overwrite() {
        this.parent.reverse = this.reverse

        //emptying
        this.parent.play
            = this.parent.play_backward
            = this.parent.play_forward
            = this.parent.step_backward
            = this.parent.step_forward
            = this.parent.pause
            = this.parent.stop
            = this.parent.step
            = function () { console.warn('This function was overwritten by the plug-in') }

        this.parent.vars.flow = this.config.flow
    }

    reverse() {
        this.vars.plugins.loaded.scroller.config.flow.reverse()
        this.vars.plugins.loaded.scroller.calculate()
    }

    precalculate() {
        this.calculate()
        this.config.scrollZonesHeight = this.config.scrollHeight / (this.config.flow.length - 1)

        this.config.scrollZonesDelimiters = []
        this.config.flow.forEach((_, i) => this.config.scrollZonesDelimiters.push(this.config.scrollZonesHeight * i))
    }

    calculate() {
        if (this.config.target === window) {
            this.config.scrollHeight = document.body.scrollHeight - window.innerHeight
            this.config.scrollTop = this.config.target.scrollY
        }
        else {
            this.config.scrollHeight = this.config.target.scrollHeight - this.config.target.offsetHeight
            this.config.scrollTop = this.config.target.scrollTop
        }

        setTimeout(() => this.findScrollZone())
    }

    findScrollZone() {
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
    }

    calculateStep(a, b, forward) {
        const flowStepSize = this.config.flow[b] - this.config.flow[a]
        const inSectionStep = (this.config.scrollTop - this.config.scrollZonesDelimiters[a]) / this.config.scrollZonesHeight * flowStepSize
        this.progress = (this.config.flow[a] + inSectionStep) * 100
        this.set_progress()
    }

    set_progress() {
        this.parent.frame = Math.round(this.parent.vars.frames.length / 100 * this.progress)
    }

}
