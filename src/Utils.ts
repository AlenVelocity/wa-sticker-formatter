import { randomBytes } from 'crypto'

export default abstract class Utils {
    static generateStickerID = (): string => randomBytes(32).toString('hex')
}
