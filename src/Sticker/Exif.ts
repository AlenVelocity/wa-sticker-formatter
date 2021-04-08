import Init from './Init'
import fs from 'fs-extra'

export default class Exif extends Init {
    /**
     * Sets pack author
     * @param author
     */
    setAuthor(author: string): void {
        if (this.config) this.config.author = author
        else this.config = { author }
    }

    /**
     * Sets packname
     * @param pack
     */
    setPack(pack: string): void {
        if (this.config) this.config.pack = pack
        else this.config = { pack }
    }

    /**
     * Adds metadata to the webp
     * @param filename
     */
    async addMetadata(filename: string): Promise<void> {
        this.exec(`${this.webpmux} -set exif ${this.createExif()} ${filename} -o ${filename}`)
    }

    /**
     * Creates the exif metadata file
     * @param packname
     * @param author
     */
    createExif(
        packname: string = this.config?.pack || 'WA Sticker Formatter',
        author: string = this.config?.author || 'Made Using'
    ): string {
        const stickerPackID = 'com.etheral.waifuhub.android.stickercontentprovider b5e7275f-f1de-4137-961f-57becfad34f2'
        const json = {
            'sticker-pack-id': stickerPackID,
            'sticker-pack-name': packname,
            'sticker-pack-publisher': author
        }

        let length = new TextEncoder().encode(JSON.stringify(json)).length
        const f = Buffer.from([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00])
        const code = [0x00, 0x00, 0x16, 0x00, 0x00, 0x00]
        if (length > 256) {
            length = length - 256
            code.unshift(0x01)
        } else {
            code.unshift(0x00)
        }
        const fff = Buffer.from(code)
        const ffff = Buffer.from(JSON.stringify(json), 'utf-8')
        let len
        if (length < 16) {
            len = length.toString(16)
            len = '0' + length
        } else {
            len = length.toString(16)
        }

        const ff = Buffer.from(len, 'hex')
        const buffer = Buffer.concat([f, ff, fff, ffff])
        const fn = `${this.path}/${Math.random().toString()}.exif`
        fs.writeFileSync(fn, buffer)
        return fn
    }
}
