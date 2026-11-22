/**
 * How the input is fitted into WhatsApp's 512x512 sticker canvas.
 *
 * Can be used as a value (`StickerTypes.FULL`) or as a type (`type: StickerTypes`).
 */
export const StickerTypes = {
    /** Keep the original aspect ratio. Anything larger than 512x512 is scaled down to fit. */
    DEFAULT: 'default',
    /** Scale and crop from the centre to exactly 512x512. */
    CROPPED: 'crop',
    /** Scale to fit inside 512x512 and fill the empty space with `background`. */
    FULL: 'full',
    /** Crop to 512x512 and cut out a circle. */
    CIRCLE: 'circle',
    /** Crop to 512x512 with rounded corners. */
    ROUNDED: 'rounded'
} as const

export type StickerTypes = (typeof StickerTypes)[keyof typeof StickerTypes]

export const isStickerType = (value: unknown): value is StickerTypes =>
    (Object.values(StickerTypes) as unknown[]).includes(value)
