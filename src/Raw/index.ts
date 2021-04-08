import { exec } from "child_process"
import { existsSync, readFile, writeFileSync } from "fs-extra"
import { tmpdir } from "os"
import { promisify } from 'util'
import webp from '../webp'
const execute = promisify(exec)

/**
 * Converts image into WebP
 * @param path 
 * @param filename 
 */
export const convertToWebp = async (path: string, filename = 'converted'): Promise<string> => {
    if (!existsSync(path)) throw new Error(`File does not exist: ${path}`)
    const type = path.split('.')[1]
    if (type === 'gif') {
        await execute(`${webp('gif2webp')} ${path} -o ${filename}.webp`)
        return `${filename}.webp`
    }
    execute(`${webp('cwebp')} ${path} -o ${filename}.webp`)
    return `${filename}.webp`
}

/**
 * Converts WebP into PNG
 * @param path 
 * @param filename 
 */
export const convertFromWebp = async (path: string, filename = 'converted-from-webp'): Promise<string> => {
    if (!existsSync(path)) throw new Error(`File does not exist: ${path}`)
    await execute(`${webp('dwebp')} ${path} -o ${filename}.png`)
    return `${filename}.png`
}

/**
 * Creates Exif Metadata File
 * @param pack 
 * @param author 
 */
export const createExif = (pack: string, author: string, filename: string): string => {
    const stickerPackID = 'com.etheral.waifuhub.android.stickercontentprovider b5e7275f-f1de-4137-961f-57becfad34f2'
    const json = {
        'sticker-pack-id': stickerPackID,
        'sticker-pack-name': pack,
        'sticker-pack-publisher': author
    }

    let length = new TextEncoder().encode(JSON.stringify(json)).length
    const f = Buffer.from([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00])
    const code = [0x00, 0x00, 0x16, 0x00, 0x00, 0x00]
    if (length > 256) {
        length = length - 256
        code.unshift(0x01)
    } else {
        code.unshift(0x00)
    }
    const fff = Buffer.from(code)
    const ffff = Buffer.from(JSON.stringify(json), 'utf-8')
    let len
    if (length < 16) {
        len = length.toString(16)
        len = '0' + length
    } else {
        len = length.toString(16)
    }

    const ff = Buffer.from(len, 'hex')
    const buffer = Buffer.concat([f, ff, fff, ffff])
    const fn = `${filename}.exif`
    writeFileSync(fn, buffer)
    return fn
}
/**
 * Sets Exif metadata to WebP
 * @param pack 
 * @param author 
 * @param file 
 */
export const setMetadata = async (pack: string, author: string, file: string): Promise<Buffer> => {
    const exif = createExif(pack, author, `${tmpdir()}/${Math.random().toString(36)}`)
    await execute(`${webp('webpmux')} -set exif ${exif} "${file}" -o "${file}"`)
    return await readFile(file)
}
