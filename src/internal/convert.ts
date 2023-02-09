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
    const isAnimated = isVideo || mime.includes('gif') || mime.includes('webp')

    if (isAnimated && ['crop', 'circle', 'rouded'].includes(type)) {
        const filename = `${tmpdir()}/${Math.random().toString(36)}.webp`
        await writeFile(filename, image)
        ;[image, type] = [
            await crop(filename),
            type === StickerTypes.CIRCLE
                ? StickerTypes.CIRCLE
                : type === StickerTypes.ROUNDED
                ? StickerTypes.ROUNDED
                : StickerTypes.DEFAULT
        ]
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
                        `<svg width="512" height="512"><circle cx="256" cy="256" r="256" fill="${background}"/></svg>`
                    ),
                    blend: 'dest-in',
                    gravity: 'northeast',
                    tile: true
                }
            ])
            break

        case StickerTypes.ROUNDED:
            img.resize(512, 512, {
                fit: fit.cover
            }).composite([
                {
                    input: Buffer.from(
                        `<svg width="512" height="512"><rect rx="50" ry="50" width="512" height="512" fill="${background}"/></svg>`
                    ),
                    blend: 'dest-in',
                    gravity: 'northeast',
                    tile: true
                }
            ])
            break

        case StickerTypes.STAR:
            img.resize(512, 512, {
                fit: fit.cover
            }).composite([
                {
                    input: Buffer.from(
                        `<svg width="512" height="512"><path d="m256 33.28 61.133 172.083H481.28L347.341 306.432l47.898 177.357L256 377.446 116.787 483.788l47.872-177.357L30.694 205.362h164.147L256 33.28z" fill="${background}"/></svg>`
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
