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
        await this.preloadStyle().catch(_ => console.error('Could not load style for ' + this.name + ' plugin'))
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
            link.setAttribute('class', 'gui-style')
            link.setAttribute('rel', 'stylesheet')
            link.setAttribute('type', 'text/css')
            link.setAttribute('href', this.stylePath)
            document.head.append(link)

            ;[link.onload, link.onerror] = [resolve, reject]
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
        this.elements.circle.classList.add('hidden')
    }

    paused() {
        this.elements.circle.innerHTML = 'PLAY'
        this.elements.circle.classList.remove('hidden')
    }

    loading() {
        this.elements.circle.innerHTML = 'LOAD'
    }

    error() {
        this.elements.circle.innerHTML = 'ERR'
    }
}