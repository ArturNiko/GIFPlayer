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
        playing: false
    }

    stylePath = '/src/css/gui2.css'

    elements = {}
    progress = 0
    state = ''
    smoothSteps = 10

    constructor(parent) {
        this.parent = parent
        this.check(this.parent.vars.plugins.config[this.name])

        this.#init().then()
    }

    async #init() {
        await this.preloadStyle().catch(_ => {
            console.error('Could not load style for ' + this.name + ' plugin')
        })
        this.#createElements()
        this.#initEvents()
        this.#checkState()

        this.update()
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

    #createElements() {
        this.#createPlayButton()
        this.#createNavigation()
        this.#createButtons()
    }

    #createPlayButton() {
        this.elements.playButton = document.createElement('DIV')
        this.elements.circle = document.createElement('DIV')

        this.elements.playButton.classList.add('gui2-play-button')
        this.elements.circle.classList.add('gui2-circle', 'transition')

        this.elements.circle.append(this.elements.playButton)
        this.parent.wrapper.append(this.elements.circle)
    }

    #createNavigation() {
        this.elements.navigationBar = document.createElement('div')
        this.elements.timeLine = document.createElement('div')
        this.elements.progressLine = document.createElement('div')
        this.elements.navigationMenu = document.createElement('div')

        this.elements.navigationBar.classList.add('gui2-navigation-bar', 'transition')
        this.elements.timeLine.classList.add('gui2-time-line', 'transition')
        this.elements.progressLine.classList.add('gui2-progress-line', 'transition')
        this.elements.navigationMenu.classList.add('gui2-navigation-menu', 'transition')

        this.elements.timeLine.append(this.elements.progressLine)
        this.elements.navigationBar.append(this.elements.timeLine)
        this.elements.navigationBar.append(this.elements.navigationMenu)
        this.parent.wrapper.append(this.elements.navigationBar)
    }

    #createButtons() {
        this.elements.playPauseButtonWrapper = document.createElement('div')
        this.elements.playButton = document.createElement('i')
        this.elements.pauseButton = document.createElement('i')
        this.elements.fullscreenButton = document.createElement('i')

        this.elements.playPauseButtonWrapper.classList.add('gui2-play-pause-wrapper')
        this.elements.playButton.classList.add('icon-play', 'hidden')
        this.elements.pauseButton.classList.add('icon-pause', 'hidden')
        this.elements.fullscreenButton.classList.add('icon-resize-full')

        this.elements.playPauseButtonWrapper.append(this.elements.playButton, this.elements.pauseButton)
        this.elements.navigationMenu.append(document.createElement('div'), this.elements.playPauseButtonWrapper, this.elements.fullscreenButton)
    }

    #initEvents() {
        // Wrapper
        this.parent.wrapper.addEventListener('click', () => {
            if (this.parent.vars.state === GIFPlayerV2.states.PLAYING) this.parent.pause()
            else if (this.parent.vars.state === GIFPlayerV2.states.PAUSED || this.parent.vars.state === GIFPlayerV2.states.READY) this.parent.play()
        })

        //Timeline
        this.elements.timeLine.addEventListener('click', (e) => {
            e.stopPropagation()
            const position = e.clientX - this.elements.timeLine.getBoundingClientRect().x
            this.progress = Math.round(position / this.elements.timeLine.getBoundingClientRect().width * 100)

            this.parent.frame = Math.round(this.parent.frames_length * this.progress / 100)
            this.elements.progressLine.style.width = `${this.progress}%`
        })

        //Menu
        this.elements.navigationMenu.addEventListener('click', (e) => e.stopPropagation())

        //Buttons
        this.elements.playButton.addEventListener('click', (e) => {
            if (this.parent.vars.state === GIFPlayerV2.states.PAUSED || this.parent.vars.state === GIFPlayerV2.states.READY) this.parent.play()
        })
        this.elements.pauseButton.addEventListener('click', (e) => {
            if (this.parent.vars.state === GIFPlayerV2.states.PLAYING) this.parent.pause()
        })
    }

    update() {
        const updating = setInterval(() => {
            //@todo: add smooth steps
            this.progress = this.parent.current_frame_index / this.parent.frames_length * 100 || 0
            this.elements.progressLine.style.width = `${this.progress}%`


            if(this.state !== GIFPlayerV2.states.PLAYING) clearInterval(updating)
        }, 16.666)
    }

    #checkState() {
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
        if (this.state !== GIFPlayerV2.states.ERROR) window.requestAnimationFrame(() => this.#checkState())
    }

    playing() {
        this.update()
        this.elements.circle.classList.add('hidden')
        this.elements.playButton.classList.add('hidden')
        this.elements.pauseButton.classList.remove('hidden')
    }

    paused() {
        this.elements.pauseButton.classList.add('hidden')
        this.elements.playButton.classList.remove('hidden')
        this.elements.circle.classList.remove('hidden')
    }

    loading() {
        this.elements.circle.classList.remove('hidden')
    }

    error() {
        this.elements.circle.style.display = 'hidden'
    }
}