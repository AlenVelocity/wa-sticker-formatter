import { existsSync, readFile, writeFile } from 'fs-extra'
import { IStickerConfig, IStickerOptions } from './Types'
import axios from 'axios'
import Utils, { defaultBg } from './Utils'
import { fromBuffer } from 'file-type'
import convert from './internal/convert'
import Exif from './internal/Metadata/Exif'
import { StickerTypes } from './internal/Metadata/StickerTypes'
import { Categories, extractMetadata } from '.'
import { Color } from 'sharp'

/**
 * Sticker class
 */
export class Sticker {
    /**
     * Sticker Constructor
     * @param {string|Buffer} [data] - File path, url or Buffer of the image/video to be converted
     * @param {IStickerOptions} [options] - Sticker options
     */
    constructor(private data: string | Buffer, public metadata: Partial<IStickerOptions> = {}) {
        this.metadata.author = this.metadata.author ?? ''
        this.metadata.pack = this.metadata.pack ?? ''
        this.metadata.id = this.metadata.id ?? Utils.generateStickerID()
        this.metadata.quality = this.metadata.quality ?? 100
        this.metadata.type = Object.values(StickerTypes).includes(this.metadata.type as StickerTypes)
            ? this.metadata.type
            : StickerTypes.DEFAULT
        this.metadata.background = this.metadata.background ?? defaultBg
    }

    private _parse = async (): Promise<Buffer> =>
        Buffer.isBuffer(this.data)
            ? this.data
            : this.data.trim().startsWith('<svg')
            ? Buffer.from(this.data)
            : (async () =>
                  existsSync(this.data)
                      ? readFile(this.data)
                      : axios.get(this.data as string, { responseType: 'arraybuffer' }).then(({ data }) => data))()

    private _getMimeType = async (data: Buffer): Promise<string> => {
        const type = await fromBuffer(data)
        if (!type) {
            if (typeof this.data === 'string') return 'image/svg+xml'
            throw new Error('Invalid file type')
        }
        return type.mime
    }

    /**
     * Builds the sticker
     * @returns {Promise<Buffer>} A promise that resolves to the sticker buffer
     * @example
     * const sticker = new Sticker('./image.png')
     * const buffer = sticker.build()
     */
    public build = async (): Promise<Buffer> => {
        const data = await this._parse()
        const mime = await this._getMimeType(data)
        return new Exif(this.metadata as IStickerConfig).add(await convert(data, mime, this.metadata))
    }

    /**
     * Alias for `.build()`
     * @param {string} [type] - How you want your sticker to look like
     * @returns {Promise<Buffer>} A promise that resolves to the sticker buffer
     * @example
     * const sticker = new Sticker('./image.png')
     * const buffer = sticker.build()
     */
    public toBuffer = this.build

    public get defaultFilename(): string {
        return `./${this.metadata.pack}-${this.metadata.author}.webp`
    }

    /**
     * Saves the sticker to a file
     * @param [filename] - Filename to save the sticker to
     * @returns filename
     * @example
     * const sticker = new Sticker('./image.png')
     * sticker.toFile('./image.webp')
     */
    public toFile = async (filename = this.defaultFilename): Promise<string> => {
        await writeFile(filename, await this.build())
        return filename
    }

    /**
     * Set the sticker pack title
     * @param pack - Sticker Pack Title
     * @returns {this}
     * @example
     * const sticker = new Sticker('./image.png')
     * sticker.setPack('My Sticker Pack')
     * sticker.build()
     */
    public setPack = (pack: string): this => {
        this.metadata.pack = pack
        return this
    }

    /**
     * Set the sticker pack author
     * @param author - Sticker Pack Author
     * @returns
     */
    public setAuthor = (author: string): this => {
        this.metadata.author = author
        return this
    }

    /**
     * Set the sticker pack ID
     * @param id - Sticker Pack ID
     * @returns {this}
     * @example
     * const sticker = new Sticker('./image.png')
     * sticker.setID('my-sticker-pack')
     * sticker.build()
     */
    public setID = (id: string): this => {
        this.metadata.id = id
        return this
    }

    /**
     * Set the sticker category
     * @param categories - Sticker Category
     * @returns {this}
     * @example
     * const sticker = new Sticker('./image.png')
     * sticker.setCategories(['🌹'])
     */
    public setCategories = (categories: Categories[]): this => {
        this.metadata.categories = categories
        return this
    }

    /**
     * Set the sticker type
     * @param {StickerTypes|string}[type] - Sticker Type
     * @returns {this}
     */
    public setType = (type: StickerTypes | string): this => {
        this.metadata.type = type
        return this
    }

    /**
     * Set the sticker quality
     * @param {number}[quality] - Sticker Quality
     * @returns {this}
     */
    public setQuality = (quality: number): this => {
        this.metadata.quality = quality
        return this
    }

    /**
     * Set the background color for `full` images
     * @param {Color}[background] - Background color
     * @returns {this}
     */
    public setBackground = (background: Color): this => {
        this.metadata.background = background
        return this
    }

    /**
     * @deprecated
     * Use the `Sticker.build()` method instead
     */
    public get = this.build

    /**
     * Get BaileysMD-compatible message object
     * @returns {{ sticker: Buffer }}
     * @example
     * import { create } from '@adiwajshing/baileys-md'
     * const conn = create()
     * ...
     * const sticker = new Sticker('./image.png', { pack: 'My Sticker Pack', author: 'Me' })
     * const message = await sticker.toMessage()
     * conn.sendMessage(jid, message)
     */
    public toMessage = async (): Promise<{ sticker: Buffer }> => ({ sticker: await this.build() })

    /**
     * Extracts metadata from a WebP image.
     * @param {Buffer}image - The image buffer to extract metadata from
     */
    public static extractMetadata = extractMetadata
}

/**
 *
 * @param {string|Buffer} data - File path, url or Buffer of the image/video to be converted
 * @param {IStickerOptions} [options] - Sticker options
 * @returns {Promise<Buffer>} A promise that resolves to the sticker buffer
 */
export const createSticker = async (...args: ConstructorParameters<typeof Sticker>): Promise<Buffer> => {
    return new Sticker(...args).build()
}
