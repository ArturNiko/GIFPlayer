import {GIFPlayerV2} from "../GIFPlayerV2.js";

export default {
    lookForPlugIns(){
        this.parent.vars.plugins.passed.forEach(plugIn => {
            if (Object.values(GIFPlayerV2.AllPlugins).includes(plugIn)) {
                this.loadPlugInByName(plugIn)
            }
        })
    },

    loadPlugInByName(name) {

        import(`./plugins/${name}.js`).then(plugin => {
            plugin = plugin.default
            this.parent.vars.plugins.loaded[name] = new plugin(this.parent)
        }).catch(err => {
            throw new Error(err)
        })
    },

    setUpPlugIns(config){
        GIFPlayerV2.defaults.then(defaults => {
            this.parent.vars.plugins.passed = config.plugins ?? defaults.plugins.removable

            this.parent.vars.plugins.passed.push(defaults.fixed)

            Object.entries(config).forEach(entry => {
                const [key, value] = entry
                if(key !== 'player' && key !== 'plugins') {
                    this.parent.vars.plugins.config[key] = value
                    delete config[key]
                }
            })
            this.lookForPlugIns()
        })
    }
}