import { existsSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import { IStickerConfig, IStickerOptions } from './Types'
import axios from 'axios'
import Utils from './Utils'
import { fromBuffer } from 'file-type'
import convert from './lib/convert'
import Exif from './lib/Metadata/Exif'

export class Sticker {
    constructor(private data: string | Buffer, public metadata: Partial<IStickerOptions> = {}) {
        this.metadata.author = this.metadata.author || ''
        this.metadata.pack = this.metadata.pack || ''
        this.metadata.id = this.metadata.id || Utils.generateStickerID()
        this.metadata.quality = this.metadata.quality || 100
        this.metadata.type = ['default', 'crop', 'full'].includes(this.metadata.type as string)
            ? this.metadata.type
            : 'default'
    }

    private _parse = async (): Promise<Buffer> =>
        Buffer.isBuffer(this.data)
            ? this.data
            : await (async () =>
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
     */
    build = async (): Promise<Buffer> => {
        const buffer = await this._parse()
        const mime = await this._getMimeType(buffer)
        return await new Exif(this.metadata as IStickerConfig).add(
            await convert(buffer, mime, this.metadata.type, this.metadata.quality)
        )
    }

    toFile = async (filename = `${this.metadata.pack}-${this.metadata.author}.webp`): Promise<string> => {
        await writeFile(filename, await this.build())
        return filename
    }

    /**
     * @deprecated
     * Use the `Sticker.build()` method instead
     */
    get = this.build
}

export const createSticker = async (...args: ConstructorParameters<typeof Sticker>): Promise<Buffer> => {
    return await new Sticker(...args).build()
}
