import { Image } from 'node-webpmux'
import { IRawMetadata } from '.'

export const extractMetadata = async (image: Buffer): Promise<Partial<IRawMetadata>> => {
    const img = new Image()
    await img.load(image)
    const exif = img.exif.toString('utf-8')
    return JSON.parse(exif.substring(exif.indexOf('{'), exif.lastIndexOf('}') + 1) ?? '{}') as IRawMetadata
}
