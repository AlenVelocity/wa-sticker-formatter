import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import sharp from 'sharp'

const ffmpegBin = process.env.FFMPEG_PATH || 'ffmpeg'

/** Whether ffmpeg is available. Video tests are skipped without it. */
export const hasFfmpeg = spawnSync(ffmpegBin, ['-version'], { stdio: 'ignore' }).status === 0

export const hasEncoder = (name) =>
    hasFfmpeg && spawnSync(ffmpegBin, ['-hide_banner', '-encoders'], { encoding: 'utf8' }).stdout.includes(` ${name} `)

/** Solid-colour PNG */
export const png = (width, height, background = '#3498db') =>
    sharp({ create: { width, height, channels: 4, background } })
        .png()
        .toBuffer()

/** JPEG photo that is stored sideways with an EXIF orientation tag saying "rotate 90°" */
export const rotatedJpeg = () =>
    sharp({ create: { width: 600, height: 300, channels: 3, background: '#e74c3c' } })
        .jpeg()
        .withMetadata({ orientation: 6 })
        .toBuffer()

/** Animated GIF with one solid colour per frame */
export const gif = async ({ width = 800, height = 400, colors = ['#f00', '#0f0', '#00f', '#ff0'], delay } = {}) => {
    const frames = await Promise.all(colors.map((c) => png(width, height, c)))
    return sharp(frames, { join: { animated: true } })
        .gif({ delay: delay ?? colors.map(() => 100), loop: 0 })
        .toBuffer()
}

export const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="30" fill="#ff0000" />
</svg>`

/** Runs ffmpeg to make a test video and returns its bytes */
export const video = ({ seconds = 2, size = '640x360', rate = 30, format = 'mp4', args = [] } = {}) => {
    const dir = mkdtempSync(join(tmpdir(), 'wsf-test-'))
    const file = join(dir, `clip.${format}`)
    try {
        const result = spawnSync(
            ffmpegBin,
            [
                '-hide_banner',
                '-loglevel',
                'error',
                '-y',
                '-f',
                'lavfi',
                '-i',
                `testsrc2=size=${size}:rate=${rate}`,
                '-t',
                String(seconds),
                ...args,
                file
            ],
            { encoding: 'utf8' }
        )
        if (result.status !== 0) throw new Error(`ffmpeg failed: ${result.stderr}`)
        return readFileSync(file)
    } finally {
        rmSync(dir, { recursive: true, force: true })
    }
}

export const mp4 = (options = {}) => video({ ...options, args: ['-c:v', 'libx264', '-pix_fmt', 'yuv420p'] })

/** VP9 WebM with a transparent background, like a Telegram video sticker */
export const transparentWebm = () => {
    const dir = mkdtempSync(join(tmpdir(), 'wsf-test-'))
    const file = join(dir, 'clip.webm')
    try {
        const result = spawnSync(
            ffmpegBin,
            [
                '-hide_banner',
                '-loglevel',
                'error',
                '-y',
                '-f',
                'lavfi',
                '-i',
                'color=c=red@0.0:s=512x512:r=15:d=1,format=rgba,drawbox=x=128:y=128:w=256:h=256:color=blue@1:t=fill:replace=1',
                '-c:v',
                'libvpx-vp9',
                '-pix_fmt',
                'yuva420p',
                '-auto-alt-ref',
                '0',
                file
            ],
            { encoding: 'utf8' }
        )
        if (result.status !== 0) throw new Error(`ffmpeg failed: ${result.stderr}`)
        return readFileSync(file)
    } finally {
        rmSync(dir, { recursive: true, force: true })
    }
}

/** Frame count, frame size and per-frame delays of a WebP */
export const inspect = async (webp) => {
    const meta = await sharp(webp, { animated: true }).metadata()
    return {
        format: meta.format,
        width: meta.width,
        height: meta.pageHeight ?? meta.height,
        pages: meta.pages ?? 1,
        delay: meta.delay,
        hasAlpha: meta.hasAlpha
    }
}

/** RGBA pixel at (x, y) of the given frame */
export const pixel = async (webp, x, y, frame = 0) => {
    const { data, info } = await sharp(webp, { animated: true })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true })
    const meta = await sharp(webp, { animated: true }).metadata()
    const frameHeight = meta.pageHeight ?? meta.height
    const i = ((frame * frameHeight + y) * info.width + x) * info.channels
    return [...data.subarray(i, i + 4)]
}
