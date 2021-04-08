import Init from './Init'
import { createExif } from '../Raw'

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
        this.exec(`${this.webpmux} -set exif ${this.createExif(this.config?.pack || 'WSF', this.config?.author || 'Made Using', `${this.path}/${Math.random().toString(36)}`)} ${filename} -o ${filename}`)
    }


    createExif = createExif
}
