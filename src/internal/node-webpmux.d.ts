declare module 'node-webpmux' {
    export class Image {
        constructor()
        exif: Buffer | undefined
        load(source: Buffer | string): Promise<void>
        save(path: string | null, options?: Record<string, unknown>): Promise<Buffer>
    }
    const webpmux: { Image: typeof Image }
    export default webpmux
}
