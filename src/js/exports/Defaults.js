export default import('../../GIFPlayerV2.js').then(exp => {
    return {
        plugins: {
            removable: [exp.default.AllPlugins.GUI],
            fixed: [],
        }
    }
})


