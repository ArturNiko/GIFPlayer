/**
 * @name GUI
 * @version 0.7.1
 * @author Artur Papikian
 * @description little interactive gui
 * @licence MIT
 *
 */
import {GIFPlayerV2} from "../../GIFPlayerV2.js"

export default class GUI {
    name = 'gui'
    parent = {}
    config = {}

    elements = {}
    state = ''
    animationTimeout

    constructor(parent) {
        this.parent = parent
        this.config = this.parent.vars.plugins.config[this.name] ?? {}
        this.check()
        this.init()
    }
    init() {
        this.createElements()
        this.initEvents()
        this.checkState()
    }

    check() {
        if (typeof this.config.animationDuration != 'undefined') {
            if (typeof this.config.animationDuration != 'number' || this.config.animationDuration < 0) {
                console.warn('Duration should be a positiv number.')
                this.config.animationDuration = 500
            }
        }
        else if(typeof this.config.animationDuration == 'undefined') this.config.animationDuration = 500
    }

    createElements () {
        this.elements.circle = document.createElement('DIV')

        this.parent.canvas.style.position = 'absolute'

        this.parent.wrapper.style.display = 'flex'
        this.parent.wrapper.style.justifyContent = 'center'
        this.parent.wrapper.style.alignItems = 'center'

        this.elements.circle.style = `
            display: none;
            -webkit-box-align: center;
            -webkit-align-items: center;
               -moz-box-align: center;
                -ms-flex-align: center;
                    align-items: center;
            -webkit-box-pack: center;
            -webkit-justify-content: center;
               -moz-box-pack: center;
                -ms-flex-pack: center;
                    justify-content: center;
            -webkit-border-radius: 50%;
               -moz-border-radius: 50%;
                    border-radius: 50%;
            padding: 20px;
            width: 35px;
            height: 35px;
            outline: 2px dashed #fff;
            outline-offset: -5px;
            position: relative;
            color: white;
            font-family: Arial, Helvetica, sans-serif;
            font-weight: 600;
            background-color: #000000a0;
            margin: auto 0;
            -webkit-user-select: none;
               -moz-user-select: none;
                -ms-user-select: none;
                    user-select: none;
            cursor: pointer;
            -webkit-transition: ${this.config.animationDuration}ms ease-in-out;
            -o-transition: ${this.config.animationDuration}ms ease-in-out;
            -moz-transition: ${this.config.animationDuration}ms ease-in-out;
            transition: ${this.config.animationDuration}ms ease-in-out;
        `
        this.parent.wrapper.appendChild(this.elements.circle)
    }

    initEvents() {
        const evToggle = () => {
            if (this.parent.vars.state === GIFPlayerV2.states.PLAYING) this.parent.pause()
            else if (this.parent.vars.state === GIFPlayerV2.states.PAUSED || this.parent.vars.state === GIFPlayerV2.states.READY) this.parent.play()
        }

        this.parent.canvas.addEventListener('click', () => evToggle())
        this.elements.circle.addEventListener('click', () => evToggle())

    }

    checkState() {
        if (this.state !== this.parent.vars.state) {
            clearTimeout(this.animationTimeout)
            this.state = this.parent.vars.state

            switch (this.parent.vars.state) {
                case GIFPlayerV2.states.PLAYING:
                    this.playing()
                    break

                case GIFPlayerV2.states.PAUSED:
                case GIFPlayerV2.states.READY:
                    this.paused()
                    break

                case GIFPlayerV2.states.LOADING:
                    this.loading()
                    break

                case GIFPlayerV2.states.ERROR:
                    this.error()
                    break
            }
        }
        if(this.state !== GIFPlayerV2.states.ERROR) window.requestAnimationFrame(() => this.checkState())
    }
    playing() {
        this.elements.circle.style.transform = 'scale(.8)'
        this.elements.circle.style.opacity = '0'

        this.animationTimeout = setTimeout(() => {
            this.elements.circle.style.display = 'none'
        }, this.config.animationDuration)
    }
    paused () {
        this.elements.circle.style.display = 'flex'
        this.elements.circle.innerHTML = 'PLAY'

        this.animationTimeout = setTimeout(() => {
            this.elements.circle.style.transform = 'scale(1)'
            this.elements.circle.style.opacity = '1'
        }, 0)
    }
    loading () {
        this.elements.circle.style.display = 'flex'
        this.elements.circle.innerHTML = 'LOAD'
    }
    error () {
        this.elements.circle.style.display = 'flex'
        this.elements.circle.innerHTML = 'ERR'
    }
}