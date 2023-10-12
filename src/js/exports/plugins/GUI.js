/**
 * @name GUI
 * @version 0.8.1
 * @author Artur Papikian
 * @description little interactive gui
 * @licence MIT
 *
 */

import GIFPlayerV2 from '../../../GIFPlayerV2.js'

export default class {
    name = 'gui'
    parent = {}
    config = {
        hidden: false,
    }
    stylePath = '/src/css/gui.css'

    elements = {}
    state = ''


    constructor(parent) {
        this.parent = parent
        this.check(this.parent.vars.plugins.config[this.name])

        this.init().then()
    }

    async init() {
        await this.preloadStyle().catch(_ => {
            console.error('Could not load style for ' + this.name + ' plugin')
        })
        this.createElements()
        this.initEvents()
        this.checkState()
    }

    check(config) {
        if (!(config instanceof Object) || Array.isArray(config) === true) return

        if(config.hidden === true) this.config.hidden = true
    }

    async preloadStyle() {
        return new Promise((resolve, reject) => {
            if(document.querySelector('link.gui-style')) reject()
            const link = document.createElement('link')
            link.setAttribute('rel', 'stylesheet')
            link.setAttribute('type', 'text/css')
            link.setAttribute('href', this.stylePath)
            link.onload = resolve
            link.onerror = reject
            document.head.append(link)
        })
    }

    createElements() {
        this.elements.circle = document.createElement('DIV')

        this.elements.circle.classList.add('gui-circle')
        this.parent.wrapper.appendChild(this.elements.circle)
    }

    initEvents() {
        const evToggle = () => {
            if (this.parent.vars.state === GIFPlayerV2.states.PLAYING) this.parent.pause()
            else if (this.parent.vars.state === GIFPlayerV2.states.PAUSED || this.parent.vars.state === GIFPlayerV2.states.READY) this.parent.play()
        }

        ;['touchstart', 'click'].forEach(event => {
            this.parent.wrapper.addEventListener(event, evToggle)
        })



    }

    checkState() {
        if (this.state !== this.parent.vars.state) {
            clearTimeout(this.animationTimeout)
            this.state = this.parent.vars.state

            if (this.config.hidden === true) return
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
        if (this.state !== GIFPlayerV2.states.ERROR) window.requestAnimationFrame(() => this.checkState())
    }

    playing() {
        this.elements.circle.style.scale = '.8'
        this.elements.circle.style.opacity = '0'

        this.animationTimeout = setTimeout(() => {
            this.elements.circle.style.display = 'none'
        }, this.config.animationDuration)
    }

    paused() {
        this.elements.circle.style.display = 'flex'
        this.elements.circle.innerHTML = 'PLAY'

        this.animationTimeout = setTimeout(() => {
            this.elements.circle.style.scale = '1'
            this.elements.circle.style.opacity = '1'
        }, 0)
    }

    loading() {
        this.elements.circle.style.display = 'flex'
        this.elements.circle.innerHTML = 'LOAD'
    }

    error() {
        this.elements.circle.style.display = 'flex'
        this.elements.circle.innerHTML = 'ERR'
    }
}