import Ffmpeg from 'fluent-ffmpeg'
import { readFile } from 'fs/promises'
import { tmpdir } from 'os'

const imagesToWebp = async (filename: string): Promise<Buffer> => {
    const file = await new Promise<string>((resolve) => {
        const name = `${tmpdir()}/${Math.random().toString(36)}.webp`
        Ffmpeg(filename)
            .outputOption('-lavfi split[v],palettegen,[v]paletteuse')
            .outputOption('-vcodec libwebp')
            .outputFPS(10)
            .loop(0)
            .save(name)
            .on('end', () => resolve(name))
    })
    return await readFile(file)
}

export default imagesToWebp
