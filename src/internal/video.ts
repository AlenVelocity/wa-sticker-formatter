import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import sharp, { type Color } from 'sharp'
import { FfmpegError, runFfmpeg } from './ffmpeg'
import type { StickerTypes } from './Metadata/StickerTypes'
import { STICKER_SIZE, isMasked, maskSvg } from './shapes'

export interface VideoOptions {
    type: StickerTypes
    background: Color
    /** Longest animation to keep, in seconds */
    maxDuration: number
}

export type VideoEncoder = (quality: number, fps: number) => Promise<Buffer>

/** libwebp_anim makes much smaller, cleaner animations. Older ffmpeg builds may only have libwebp. */
let webpEncoder: 'libwebp_anim' | 'libwebp' = 'libwebp_anim'

/**
 * ffmpeg's built-in VP8/VP9 decoders drop the alpha channel, so transparent WebM files
 * (like Telegram video stickers) need libvpx to keep their transparency.
 */
const webmDecoder = (data: Buffer): string | undefined => {
    if (data.length < 4 || data.readUInt32BE(0) !== 0x1a45dfa3) return undefined
    const header = data.toString('latin1', 0, Math.min(data.length, 65536))
    if (header.includes('V_VP9')) return 'libvpx-vp9'
    if (header.includes('V_VP8')) return 'libvpx'
    return undefined
}

/** Turns any colour sharp understands into ffmpeg's 0xRRGGBBAA */
const toFfmpegColor = async (background: Color): Promise<string> => {
    const pixel = await sharp({ create: { width: 1, height: 1, channels: 4, background } })
        .raw()
        .toBuffer()
    return `0x${[...pixel].map((value) => value.toString(16).padStart(2, '0')).join('')}`
}

const fitFilter = (type: StickerTypes, padColor: string): string => {
    const s = STICKER_SIZE
    const cover = `scale=${s}:${s}:force_original_aspect_ratio=increase:flags=lanczos,crop=${s}:${s}`
    if (type === 'crop' || isMasked(type)) return cover
    if (type === 'full') {
        return `scale=${s}:${s}:force_original_aspect_ratio=decrease:flags=lanczos,format=rgba,pad=${s}:${s}:(ow-iw)/2:(oh-ih)/2:color=${padColor}`
    }
    return `scale='min(${s},iw)':'min(${s},ih)':force_original_aspect_ratio=decrease:flags=lanczos`
}

/**
 * Writes the video to a temporary folder and hands `run` an encoder that can be called repeatedly
 * with different settings. The folder is removed afterwards.
 */
export const withVideoEncoder = async <T>(
    data: Buffer,
    options: VideoOptions,
    run: (encode: VideoEncoder) => Promise<T>
): Promise<T> => {
    const dir = await mkdtemp(join(tmpdir(), 'wa-sticker-'))
    try {
        const input = join(dir, 'input')
        const output = join(dir, 'output.webp')
        await writeFile(input, data)

        let mask: string | undefined
        if (isMasked(options.type)) {
            mask = join(dir, 'mask.png')
            await sharp(maskSvg(options.type, true)).toColourspace('b-w').png().toFile(mask)
        }
        const filter = fitFilter(options.type, options.type === 'full' ? await toFfmpegColor(options.background) : '')
        let decoder = webmDecoder(data)

        const encode: VideoEncoder = async (quality, fps) => {
            for (;;) {
                const base = `[0:v]fps=${fps},${filter},format=rgba`
                // Multiply the video's own alpha with the mask so transparent videos stay transparent
                const graph = mask
                    ? `${base},split[c][a];[a]alphaextract[va];[1:v]format=gray[m];[va][m]blend=all_mode=multiply[alpha];[c][alpha]alphamerge[out]`
                    : `${base}[out]`
                const args = [
                    ...(decoder ? ['-c:v', decoder] : []),
                    '-t',
                    String(options.maxDuration),
                    '-i',
                    input,
                    ...(mask ? ['-i', mask] : []),
                    '-filter_complex',
                    graph,
                    '-map',
                    '[out]',
                    '-an',
                    '-sn',
                    '-dn',
                    '-c:v',
                    webpEncoder,
                    '-quality',
                    String(quality),
                    '-loop',
                    '0',
                    '-f',
                    'webp',
                    output
                ]
                try {
                    await runFfmpeg(args)
                    return await readFile(output)
                } catch (err) {
                    if (!(err instanceof FfmpegError)) throw err
                    // e.g. "Unknown decoder 'libvpx-vp9'", or libvpx failing on this file: use the built-in decoder
                    if (decoder && err.stderr.includes(decoder)) {
                        decoder = undefined
                    } else if (webpEncoder === 'libwebp_anim' && /unknown encoder 'libwebp_anim'/i.test(err.stderr)) {
                        webpEncoder = 'libwebp'
                    } else {
                        throw err
                    }
                }
            }
        }

        return await run(encode)
    } finally {
        await rm(dir, { recursive: true, force: true })
    }
}
