import type { Color } from 'sharp'
import type { StickerTypes } from './internal/Metadata/StickerTypes'

/** Metadata embedded in the sticker. WhatsApp shows the pack name and author when someone taps the sticker. */
export interface IStickerConfig {
    /** Sticker pack name (shown in bold) */
    pack?: string
    /** Sticker pack author / publisher */
    author?: string
    /** Sticker pack ID. A random one is generated when omitted. */
    id?: string
    /** Emojis that describe the sticker. Learn more: https://github.com/WhatsApp/stickers/wiki/Tag-your-stickers-with-Emojis */
    categories?: Categories[]
    /** Google Play link to the app that made the sticker. Stickers from sticker-maker apps carry this link. */
    androidAppStoreLink?: string
    /** App Store link to the app that made the sticker. */
    iosAppStoreLink?: string
}

export interface IStickerOptions extends IStickerConfig {
    /**
     * How the input is fitted into the 512x512 sticker canvas. See {@link StickerTypes}.
     * Defaults to `'default'`: keep the aspect ratio, scale down to fit if larger than 512x512.
     */
    type?: StickerTypes | (string & {})
    /**
     * WebP quality from 1 to 100. Defaults to 100 for still stickers and 80 for animated ones.
     * If the sticker comes out bigger than `maxSize`, quality is lowered until it fits.
     */
    quality?: number
    /**
     * Background colour for the empty space in `full` stickers.
     * A CSS colour string (`'#ffffff'`, `'white'`) or `{ r, g, b, alpha }`. Defaults to transparent.
     */
    background?: Color
    /**
     * Largest allowed size of the finished sticker in bytes. When the sticker is bigger, quality
     * (and, for videos, frame rate) is lowered step by step until it fits.
     * Defaults to 1 MB, which WhatsApp plays reliably. WhatsApp's own guideline for animated stickers
     * is 500 KB (`500 * 1024`). Set to `0` or `Infinity` to turn the size limit off.
     */
    maxSize?: number
    /** Frames per second for stickers made from videos. Defaults to 15. */
    fps?: number
    /** Longest animation to keep, in seconds. Longer videos and GIFs are cut. Defaults to 10, WhatsApp's limit. */
    maxDuration?: number
}

/** The JSON stored in a sticker's EXIF data, as read by WhatsApp */
export interface IRawMetadata {
    emojis: string[]
    'sticker-pack-id': string
    'sticker-pack-name': string
    'sticker-pack-publisher': string
    'android-app-store-link'?: string
    'ios-app-store-link'?: string
}

export type Metadata = IStickerConfig | IStickerOptions

type Love =
    | '❤'
    | '😍'
    | '😘'
    | '💕'
    | '😻'
    | '💑'
    | '👩‍❤‍👩'
    | '👨‍❤‍👨'
    | '💏'
    | '👩‍❤‍💋‍👩'
    | '👨‍❤‍💋‍👨'
    | '🧡'
    | '💛'
    | '💚'
    | '💙'
    | '💜'
    | '🖤'
    | '💔'
    | '❣'
    | '💞'
    | '💓'
    | '💗'
    | '💖'
    | '💘'
    | '💝'
    | '💟'
    | '♥'
    | '💌'
    | '💋'
    | '👩‍❤️‍💋‍👩'
    | '👨‍❤️‍💋‍👨'
    | '👩‍❤️‍👨'
    | '👩‍❤️‍👩'
    | '👨‍❤️‍👨'
    | '👩‍❤️‍💋‍👨'
    | '👬'
    | '👭'
    | '👫'
    | '🥰'
    | '😚'
    | '😙'
    | '👄'
    | '🌹'
    | '😽'
    | '❣️'
    | '❤️'
type Happy =
    | '😀'
    | '😃'
    | '😄'
    | '😁'
    | '😆'
    | '😅'
    | '😂'
    | '🤣'
    | '🙂'
    | '😛'
    | '😝'
    | '😜'
    | '🤪'
    | '🤗'
    | '😺'
    | '😸'
    | '😹'
    | '☺'
    | '😌'
    | '😉'
    | '🤗'
    | '😊'
type Sad =
    | '☹'
    | '😣'
    | '😖'
    | '😫'
    | '😩'
    | '😢'
    | '😭'
    | '😞'
    | '😔'
    | '😟'
    | '😕'
    | '😤'
    | '😠'
    | '😥'
    | '😰'
    | '😨'
    | '😿'
    | '😾'
    | '😓'
    | '🙍‍♂'
    | '🙍‍♀'
    | '💔'
    | '🙁'
    | '🥺'
    | '🤕'
    | '☔️'
    | '⛈'
    | '🌩'
    | '🌧'
type Angry =
    | '😯'
    | '😦'
    | '😧'
    | '😮'
    | '😲'
    | '🙀'
    | '😱'
    | '🤯'
    | '😳'
    | '❗'
    | '❕'
    | '🤬'
    | '😡'
    | '😠'
    | '🙄'
    | '👿'
    | '😾'
    | '😤'
    | '💢'
    | '👺'
    | '🗯️'
    | '😒'
    | '🥵'
type Greet = '👋'
type Celebrate =
    | '🎊'
    | '🎉'
    | '🎁'
    | '🎈'
    | '👯‍♂️'
    | '👯'
    | '👯‍♀️'
    | '💃'
    | '🕺'
    | '🔥'
    | '⭐️'
    | '✨'
    | '💫'
    | '🎇'
    | '🎆'
    | '🍻'
    | '🥂'
    | '🍾'
    | '🎂'
    | '🍰'

/**
 * Sticker category emoji. Any emoji string is accepted; the listed ones show up in editor autocomplete.
 * Learn more: https://github.com/WhatsApp/stickers/wiki/Tag-your-stickers-with-Emojis
 */
export type Categories = Love | Happy | Sad | Angry | Greet | Celebrate | (string & {})
