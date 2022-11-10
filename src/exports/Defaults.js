export default import('../GIFPlayerV2.js').then(exp => {
    return {
        plugins: [exp.GIFPlayerV2.AllPlugins.GUI]
    }
})


