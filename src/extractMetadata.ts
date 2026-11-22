import webpmux from 'node-webpmux'
import type { IRawMetadata } from './Types'

/** Metadata read from a sticker. Stickers made by other apps can carry extra keys. */
export type ExtractedMetadata = Partial<IRawMetadata> & Record<string, unknown>

/** EXIF tag WhatsApp stores the sticker JSON under ("WA") */
const WHATSAPP_TAG = 0x5741

/**
 * Reads the pack name, author, ID and emojis from a WebP sticker.
 * Returns an empty object when the sticker has no metadata.
 * @param image - The WebP sticker
 * @example
 * const metadata = await extractMetadata(readFileSync('sticker.webp'))
 * console.log(metadata['sticker-pack-name'], metadata['sticker-pack-publisher'])
 */
export const extractMetadata = async (image: Buffer | Uint8Array): Promise<ExtractedMetadata> => {
    const img = new webpmux.Image()
    await img.load(Buffer.isBuffer(image) ? image : Buffer.from(image.buffer, image.byteOffset, image.byteLength))
    return parseExif(img.exif)
}

/** Parses the WhatsApp sticker JSON out of raw EXIF bytes */
export const parseExif = (exif?: Buffer | null): ExtractedMetadata => {
    if (!exif?.length) return {}
    return (readWhatsAppTag(exif) ?? findJson(exif) ?? {}) as ExtractedMetadata
}

const parseObject = (text: string): Record<string, unknown> | undefined => {
    try {
        const value: unknown = JSON.parse(text)
        return value && typeof value === 'object' && !Array.isArray(value)
            ? (value as Record<string, unknown>)
            : undefined
    } catch {
        return undefined
    }
}

/** Walks the TIFF structure and reads the value of the WhatsApp tag */
const readWhatsAppTag = (exif: Buffer): Record<string, unknown> | undefined => {
    try {
        const base = exif.toString('latin1', 0, 6) === 'Exif\0\0' ? 6 : 0
        const order = exif.toString('latin1', base, base + 2)
        if (order !== 'II' && order !== 'MM') return undefined
        const le = order === 'II'
        const u16 = (offset: number) => (le ? exif.readUInt16LE(base + offset) : exif.readUInt16BE(base + offset))
        const u32 = (offset: number) => (le ? exif.readUInt32LE(base + offset) : exif.readUInt32BE(base + offset))
        if (u16(2) !== 42) return undefined
        const ifd = u32(4)
        const entries = u16(ifd)
        for (let i = 0; i < entries; i++) {
            const entry = ifd + 2 + i * 12
            if (u16(entry) !== WHATSAPP_TAG) continue
            const count = u32(entry + 4)
            const offset = count <= 4 ? entry + 8 : u32(entry + 8)
            const start = base + offset
            if (start + count > exif.length) return undefined
            return parseObject(exif.toString('utf-8', start, start + count))
        }
    } catch {
        // Malformed TIFF structure, fall back to scanning
    }
    return undefined
}

/** Fallback for non-standard EXIF data: finds the first `{` that starts a valid JSON object */
const findJson = (exif: Buffer): Record<string, unknown> | undefined => {
    const text = exif.toString('utf-8')
    const end = text.lastIndexOf('}')
    for (let start = text.indexOf('{'); start !== -1 && start < end; start = text.indexOf('{', start + 1)) {
        const value = parseObject(text.slice(start, end + 1))
        if (value) return value
    }
    return undefined
}
