declare module 'node-webpmux' {
    export class Image {
        constructor()
        exif: Buffer
        loadBuffer(buffer: Bufffer)
        saveBuffer(): Promise<Buffer>
    }
}
