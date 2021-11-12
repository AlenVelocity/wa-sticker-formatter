import sharp from 'sharp'
import videoToGif from './videoToGif'
import { writeFile } from 'fs-extra'
import { tmpdir } from 'os'
import crop from './crop'
import { StickerTypes } from './Metadata/StickerTypes'
import { defaultBg } from '../Utils'
import { IStickerOptions } from '..'

const convert = async (
    data: Buffer,
    mime: string,
    {
        quality = 100,
        background = defaultBg,
        type = StickerTypes.DEFAULT,
    }: IStickerOptions): Promise<Buffer> => {
    const isVideo = mime.startsWith('video')
    let image = isVideo ? await videoToGif(data) : data
    const isAnimated = isVideo || mime.includes('gif')

    if (isAnimated && type === 'crop') {
        const filename = `${tmpdir()}/${Math.random().toString(36)}.webp`
        await writeFile(filename, image)
        ;[image, type] = [await crop(filename), StickerTypes.DEFAULT]
    }

    const img = sharp(image, { animated: true }).toFormat('webp')

    if (type === 'crop')
        img.resize(512, 512, {
            fit: 'cover'
        })

    if (type === 'full') {
        const { pages = 1 } = await img.metadata()
        const pageHeight = 512
        img.resize({
            width: pageHeight,
            height: pageHeight * pages,
            fit: 'contain',
            background
        }).webp({
            pageHeight
        })
    }

    return await img
        .webp({
            quality,
            lossless: false
        })
        .toBuffer()
}

export default convert
