import { randomBytes } from 'crypto'

export default abstract class Utils {
    static generateStickerID = () => randomBytes(32).toString('hex')
}
