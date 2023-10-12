/**
 * @name GUI2
 * @version 0.1.0
 * @author Artur Papikian
 * @description little interactive gui
 * @licence MIT
 *
 */

import GIFPlayerV2 from '../../../GIFPlayerV2.js'

export default class {
    name = 'gui2'
    parent = {}
    config = {
        hidden: false,
    }
    stylePath = '/src/css/gui2.css'

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
            if(document.querySelector('link.gui2-style')) reject()
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
        this.createPlayButton()
        this.createNavigation()
        this.createButtons()
    }

    createPlayButton() {
        this.elements.playButton = document.createElement('DIV')
        this.elements.circle = document.createElement('DIV')

        this.elements.playButton.classList.add('gui2-play-button')
        this.elements.circle.classList.add('gui2-circle')

        this.elements.circle.append(this.elements.playButton)
        this.parent.wrapper.append(this.elements.circle)
    }

    createNavigation() {
        this.elements.navigationBar = document.createElement('div')
        this.elements.timeLine = document.createElement('div')
        this.elements.progressLine = document.createElement('div')
        this.elements.navigationMenu = document.createElement('div')

        this.elements.navigationBar.classList.add('gui2-navigation-bar')
        this.elements.timeLine.classList.add('gui2-time-line')
        this.elements.progressLine.classList.add('gui2-progress-line')
        this.elements.navigationMenu.classList.add('gui2-navigation-menu')

        this.elements.timeLine.append(this.elements.progressLine)
        this.elements.navigationMenu.append(this.elements.timeLine)
        this.elements.navigationBar.append(this.elements.timeLine)
        this.parent.wrapper.append(this.elements.navigationBar)
    }

    createButtons() {

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
        this.elements.circle.style.display = 'block'

        this.animationTimeout = setTimeout(() => {
            this.elements.circle.style.scale = '1'
            this.elements.circle.style.opacity = '1'
        }, 0)
    }

    loading() {
        this.elements.circle.style.display = 'block'
    }

    error() {
        this.elements.circle.style.display = 'block'
    }
}