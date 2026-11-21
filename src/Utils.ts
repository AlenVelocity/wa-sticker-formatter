import { randomBytes } from 'node:crypto'
import type { Color } from 'sharp'

export default abstract class Utils {
    static generateStickerID = (): string => randomBytes(32).toString('hex')
}

/** Transparent black */
export const defaultBg: Color = {
    r: 0,
    g: 0,
    b: 0,
    alpha: 0
}
