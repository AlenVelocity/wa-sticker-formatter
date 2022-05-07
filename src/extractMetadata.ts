import { Image } from 'node-webpmux'
import { IRawMetadata } from '.'

/**
 * Extracts metadata from a WebP image.
 * @param {Buffer}image - The image buffer to extract metadata from
 */
export const extractMetadata = async (image: Buffer): Promise<Partial<IRawMetadata>> => {
    const img = new Image()
    await img.load(image)
    const exif = img.exif?.toString('utf-8') ?? '{}'
    const bracesCount = exif.match(/{/g).length

    let index = 0

    for (let i = 0; i < bracesCount; i++) {
        index = exif.indexOf('{', index + 1)
    }
    
    return JSON.parse(exif.substring(index, exif.lastIndexOf('}') + 1) ?? '{}') as IRawMetadata
}
