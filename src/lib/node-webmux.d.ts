declare module 'node-webpmux' {
    export class Image {
        constructor()
        exif: Buffer
        load(buffer: Bufffer | string): Promise<void>
        save(...args: unknown): Promise<Buffer>
    }
}
