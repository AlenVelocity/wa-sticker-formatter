import sharp, { type Color } from 'sharp'
import { FfmpegError } from './ffmpeg'
import { encodeImage, probeImage } from './image'
import type { StickerTypes } from './Metadata/StickerTypes'
import { withVideoEncoder } from './video'

export interface ConvertOptions {
    type: StickerTypes
    background: Color
    /** Starting quality. Defaults to 100 for still images and 80 for animations. */
    quality?: number
    /** Largest allowed output in bytes. `0` or `Infinity` turns the limit off. */
    maxSize: number
    fps: number
    maxDuration: number
}

export interface ConvertResult {
    data: Buffer
    animated: boolean
    width: number
    height: number
}

interface Attempt {
    quality: number
    fps: number
}

const QUALITY_STEPS = [90, 80, 70, 60, 50, 40, 30, 20, 10]

/** Rough size reduction per step down the ladder, used to skip steps when the output is far too big */
const SHRINK_PER_STEP = 0.75

const qualityLadder = (start: number): number[] => [start, ...QUALITY_STEPS.filter((q) => q < start)]

/** Lower quality first; once it reaches 30, also drop videos to 10 fps */
const videoLadder = (start: number, fps: number): Attempt[] => {
    const qualities = qualityLadder(start)
    if (fps <= 10) return qualities.map((quality) => ({ quality, fps }))
    return [
        ...qualities.filter((q) => q >= 30 || q === start).map((quality) => ({ quality, fps })),
        ...qualities.filter((q) => q <= 30 && q !== start).map((quality) => ({ quality, fps: 10 }))
    ]
}

/**
 * Encodes with each attempt in turn until the output fits in `maxSize`.
 * Skips ahead when the output is several times too big. Returns the smallest result if nothing fits.
 */
export const fitToSize = async (
    ladder: Attempt[],
    encode: (attempt: Attempt) => Promise<Buffer>,
    maxSize: number
): Promise<Buffer> => {
    const limited = Number.isFinite(maxSize) && maxSize > 0
    let smallest: Buffer | undefined
    let i = 0
    for (;;) {
        const output = await encode(ladder[i])
        if (!smallest || output.length < smallest.length) smallest = output
        if (!limited || output.length <= maxSize || i === ladder.length - 1) break
        const steps = Math.floor(Math.log(output.length / maxSize) / Math.log(1 / SHRINK_PER_STEP))
        i = Math.min(i + Math.max(1, steps), ladder.length - 1)
    }
    return smallest
}

const clampQuality = (quality: number): number => Math.min(100, Math.max(1, Math.round(quality)))

/** Converts a still image, animated image or video into a WhatsApp-ready WebP */
export const convert = async (data: Buffer, options: ConvertOptions): Promise<ConvertResult> => {
    if (data.length === 0) throw new Error('The sticker input is empty')
    if (data[0] === 0x1f && data[1] === 0x8b) {
        throw new Error(
            'Gzip-compressed input is not supported. If this is a Telegram animated sticker (.tgs), it is a Lottie ' +
                'animation: render it to a GIF or WebM first, then make a sticker from that.'
        )
    }

    let output: Buffer
    const meta = await probeImage(data)
    if (meta) {
        const animated = (meta.pages ?? 1) > 1
        const start = clampQuality(options.quality ?? (animated ? 80 : 100))
        const ladder = qualityLadder(start).map((quality) => ({ quality, fps: 0 }))
        output = await fitToSize(
            ladder,
            ({ quality }) => encodeImage(data, meta, { ...options, quality }),
            options.maxSize
        )
    } else {
        const start = clampQuality(options.quality ?? 80)
        try {
            output = await withVideoEncoder(data, options, (encode) =>
                fitToSize(videoLadder(start, options.fps), ({ quality, fps }) => encode(quality, fps), options.maxSize)
            )
        } catch (err) {
            if (err instanceof FfmpegError && err.stderr) {
                throw new FfmpegError(
                    `Could not convert the input: it is not an image sharp can read, and ffmpeg failed to convert it ` +
                        `as a video. ${err.message}`,
                    err.stderr
                )
            }
            throw err
        }
    }

    const info = await sharp(output, { animated: true }).metadata()
    return {
        data: output,
        animated: (info.pages ?? 1) > 1,
        width: info.width ?? 0,
        height: info.pageHeight ?? info.height ?? 0
    }
}
