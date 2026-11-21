/** WhatsApp stickers are 512x512 */
export const STICKER_SIZE = 512

const ROUNDED_RADIUS = 50

export type MaskedType = 'circle' | 'rounded'

export const isMasked = (type: string): type is MaskedType => type === 'circle' || type === 'rounded'

/**
 * SVG mask for circle and rounded stickers: white shape on a transparent background,
 * or on black when `opaque` is set (ffmpeg reads the mask as luma).
 */
export const maskSvg = (type: MaskedType, opaque = false): Buffer => {
    const s = STICKER_SIZE
    const shape =
        type === 'circle'
            ? `<circle cx="${s / 2}" cy="${s / 2}" r="${s / 2}" fill="#fff"/>`
            : `<rect width="${s}" height="${s}" rx="${ROUNDED_RADIUS}" ry="${ROUNDED_RADIUS}" fill="#fff"/>`
    const background = opaque ? `<rect width="${s}" height="${s}" fill="#000"/>` : ''
    return Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">${background}${shape}</svg>`
    )
}
