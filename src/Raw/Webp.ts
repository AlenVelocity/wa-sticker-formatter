import { exec } from 'child_process'
import { existsSync } from 'fs-extra'
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