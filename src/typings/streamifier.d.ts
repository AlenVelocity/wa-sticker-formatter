declare module 'streamifier' {
    import { ReadStream } from 'fs-extra'
    export function createReadStream(data: Buffer): ReadStream
}
