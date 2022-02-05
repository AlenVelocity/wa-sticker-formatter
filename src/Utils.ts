import { randomBytes } from 'crypto'

export default abstract class Utils {
    static generateStickerID = (): string => randomBytes(32).toString('hex')
}

export const defaultBg = {
    r: 0,
    g: 0,
    b: 0,
    alpha: 0
}
