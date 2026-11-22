import type { Categories, IStickerConfig } from '../../Types'
import Utils from '../../Utils'

/**
 * Builder for sticker metadata, kept from v3.
 * @deprecated Pass options to `new Sticker(input, options)` or use the `Sticker` setters instead.
 */
export default class StickerMetadata implements IStickerConfig {
    public crop = false
    public full = false
    public pack: string
    public author: string
    public categories: Categories[]
    public id: string

    constructor(pack = '', author = '', categories: Categories[] = [], id = Utils.generateStickerID()) {
        this.pack = pack
        this.author = author
        this.categories = categories
        this.id = id
    }

    static from = (object: Partial<StickerMetadata>): StickerMetadata => {
        return new StickerMetadata(object.pack, object.author, object.categories, object.id)
    }

    public setPack = (title: string): this => {
        this.pack = title
        return this
    }

    public setAuthor = (author: string): this => {
        this.author = author
        return this
    }

    public setId = (id: string): this => {
        this.id = id
        return this
    }

    public setCrop = (value: boolean): this => {
        this.crop = value
        this.full = !value
        return this
    }

    public setFull = (value: boolean): this => {
        this.crop = !value
        this.full = value
        return this
    }

    public setCategories = (categories: string | string[]): this => {
        this.categories =
            typeof categories === 'string' ? categories.split(',').map((emoji) => emoji.trim()) : categories
        return this
    }

    public toJSON = (): IStickerConfig & { crop: boolean; full: boolean } => ({
        crop: this.crop,
        full: this.full,
        pack: this.pack,
        author: this.author,
        categories: this.categories,
        id: this.id
    })
}
