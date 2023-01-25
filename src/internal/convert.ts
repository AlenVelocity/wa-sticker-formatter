import sharp, { fit } from 'sharp'
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
    { quality = 100, background = defaultBg, type = StickerTypes.DEFAULT }: IStickerOptions
): Promise<Buffer> => {
    const isVideo = mime.startsWith('video')
    let image = isVideo ? await videoToGif(data) : data
    const isAnimated = isVideo || mime.includes('gif')

    if (isAnimated && [StickerTypes.CROPPED, StickerTypes.CIRCLE].includes(type)) {
        const filename = `${tmpdir()}/${Math.random().toString(36)}.webp`
        await writeFile(filename, image)
        ;[image, type] = [await crop(filename), type === StickerTypes.CIRCLE ? StickerTypes.CIRCLE : StickerTypes.DEFAULT]
    }

    const img = sharp(image, { animated: isAnimated }).toFormat('webp')
    
    switch (type) {
        case StickerTypes.CROPPED:
            img.resize(512, 512, {
                fit: fit.cover
            })
            break

        case StickerTypes.FULL:
            img.resize(512, 512, {
                fit: fit.contain,
                background
            })
            break

        case StickerTypes.CIRCLE:
            img.resize(512, 512, {
                fit: fit.cover
            }).composite([
                {
                    input: Buffer.from(
                        `<svg><circle cx="256" cy="256" r="256" fill="${background}"/></svg>`
                    ),
                    blend: 'dest-in',
                    gravity: 'northeast',
                    tile: true
                }
            ])            
            break
    }

    return await img
        .webp({
            quality,
            lossless: false
        })
        .toBuffer()
}

export default convert
