import { Image } from 'node-webpmux'
import { TextEncoder } from 'util'
import { Metadata } from '../../Types'
import RawMetadata from './RawMetadata'

export default class Exif {
    private data: RawMetadata
    private exif: Buffer | null = null
    constructor(options: Metadata) {
        this.data = new RawMetadata(options)
    }

    build = (): Buffer => {
        const data = JSON.stringify(this.data)
        const exif = Buffer.concat([
            Buffer.from([
                0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00,
                0x00, 0x16, 0x00, 0x00, 0x00
            ]),
            Buffer.from(data, 'utf-8')
        ])
        exif.writeUIntLE(new TextEncoder().encode(data).length, 14, 4)
        return exif
    }

    add = async (image: string | Buffer | Image): Promise<Buffer> => {
        const exif = this.exif || this.build()
        image =
            image instanceof Image
                ? image
                : await (async () => {
                      const img = new Image()
                      await img.load(image)
                      return img
                  })()
        image.exif = exif
        return await image.save(null)
    }
}
