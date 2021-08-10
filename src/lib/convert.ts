import { tmpdir } from 'os'
import sharp from 'sharp'
import videoToGif from './videoToGif'
import sizeOf from 'image-size'

const toWebp = async (image: Buffer, options?: sharp.SharpOptions, extend?: sharp.ExtendOptions): Promise<string> => {
    const filename = `${tmpdir()}/${Math.random()}.webp`
    const img = sharp(image, options).resize({ height: 512 })
    if (extend) img.extend(extend)
    await img.toFile(filename)
    return filename
}

const convert = async (data: Buffer, mime: string, crop: boolean): Promise<string> => {
    const isVideo = mime.startsWith('video')
    const image = isVideo ? await videoToGif(data) : data
    const options = isVideo || mime.includes('gif') ? { pages: -1 } : undefined
    const cropOptions = crop
        ? undefined
        : ((): sharp.ExtendOptions => {
              let { height, width } = sizeOf(image)
              ;[height, width] = [height || 0, width || 0]
              const [horizontal, vertical] = [
                  height > width ? (height - width) / 2 : 0,
                  width > height ? (width - height) / 2 : 0
              ]
              return {
                  top: vertical,
                  left: horizontal,
                  right: horizontal,
                  bottom: vertical
              }
          })()
    return await toWebp(image, options, cropOptions)
}

export default convert
