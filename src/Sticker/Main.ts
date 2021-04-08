import { readFileSync } from 'fs-extra'
import Build from './Build'

export class Sticker extends Build {
    /**
     * @returns {Buffer} Returns the build result
     */
    async get(): Promise<Buffer> {
        const buffer = readFileSync(this.final)
        return buffer
    }
}
