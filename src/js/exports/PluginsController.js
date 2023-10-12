import GIFPlayerV2 from "../../GIFPlayerV2.js"

export default {
    lookForPlugIns(){
        this.parent.vars.plugins.passed.forEach(plugIn => {
            if (Object.values(GIFPlayerV2.AllPlugins).includes(plugIn)) {
                this.loadPlugInByName(plugIn)
            }
        })
    },

    loadPlugInByName(name) {
        if(Object.values(GIFPlayerV2.AllPlugins).includes(name) !== true) throw new Error("Plug-ins name list doesn't contain passed plug-in name.")
        //Dynamically load plugins
        import(`/src/js/exports/plugins/${name}.js`).then(plugin => {
            this.parent.vars.plugins.loaded[name] = new plugin.default(this.parent)
        }).catch(err => {
            throw new Error(err)
        })
    },

    setUpPlugIns(config){
        GIFPlayerV2.defaults.then(defaults => {
            this.parent.vars.plugins.passed = config.plugins ?? defaults.plugins.removable
            this.parent.vars.plugins.passed.push(...defaults.plugins.fixed)

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