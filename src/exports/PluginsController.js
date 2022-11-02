import {GIFPlayerV2} from "../GIFPlayerV2.js";

export default {
    lookForPlugins: function (){
        this.parent.vars.plugins.passed.forEach(plugIn => {
            if (Object.values(GIFPlayerV2.AllPlugins).includes(plugIn)) {
                this.loadPlugInByName(plugIn)
            }
        })
    },

    loadPlugInByName: function (name) {
        import(`./plugins/${name}.js`).then(plugin => {
            plugin = plugin.default
            plugin.init(this.parent)
            this.parent.vars.plugins.loaded[name] = plugin
        }).catch(_ => {
            throw new Error('Plug-in not found.')
        })
    },




}