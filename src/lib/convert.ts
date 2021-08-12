import sharp from 'sharp'
import videoToGif from './videoToGif'
import sizeOf from 'image-size'
import { writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import crop from './crop'

const convert = async (data: Buffer, mime: string, type: 'crop' | 'full' | 'default' = 'default'): Promise<Buffer> => {
    const isVideo = mime.startsWith('video')
    const image = isVideo ? await videoToGif(data) : data
    if ((isVideo || mime.includes('gif')) && type === 'crop') {
        const filename = `${tmpdir()}/${Math.random().toString(36)}.webp`
        await writeFile(filename, image)
        return convert(await crop(filename), 'image/webp', 'default')
    }

    const img = sharp(image, { pages: -1, animated: isVideo || mime.includes('gif') })
        .toFormat('webp')

    if (type === 'crop') img.resize(512, 512)
    if (type === 'full') {
        const options = ((): sharp.ExtendOptions => {
            let { height, width } = sizeOf(image)
            ;[height, width] = [height || 0, width || 0]
            const [horizontal, vertical] = [
                height > width ? (height - width) / 2 : 0,
                width > height ? (width - height) / 2 : 0
            ].map((number) => Math.round(number))
            return {
                top: vertical,
                left: horizontal,
                right: horizontal,
                bottom: vertical,
                background: {
                    r: 255,
                    g: 255,
                    b: 255,
                    alpha: 0
                }
            }
        })()
        img.extend(options)
    }

    return await img.webp({
            loop: 0,
            quality: 15,
            lossless: false
        }).toBuffer()
}

export default convert
