import { Categories, IStickerConfig, IStickerOptions } from '../../Types'
import Utils from '../../Utils'

export default class StickerMetadata implements IStickerOptions {
    crop = false
    full = false
    constructor(
        public pack = '',
        public author = '',
        public categories: Categories[] = [],
        public id = Utils.generateStickerID()
    ) {}

    from = (object: Partial<this>): StickerMetadata => {
        return new StickerMetadata(object.pack, object.author, object.categories, object.id)
    }

    setPack = (title: string): this => {
        this.pack = title
        return this
    }

    setAuthor = (author: string): this => {
        this.author = author
        return this
    }

    setId = (id: string): this => {
        this.id = id
        return this
    }

    setCrop = (value: boolean): this => {
        this.crop = value
        this.full = !value
        return this
    }

    setFull = (value: boolean): this => {
        this.crop = !value
        this.full = value
        return this
    }

    setCategories = (categories: string | string[]): this => {
        this.categories = (
            typeof categories === 'string' ? categories.split(',').map((emoji) => emoji.trim()) : categories
        ) as Categories[]
        return this
    }

    toJSON = (): IStickerConfig => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const obj: any = {}
        Object.keys(this)
            .filter((key) => typeof this[key as keyof this] !== 'function')
            .forEach((key) => (obj[key] = this[key as keyof IStickerConfig] as IStickerConfig[keyof IStickerConfig]))
        return obj as IStickerConfig
    }
}
