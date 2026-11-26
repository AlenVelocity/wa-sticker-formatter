import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { FfmpegError, runFfmpeg } from './ffmpeg'

export interface StickerAudio {
    /** Ogg Opus, mono, 48 kHz */
    data: Buffer
    /** Length in whole seconds, at least 1 */
    seconds: number
    /** 64 loudness values from 0 to 100, the format WhatsApp uses for voice note waveforms */
    waveform: Uint8Array
}

/** Sample rate of the PCM used to measure the length and draw the waveform */
const PCM_RATE = 8000
const WAVEFORM_BARS = 64

/** Average loudness of each of the 64 bars, scaled so the loudest bar is 100 */
export const waveform = (pcm: Int16Array): Uint8Array => {
    const block = Math.floor(pcm.length / WAVEFORM_BARS)
    const bars = new Float64Array(WAVEFORM_BARS)
    if (block === 0) return new Uint8Array(WAVEFORM_BARS)
    for (let bar = 0; bar < WAVEFORM_BARS; bar++) {
        let sum = 0
        for (let i = bar * block; i < (bar + 1) * block; i++) sum += Math.abs(pcm[i])
        bars[bar] = sum / block
    }
    const loudest = Math.max(...bars)
    return Uint8Array.from(bars, (value) => (loudest > 0 ? Math.floor((100 * value) / loudest) : 0))
}

/**
 * Converts the audio track of any file ffmpeg can read into the Ogg Opus file WhatsApp plays on
 * sound stickers, cut to `maxDuration` seconds.
 */
export const encodeAudio = async (data: Buffer, maxDuration: number): Promise<StickerAudio> => {
    const dir = await mkdtemp(join(tmpdir(), 'wa-sticker-audio-'))
    try {
        const input = join(dir, 'input')
        const output = join(dir, 'audio.ogg')
        const pcm = join(dir, 'audio.pcm')
        await writeFile(input, data)
        try {
            // Only the first audio stream. Without the explicit map, ffmpeg would also put the video
            // (or a cover image) into the Ogg file, which WhatsApp can't play.
            await runFfmpeg([
                '-t',
                String(maxDuration),
                '-i',
                input,
                '-map',
                '0:a:0',
                '-map_metadata',
                '-1',
                '-ac',
                '1',
                '-ar',
                '48000',
                '-c:a',
                'libopus',
                '-b:a',
                '32k',
                '-f',
                'ogg',
                output
            ])
        } catch (err) {
            if (!(err instanceof FfmpegError)) throw err
            if (/matches no streams/i.test(err.stderr)) {
                throw new FfmpegError(
                    'The input has no audio track. Pass a video with sound, or give the audio as a separate ' +
                        'file: toSoundSticker(audio).',
                    err.stderr
                )
            }
            if (/unknown encoder 'libopus'/i.test(err.stderr)) {
                throw new FfmpegError(
                    'This ffmpeg build has no libopus encoder, which sound stickers need. Install a full ffmpeg ' +
                        'build or the ffmpeg-static package.',
                    err.stderr
                )
            }
            throw new FfmpegError(`Could not read the audio: ${err.message}`, err.stderr)
        }

        // Decode what was written, so the length and waveform describe the file WhatsApp gets
        await runFfmpeg(['-i', output, '-ac', '1', '-ar', String(PCM_RATE), '-f', 's16le', pcm])
        const raw = await readFile(pcm)
        // Copied so the Int16Array starts on an even byte offset
        const samples = new Int16Array(new Uint8Array(raw).buffer, 0, Math.floor(raw.length / 2))
        if (samples.length === 0) throw new FfmpegError('The audio track is empty')

        return {
            data: await readFile(output),
            seconds: Math.max(1, Math.round(samples.length / PCM_RATE)),
            waveform: waveform(samples)
        }
    } finally {
        await rm(dir, { recursive: true, force: true })
    }
}
