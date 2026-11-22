import webpmux from 'node-webpmux'
import type { Metadata } from '../../Types'
import RawMetadata from './RawMetadata'

/**
 * TIFF header with a single IFD entry: tag 0x5741 ("WA"), type UNDEFINED, followed by the JSON payload.
 * This is the layout WhatsApp and sticker-maker apps use.
 */
const TIFF_HEADER = [
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16,
    0x00, 0x00, 0x00
]

/**
 * Builds WhatsApp sticker EXIF data and writes it into WebP images.
 *
 * Use it on its own when you already have a WebP and only want to set the pack name and author:
 * ```ts
 * const sticker = await new Exif({ pack: 'My Pack', author: 'Me' }).add(webpBuffer)
 * ```
 */
export default class Exif {
    private readonly data: RawMetadata
    private exif: Buffer | null = null

    constructor(options: Metadata) {
        this.data = new RawMetadata(options)
    }

    /** Returns the raw EXIF bytes */
    build = (): Buffer => {
        if (this.exif) return this.exif
        const json = Buffer.from(JSON.stringify(this.data), 'utf-8')
        const header = Buffer.from(TIFF_HEADER)
        header.writeUInt32LE(json.length, 14)
        this.exif = Buffer.concat([header, json])
        return this.exif
    }

    /**
     * Writes the EXIF data into a WebP image, replacing any existing EXIF data
     * @param image - WebP image as a Buffer, Uint8Array or file path
     * @returns The WebP image with the EXIF data
     */
    add = async (image: string | Buffer | Uint8Array): Promise<Buffer> => {
        const img = new webpmux.Image()
        await img.load(
            typeof image === 'string' ? image : Buffer.from(image.buffer, image.byteOffset, image.byteLength)
        )
        img.exif = this.build()
        return await img.save(null)
    }
}
