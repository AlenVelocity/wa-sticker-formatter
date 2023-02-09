// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path='../src/internal/node-webmux' />

;(async () => {
    await import('./default')
    await import('./crop')
    await import('./full')
    await import('./circle')
    await import('./rounded')
    await import('./star')
})().catch(console.error)
