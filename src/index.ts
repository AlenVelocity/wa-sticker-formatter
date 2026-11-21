import { Sticker } from './Sticker'

export { Sticker, createSticker, type StickerMessage } from './Sticker'
export { extractMetadata, parseExif, type ExtractedMetadata } from './extractMetadata'
export type * from './Types'
export type { StickerInput } from './internal/input'
export { setFfmpegPath, FfmpegError } from './internal/ffmpeg'
export { default as StickerMetadata } from './internal/Metadata/StickerMetadata'
export { default as Exif } from './internal/Metadata/Exif'
export { StickerTypes } from './internal/Metadata/StickerTypes'
export default Sticker
