export default import('../GIFPlayerV2.js').then(exp => {
    console.log(exp.GIFPlayerV2.AllPlugins.GUI)
    return {
        plugins: [exp.GIFPlayerV2.AllPlugins.GUI]
    }
})


