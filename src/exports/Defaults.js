export default import('../GIFPlayerV2.js').then(exp => {
    return {
        plugins: {
            removable: [exp.GIFPlayerV2.AllPlugins.GUI],
            fixed: [],
        }
    }
})


