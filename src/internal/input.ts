import { readFile } from 'node:fs/promises'

/**
 * Anything a sticker can be made from:
 * - a `Buffer`, `Uint8Array` or `ArrayBuffer`
 * - a file path, an `http(s)://`, `data:` or `file://` URL (string or `URL`)
 * - an SVG string
 * - a readable stream or any async iterable of chunks, such as Baileys' `downloadContentFromMessage()`
 */
export type StickerInput = string | URL | Buffer | Uint8Array | ArrayBuffer | AsyncIterable<Uint8Array | string>

const isAsyncIterable = (value: unknown): value is AsyncIterable<Uint8Array | string> =>
    typeof value === 'object' && value !== null && Symbol.asyncIterator in value

const fetchUrl = async (url: URL): Promise<Buffer> => {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to download ${url.href}: ${res.status} ${res.statusText}`.trim())
    return Buffer.from(await res.arrayBuffer())
}

const readPath = async (path: string | URL): Promise<Buffer> => {
    try {
        return await readFile(path)
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
            throw new Error(
                `Input file not found: ${String(path)}. Pass a Buffer, a file path, a URL or an SVG string.`,
                { cause: err }
            )
        }
        throw err
    }
}

/** Reads any supported input into a Buffer */
export const readInput = async (input: StickerInput): Promise<Buffer> => {
    if (Buffer.isBuffer(input)) return input
    if (input instanceof Uint8Array) return Buffer.from(input.buffer, input.byteOffset, input.byteLength)
    if (input instanceof ArrayBuffer) return Buffer.from(input)
    if (input instanceof URL) return input.protocol === 'file:' ? readPath(input) : fetchUrl(input)
    if (typeof input === 'string') {
        const value = input.trim()
        if (/^<(\?xml|svg)[\s>]/i.test(value)) return Buffer.from(value)
        if (/^(https?|data):/i.test(value)) return fetchUrl(new URL(value))
        if (/^file:/i.test(value)) return readPath(new URL(value))
        return readPath(input)
    }
    if (isAsyncIterable(input)) {
        const chunks: Buffer[] = []
        for await (const chunk of input)
            chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : Buffer.from(chunk))
        return Buffer.concat(chunks)
    }
    throw new TypeError(
        'Unsupported sticker input. Pass a Buffer, Uint8Array, file path, URL, SVG string or readable stream.'
    )
}
