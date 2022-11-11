export default {
    validate(wrapperSelector, config, urls) {
        this.validateWrapperSelector(wrapperSelector)
        this.validateFPS(config.player.fps)

        config.plugins = this.validatePlugins(config.plugins)
        urls = this.validateURLS(urls)

        return config
    },

    validateWrapperSelector(wrapperSelector){
        if (this.helpers.isHTMLElement(document.querySelector(wrapperSelector)) !== true) throw new Error('Invalid HTML element.')
    },

    validateFPS(fps){
        if (typeof fps == 'undefined') return 0
        else if (typeof fps != 'undefined' && (typeof fps != "number" || Math.ceil(fps) <= 0)){
            throw new Error('Passed FPS limiter must be a positiv number.')
        }
    },

    validatePlugins(plugins){
        if(typeof plugins != 'undefined' && Array.isArray(plugins) !== true) {
            console.warn('Plug-ins should be passed in an array.')
            plugins = [plugins]
        }
        return plugins
    },

    validateURLS(urls){
        if(Array.isArray(urls) !== true) urls = [urls]
        if(urls.some(url => typeof url !== 'string')) throw new Error('URL should be passed in string.')
        return urls
    }
}
