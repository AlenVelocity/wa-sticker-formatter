import ffmpeg from 'fluent-ffmpeg'
import { writeFile, readFile, unlink } from 'fs/promises'
import { tmpdir } from 'os'

/** https://stackoverflow.com/questions/52156713/fluent-ffmpeg-h264-to-gif-throwing-error-1 */
const videoToGif = async (data: Buffer): Promise<Buffer> => {
    const filename = `${tmpdir()}/${Math.random().toString(36)}`
    const [video, gif] = ['video', 'gif'].map((ext) => `${filename}.${ext}`)
    await writeFile(video, data)
    await new Promise((resolve) => {
        ffmpeg(video).save(gif).on('end', resolve)
    })
    const buffer = await readFile(gif)
    ;[video, gif].forEach((file) => unlink(file))
    return buffer
}

export default videoToGif
