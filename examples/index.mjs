(async () => {
    await import('./default.mjs')
    await import('./crop.mjs')
    await import('./full.mjs')
})().catch(console.error)