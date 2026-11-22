import { spawn } from 'node:child_process'

let customPath: string | undefined
let resolved: Promise<string> | undefined

/**
 * Sets the ffmpeg binary used for video stickers.
 *
 * Without this, wa-sticker-formatter uses the `FFMPEG_PATH` environment variable, then the
 * `ffmpeg-static` package if it is installed, then `ffmpeg` from your `PATH`.
 * @param path - Path to the ffmpeg executable
 */
export const setFfmpegPath = (path: string): void => {
    customPath = path
    resolved = undefined
}

const resolveFfmpeg = (): Promise<string> =>
    (resolved ??= (async () => {
        if (customPath) return customPath
        if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH
        try {
            // Optional peer dependency. The specifier is built at runtime so bundlers don't try to resolve it.
            const name = ['ffmpeg', 'static'].join('-')
            const mod = (await import(name)) as { default?: unknown }
            const path = mod.default ?? mod
            if (typeof path === 'string' && path) return path
        } catch {
            // Not installed
        }
        return 'ffmpeg'
    })())

export class FfmpegError extends Error {
    /** Last lines ffmpeg wrote to stderr */
    readonly stderr: string

    constructor(message: string, stderr = '') {
        super(message)
        this.name = 'FfmpegError'
        this.stderr = stderr
    }
}

/** Runs ffmpeg and rejects with its error output when it fails */
export const runFfmpeg = async (args: string[]): Promise<void> => {
    const bin = await resolveFfmpeg()
    await new Promise<void>((resolve, reject) => {
        const proc = spawn(bin, ['-hide_banner', '-nostdin', '-loglevel', 'error', '-y', ...args], {
            stdio: ['ignore', 'ignore', 'pipe'],
            windowsHide: true
        })
        let stderr = ''
        proc.stderr.setEncoding('utf8').on('data', (chunk: string) => {
            stderr = (stderr + chunk).slice(-4000)
        })
        proc.on('error', (err: NodeJS.ErrnoException) => {
            reject(
                err.code === 'ENOENT'
                    ? new FfmpegError(
                          `ffmpeg was not found (tried "${bin}"). Video stickers need ffmpeg: install it from ` +
                              'https://ffmpeg.org/download.html, run `npm i ffmpeg-static`, or set the FFMPEG_PATH ' +
                              'environment variable / call setFfmpegPath().'
                      )
                    : err
            )
        })
        proc.on('close', (code, signal) => {
            if (code === 0) return resolve()
            const output = stderr.trim()
            reject(new FfmpegError(`ffmpeg exited with ${code ?? signal}${output ? `: ${output}` : ''}`, output))
        })
    })
}
