import sharp from 'sharp'
import videoToGif from './videoToGif'
import sizeOf from 'image-size'
import gifFrames from 'gif-frames'
import { tmpdir } from 'os'
import { createWriteStream } from 'fs'
import { readFile } from 'fs/promises'
import imagesToWebp from './imagesToWebp'

const convert = async (data: Buffer, mime: string, type: 'crop' | 'full' | 'default' = 'default'): Promise<Buffer> => {
    const sticker = await convertSticker(data, mime, type)
    return Buffer.isBuffer(sticker)
        ? sticker
        : await (async () => {
              const filename = `${tmpdir()}/${Math.random()}.webp`
              await sticker.toFile(filename)
              return await readFile(filename)
          })()
}

const convertSticker = async (
    data: Buffer,
    mime: string,
    type: 'crop' | 'full' | 'default' = 'default'
): Promise<sharp.Sharp | Buffer> => {
    const isVideo = mime.startsWith('video')
    const image = isVideo ? await videoToGif(data) : data
    if ((isVideo || mime.includes('gif')) && type !== 'default') {
        const frames = await gifFrames({
            url: image,
            frames: 'all',
            cumulative: true
        })
        const filename = `${tmpdir()}/${Math.random().toString(36)}_{}.png`
        await Promise.all(
            frames.map(async (gif, index) => {
                const file = filename.replace('{}', `${index}`)
                const stream = createWriteStream(file)
                gif.getImage().pipe(stream)
                await new Promise((resolve) => {
                    stream.on('finish', resolve)
                })
                await ((await convertSticker(await readFile(file), 'image/png', type)) as sharp.Sharp).toFile(file)
                return file
            })
        )
        //TODO: Find a way to convert GIF with transparent backgrouns
        return await imagesToWebp(filename.replace('{}', '%d'))
    }
    const img = sharp(image, { pages: -1 })
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

    return img
}

export default convert
