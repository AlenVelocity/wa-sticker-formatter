import { exec } from 'child_process'
import { promisify } from 'util'
import { readFile, writeFile, writeFileSync } from 'fs-extra'
import { tmpdir } from 'os'

import webp from '../webp'

const execute = promisify(exec)

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

/**
 * Adds metadata to the given webp buffer and returns the new buffer
 * @param buffer
 * @param pack
 * @param author
 * @returns webpbuffer
 */
export const addMetadataToWebpBuffer = async (buffer: Buffer, pack: string, author: string): Promise<Buffer> => {
    const filename = `${tmpdir()}/${Math.random().toString(36)}`
    await writeFile(filename, buffer)
    return await setMetadata(pack, author, filename)
}
