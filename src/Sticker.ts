import { writeFile } from 'node:fs/promises'
import type { Color } from 'sharp'
import { extractMetadata } from './extractMetadata'
import { encodeAudio } from './internal/audio'
import { convert } from './internal/convert'
import { readInput, type StickerInput } from './internal/input'
import Exif from './internal/Metadata/Exif'
import { StickerTypes, isStickerType } from './internal/Metadata/StickerTypes'
import type { Categories, IStickerOptions } from './Types'
import Utils, { defaultBg } from './Utils'

/** Default `maxSize`: 1 MB. WhatsApp may not play animated stickers bigger than this. */
const DEFAULT_MAX_SIZE = 1024 * 1024

/** Room for the EXIF chunk and the RIFF headers that wrap it */
const EXIF_OVERHEAD = 64

/** A finished sticker, ready to send with Baileys: `sock.sendMessage(jid, message)` */
export interface StickerMessage {
    sticker: Buffer
    isAnimated: boolean
    width: number
    height: number
}

/**
 * A sticker with sound, from `toSoundSticker()`. Don't pass this object to Baileys' `sendMessage`,
 * which doesn't support sound stickers and would send it without the sound. See the README for how to send it.
 */
export interface SoundSticker extends StickerMessage {
    /** The sound, as Ogg Opus (mono, 48 kHz). Upload it as `audio/ogg; codecs=opus`. */
    audio: Buffer
    /** Length of the sound in whole seconds, for `audioMessage.seconds` */
    seconds: number
    /** 64 loudness values from 0 to 100, for `audioMessage.waveform` */
    waveform: Uint8Array
}

/**
 * A WhatsApp sticker made from an image, GIF, video or SVG.
 * @example
 * const sticker = new Sticker('./image.png', { pack: 'My Pack', author: 'Me', type: StickerTypes.FULL })
 * await sticker.toFile('sticker.webp')
 */
export class Sticker {
    /** Sticker options. Missing values are filled in with defaults. */
    public metadata: IStickerOptions

    private readonly data: StickerInput

    /**
     * @param data - Buffer, file path, URL, SVG string or readable stream of an image, GIF or video
     * @param metadata - Sticker options
     */
    constructor(data: StickerInput, metadata: Partial<IStickerOptions> = {}) {
        this.data = data
        this.metadata = {
            ...metadata,
            author: metadata.author ?? '',
            pack: metadata.pack ?? '',
            id: metadata.id ?? Utils.generateStickerID(),
            type: isStickerType(metadata.type) ? metadata.type : StickerTypes.DEFAULT,
            background: metadata.background ?? defaultBg
        }
    }

    private get maxDuration(): number {
        const { maxDuration = 10 } = this.metadata
        return maxDuration > 0 ? maxDuration : 10
    }

    private async process(input?: Buffer): Promise<StickerMessage> {
        const { type, background, quality, maxSize = DEFAULT_MAX_SIZE, fps = 15 } = this.metadata
        const exif = new Exif(this.metadata)
        const limit =
            Number.isFinite(maxSize) && maxSize > 0 ? Math.max(1, maxSize - exif.build().length - EXIF_OVERHEAD) : 0
        const result = await convert(input ?? (await readInput(this.data)), {
            type: isStickerType(type) ? type : StickerTypes.DEFAULT,
            background: background ?? defaultBg,
            quality,
            maxSize: limit,
            fps: Math.min(30, Math.max(1, fps)),
            maxDuration: this.maxDuration
        })
        return {
            sticker: await exif.add(result.data),
            isAnimated: result.animated,
            width: result.width,
            height: result.height
        }
    }

    /**
     * Builds the sticker
     * @returns The sticker as a WebP buffer
     * @example
     * const buffer = await new Sticker('./image.png').build()
     */
    public async build(): Promise<Buffer> {
        return (await this.process()).sticker
    }

    /**
     * Alias for `build()`
     * @returns The sticker as a WebP buffer
     */
    public toBuffer(): Promise<Buffer> {
        return this.build()
    }

    /**
     * @deprecated Use `build()` or `toBuffer()` instead
     */
    public get(): Promise<Buffer> {
        return this.build()
    }

    /** Filename used by `toFile()` when none is given */
    public get defaultFilename(): string {
        return `./${this.metadata.pack}-${this.metadata.author}.webp`
    }

    /**
     * Saves the sticker to a file
     * @param filename - Where to save the sticker. Defaults to `./<pack>-<author>.webp`
     * @returns The filename
     */
    public async toFile(filename = this.defaultFilename): Promise<string> {
        await writeFile(filename, await this.build())
        return filename
    }

    /**
     * Builds a message object for Baileys' `sendMessage`. It includes `isAnimated`,
     * which WhatsApp uses to play animated stickers.
     * @example
     * await sock.sendMessage(jid, await sticker.toMessage(), { quoted: msg })
     */
    public toMessage(): Promise<StickerMessage> {
        return this.process()
    }

    /**
     * Builds a sticker with sound: the WebP sticker plus an Ogg Opus audio track. WhatsApp sends
     * the two as separate files, so `sticker` has no sound in it. See the README for sending it with
     * Baileys and `patchBaileysProto()`.
     *
     * Still images work when you pass an `audio` file (`isAnimated` stays `false`). Without `audio`,
     * the input must be a video with an audio track. Both the animation (if any) and the sound are
     * cut to `maxDuration` (10 seconds by default).
     * @param audio - Where the sound comes from. Defaults to the input video's own audio track.
     *   Pass any audio or video file (Buffer, path, URL or stream) to use that sound instead.
     * @example
     * const sound = await new Sticker('./clip.mp4').toSoundSticker()
     * const meme = await new Sticker('./image.png').toSoundSticker('./bruh.mp3')
     */
    public async toSoundSticker(audio?: StickerInput): Promise<SoundSticker> {
        const input = await readInput(this.data)
        const message = await this.process(input)
        if (audio === undefined && !message.isAnimated) {
            throw new Error(
                'A still image has no sound. Pass an audio or video file to toSoundSticker(audio), or use a video with sound.'
            )
        }
        const track = await encodeAudio(audio === undefined ? input : await readInput(audio), this.maxDuration)
        return { ...message, audio: track.data, seconds: track.seconds, waveform: track.waveform }
    }

    /** Sets the sticker pack name */
    public setPack(pack: string): this {
        this.metadata.pack = pack
        return this
    }

    /** Sets the sticker pack author */
    public setAuthor(author: string): this {
        this.metadata.author = author
        return this
    }

    /** Sets the sticker pack ID */
    public setID(id: string): this {
        this.metadata.id = id
        return this
    }

    /** Alias for `setID()` */
    public setId(id: string): this {
        return this.setID(id)
    }

    /**
     * Sets the sticker's emoji categories
     * @example
     * sticker.setCategories(['🤩', '🎉'])
     */
    public setCategories(categories: Categories[]): this {
        this.metadata.categories = categories
        return this
    }

    /** Sets how the input is fitted into the sticker. See {@link StickerTypes}. */
    public setType(type: StickerTypes | (string & {})): this {
        this.metadata.type = type
        return this
    }

    /** Sets the WebP quality, from 1 to 100 */
    public setQuality(quality: number): this {
        this.metadata.quality = quality
        return this
    }

    /** Sets the background colour for `full` stickers */
    public setBackground(background: Color): this {
        this.metadata.background = background
        return this
    }

    /**
     * Reads the metadata from a WebP sticker
     * @param image - The WebP sticker
     */
    public static extractMetadata = extractMetadata
}

/**
 * Makes a sticker in one call. Takes the same arguments as the `Sticker` constructor.
 * @returns The sticker as a WebP buffer
 */
export const createSticker = async (...args: ConstructorParameters<typeof Sticker>): Promise<Buffer> => {
    return new Sticker(...args).build()
}
