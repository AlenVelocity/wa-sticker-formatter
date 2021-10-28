import { existsSync, readFile, writeFile } from 'fs-extra'
import { IStickerConfig, IStickerOptions } from './Types'
import axios from 'axios'
import Utils from './Utils'
import { fromBuffer } from 'file-type'
import convert from './internal/convert'
import Exif from './internal/Metadata/Exif'
import { StickerTypes } from './internal/Metadata/StickerTypes'
import { Categories } from '.'

export class Sticker {
    constructor(private data: string | Buffer, public metadata: Partial<IStickerOptions> = {}) {
        this.metadata.author = this.metadata.author || ''
        this.metadata.pack = this.metadata.pack || ''
        this.metadata.id = this.metadata.id || Utils.generateStickerID()
        this.metadata.quality = this.metadata.quality || 100
        this.metadata.type = Object.values(StickerTypes).includes(this.metadata.type as StickerTypes)
            ? this.metadata.type
            : StickerTypes.DEFAULT
    }

    private _parse = async (): Promise<Buffer> =>
        Buffer.isBuffer(this.data)
            ? this.data
            : (async () =>
                  existsSync(this.data)
                      ? readFile(this.data)
                      : axios.get(this.data as string, { responseType: 'arraybuffer' }).then(({ data }) => data))()

    private _getMimeType = async (data: Buffer): Promise<string> => {
        const type = await fromBuffer(data)
        if (!type) throw new Error('Invalid Buffer Instance')
        return type.mime
    }

    /**
     * Builds the sticker
     * @param {string} [type] - How you want your sticker to look like
     * @returns {Promise<Buffer>} A promise that resolves to the sticker buffer
     */
    public build = async (
        type: StickerTypes = (this.metadata.type as StickerTypes) || StickerTypes.DEFAULT
    ): Promise<Buffer> => {
        const buffer = await this._parse()
        const mime = await this._getMimeType(buffer)
        return new Exif(this.metadata as IStickerConfig).add(await convert(buffer, mime, type, this.metadata.quality))
    }

    public get defaultFilename(): string {
        return `./${this.metadata.pack}-${this.metadata.author}.webp`
    }

    /**
     * Saves the sticker to a file
     * @param [filename] - Filename to save the sticker to
     * @returns filename
     */
    public toFile = async (filename = this.defaultFilename): Promise<string> => {
        await writeFile(filename, await this.build())
        return filename
    }

    /**
     * Set the sticker pack title
     * @param pack - Sticker Pack Title
     * @returns {this}
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
     */
    public setID = (id: string): this => {
        this.metadata.id = id
        return this
    }

    /**
     * Set the sticker category
     * @param categories - Sticker Category
     * @returns {this}
     */
    public setCategories = (categories: Categories[]): this => {
        this.metadata.categories = categories
        return this
    }

    /**
     * @deprecated
     * Use the `Sticker.build()` method instead
     */
    public get = this.build
}

export const createSticker = async (...args: ConstructorParameters<typeof Sticker>): Promise<Buffer> => {
    return new Sticker(...args).build()
}
