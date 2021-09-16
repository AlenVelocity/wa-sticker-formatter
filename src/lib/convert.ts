import sharp from 'sharp'
import videoToGif from './videoToGif'
import { writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import crop from './crop'

const convert = async (
    data: Buffer,
    mime: string,
    type: 'crop' | 'full' | 'default' = 'default',
    quality = 100
): Promise<Buffer> => {
    const isVideo = mime.startsWith('video')
    const image = isVideo ? await videoToGif(data) : data
    const isAnimated = isVideo || mime.includes('gif')
    if (isAnimated && type === 'crop') {
        const filename = `${tmpdir()}/${Math.random().toString(36)}.webp`
        await writeFile(filename, image)
        return convert(await crop(filename), 'image/webp', 'default')
    }

    const img = sharp(image, { animated: true }).toFormat('webp')

    if (type === 'crop')
        img.resize(512, 512, {
            fit: 'cover'
        })

    if (type === 'full') {
        const { pages = 1 } = await img.metadata()
        const width = 512
        return await img
            .resize({
                width,
                height: width * pages,
                fit: 'contain',
                background: {
                    r: 0,
                    g: 0,
                    b: 0,
                    alpha: 0
                }
            })
            .webp({
                pageHeight: width
            })
            .toBuffer()
    }

    return await img
        .webp({
            quality
        })
        .toBuffer()
}

export default convert
