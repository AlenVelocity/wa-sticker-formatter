import sharp, { type Color, type Metadata, type SharpOptions } from 'sharp'
import type { StickerTypes } from './Metadata/StickerTypes'
import { STICKER_SIZE, isMasked, maskSvg } from './shapes'

export interface ImageEncodeOptions {
    type: StickerTypes
    background: Color
    quality: number
    /** Longest animation to keep, in seconds */
    maxDuration: number
}

/** Returns sharp's metadata, or `undefined` when sharp can't read the input (e.g. a video) */
export const probeImage = async (data: Buffer): Promise<Metadata | undefined> => {
    try {
        return await sharp(data, { animated: true }).metadata()
    } catch {
        return undefined
    }
}

/** Browsers show GIF frames with a delay of 10ms or less at 100ms, and WhatsApp needs a delay of at least 8ms */
const normaliseDelays = (delay: number[] | undefined, pages: number): number[] =>
    Array.from({ length: pages }, (_, i) => {
        const value = delay?.[i] ?? delay?.[delay.length - 1] ?? 100
        return value > 10 ? value : 100
    })

/** Number of frames that fit in `limitMs` (always at least one) */
const framesWithin = (delays: number[], limitMs: number): number => {
    let total = 0
    let frames = 0
    for (const delay of delays) {
        if (frames > 0 && total + delay > limitMs) break
        total += delay
        frames++
    }
    return frames
}

/** Converts a still or animated image (anything sharp reads: PNG, JPEG, GIF, WebP, AVIF, SVG, TIFF...) */
export const encodeImage = async (data: Buffer, meta: Metadata, options: ImageEncodeOptions): Promise<Buffer> => {
    const totalPages = meta.pages ?? 1
    const animated = totalPages > 1
    const input: SharpOptions = {}
    let delay: number[] | undefined

    if (animated) {
        const delays = normaliseDelays(meta.delay, totalPages)
        input.pages = framesWithin(delays, options.maxDuration * 1000)
        delay = delays.slice(0, input.pages)
    }

    // Render small SVGs at a density that makes them 512px instead of upscaling a blurry bitmap
    const longest = Math.max(meta.width ?? 0, meta.height ?? 0)
    if (meta.format === 'svg' && longest > 0 && longest < STICKER_SIZE) {
        input.density = Math.min(((meta.density ?? 72) * STICKER_SIZE) / longest, 100000)
    }

    const img = sharp(data, input)
    // Apply EXIF orientation so phone photos aren't sideways
    if (!animated) img.rotate()

    const size = STICKER_SIZE
    if (options.type === 'crop') {
        img.resize(size, size, { fit: 'cover' })
    } else if (options.type === 'full') {
        img.resize(size, size, { fit: 'contain', background: options.background })
    } else if (isMasked(options.type)) {
        img.resize(size, size, { fit: 'cover' }).composite([
            { input: maskSvg(options.type), blend: 'dest-in', gravity: 'northwest', tile: true }
        ])
    } else {
        img.resize(size, size, { fit: 'inside', withoutEnlargement: true })
    }

    return img.webp({ quality: options.quality, ...(animated ? { loop: 0, delay } : {}) }).toBuffer()
}
