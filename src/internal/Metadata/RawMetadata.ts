import type { IRawMetadata, Metadata } from '../../Types'
import Utils from '../../Utils'

export default class RawMetadata implements IRawMetadata {
    'sticker-pack-id': string
    'sticker-pack-name': string
    'sticker-pack-publisher': string
    'android-app-store-link'?: string
    'ios-app-store-link'?: string
    emojis: string[]

    constructor(options: Metadata) {
        this['sticker-pack-id'] = options.id || Utils.generateStickerID()
        this['sticker-pack-name'] = options.pack || ''
        this['sticker-pack-publisher'] = options.author || ''
        if (options.androidAppStoreLink) this['android-app-store-link'] = options.androidAppStoreLink
        if (options.iosAppStoreLink) this['ios-app-store-link'] = options.iosAppStoreLink
        this.emojis = options.categories || []
    }
}
