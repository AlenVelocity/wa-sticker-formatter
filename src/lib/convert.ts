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

    if (type === 'crop') img.resize(512, 512, { fit: 'contain' })

    if (type === 'full') {
        const { height = 0, width = 0, pages = 1 } = await img.metadata()
        const pageHeight = height / pages
        if (height !== width) {
            const [sub, compare] = [Math.abs(pageHeight - width), pageHeight > width]
            const [horizontal, vertical] = [compare ? sub : 0, compare ? 0 : sub].map((x) => Math.round(x / 2))
            return await img
                .webp({
                    quality,
                    pageHeight: Math.max(pageHeight, width)
                })
                .extend({
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
                })
                .toBuffer()
        }
    }

    return await img
        .webp({
            quality
        })
        .toBuffer()
}

export default convert
