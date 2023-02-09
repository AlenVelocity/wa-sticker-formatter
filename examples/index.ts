// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path='../src/internal/node-webpmux.d.ts' />

(async () => {
    await import('./default')
    await import('./crop')
    await import('./full')
    await import('./circle')
    await import('./rounded')
})().catch(console.error)
