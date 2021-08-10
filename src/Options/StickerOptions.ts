import StickerMetadata from './StickerMetadata'
import { IStickerOptions } from '../Types'

export default class StickerOptions extends StickerMetadata implements IStickerOptions {
    constructor(public crop = true, ...args: ConstructorParameters<typeof StickerMetadata>) {
        super(...args)
    }

    setCropped = (value: boolean): this => {
        this.crop = value
        return this
    }
}
