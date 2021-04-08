import { IProcessOptions } from '../typings'
import Exif from './Exif'
import * as fs from 'fs-extra'
import axios from 'axios'
import { fromBuffer } from 'file-type'
import ffmpeg from 'fluent-ffmpeg'
import * as streamifier from 'streamifier'
import { Stream } from 'stream'
import gifFrames from 'gif-frames'
import sizeOf from 'image-size'
import * as Jimp from 'jimp'

export default class Build extends Exif {
    /**
     * Builds sticker
     * @param processOptions
     */
    async build(processOptions: IProcessOptions = this.processOptions): Promise<void> {
        this.processOptions = processOptions
        if (typeof this.data === 'string') {
            if (this.data.startsWith('./')) {
                if (!fs.existsSync(this.data)) throw new Error(`${this.data} filepath does not exist`)
                this.data = await fs.readFile(this.data)
            } else {
                this.data = (await axios.get(this.data, { responseType: 'arraybuffer' })).data
            }
        }

        const mime = (await fromBuffer(this.data as Buffer))?.mime
        if (!mime) throw new Error('Invalid Input')
        this.mime = mime
        if ((this.mime === 'image/gif' || this.mime === 'video/mp4') && this.config) this.config.animated = true
        if (!this.config?.animated) {
            const file = !this.config?.crop ? await this.staticNoCrop() : await this.static()
            await this.addMetadata(file)
            this.final = file
        }
        if (this.config?.animated) {
            const file = !this.config.crop ? await this.animatedNoCrop() : await this.animated()
            await this.addMetadata(file)
            this.final = file
            return
        }
    }

    /**
     * @returns {string} Filename
     */
    async animated(): Promise<string> {
        const filename = `${this.path}/${Math.random().toString()}`
        const stream = await streamifier.createReadStream(this.data as Buffer)
        await new Promise((resolve, reject) => {
            ffmpeg(stream)
                .inputFormat((this.mime as string) === this.supportedTypes[1] ? 'gif' : 'mp4')
                .on('error', function (err) {
                    reject(err)
                })
                .addOutputOptions(this.outputOptions)
                .toFormat('webp')
                .on('end', () => {
                    resolve(true)
                })
                .saveToFile(`${filename}.webp`)
        })
        return `${filename}.webp`
    }

    /**
     * Creates animated sticker without with transparant borders
     * @returns {string} Filename
     */
    async animatedNoCrop(): Promise<string> {
        const rn = Math.random()
        const fileName = `${this.path}/${rn.toString(36)}`
        const fileNameF = `${this.path}/${rn.toString(36)}`
        const sv = `${fileName}${(this.mime as string) === this.supportedTypes[0] ? '.mp4' : '.gif'}`
        await fs.writeFile(sv, this.data)
        if ((this.mime as string) === this.supportedTypes[0])
            await this.exec(`ffmpeg -y -i ${fileName}.mp4 ${fileName}.gif`, {})
        let frames = []
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (gifFrames as any)({ url: fileName + '.gif', frames: 'all' }).then(function (
            frameData: {
                getImage(): Stream
            }[]
        ) {
            frameData[0].getImage().pipe(fs.createWriteStream(fileName + '.png'))
            frames = frameData
        })
        if (frames.length < 7)
            await this.exec('convert ' + fileName + '.gif ' + fileName + '.gif  ' + fileName + '.gif', {})

        await this.exec('convert ' + fileName + '.gif -coalesce -delete 0 ' + fileName + '.gif', {})
        const dimensions = sizeOf(fileName + '.gif')
        let success = true
        let colors
        while (success) {
            await Jimp.read(fileName + '.png')
                .then((image) => {
                    for (let i = 1; i < (dimensions?.width ? dimensions.width : 1); i++) {
                        for (let j = 1; j < (dimensions?.height ? dimensions.height : 1); j++) {
                            colors = Jimp.intToRGBA(image.getPixelColor(i, j))
                            if (colors.r > 155) {
                                colors.r = colors.r - 5
                            } else {
                                colors.r = colors.r + 5
                            }
                            if (colors.g > 155) {
                                colors.g = colors.g - 5
                            } else {
                                colors.g = colors.g + 5
                            }
                            if (colors.b > 155) {
                                colors.b = colors.b - 5
                            } else {
                                colors.b = colors.b + 5
                            }
                            if (colors.a > 155) {
                                colors.a = colors.a - 5
                            } else {
                                colors.a = colors.a + 5
                            }

                            const hex = Jimp.rgbaToInt(colors.r, colors.g, colors.b, colors.a)
                            image.setPixelColor(hex, i, j)
                            success = false
                        }
                    }
                    image.write(fileNameF + '.png')
                })
                .catch((err) => {
                    throw new Error(err.message)
                })
        }
        if (dimensions.width && dimensions.height && dimensions.width < dimensions.height) {
            await this.exec(
                'mogrify -bordercolor transparent -border ' +
                    (dimensions.height - dimensions.width) / 2 +
                    'x0 ' +
                    fileName +
                    '.gif',
                {}
            )
            await this.exec(
                'mogrify -bordercolor transparent -border ' +
                    (dimensions.height - dimensions.width) / 2 +
                    'x0 ' +
                    fileNameF +
                    '.png',
                {}
            )
        }
        if (dimensions.width && dimensions.height && dimensions.width > dimensions.height) {
            await this.exec(
                'mogrify -bordercolor transparent -border 0x' +
                    (dimensions.width - dimensions.height) / 2 +
                    ` ${fileName}.gif`,
                {}
            )
            await this.exec(
                'mogrify -bordercolor transparent -border 0x' +
                    (dimensions.width - dimensions.height) / 2 +
                    ` ${fileNameF}.png`,
                {}
            )
        }
        await this.exec('convert ' + fileNameF + '.png ' + fileName + '.gif -resize 256x256 ' + fileName + '.gif', {})
        await this.exec(`${this.git2webp} ${fileName}.gif -o ${fileName}.webp`)
        return `${fileName}.webp`
    }

    /**
     * Creates Static sticker
     * @returns {string} Filename
     */
    async static(): Promise<string> {
        const file = `${this.path}/${Math.random().toString()}`
        fs.writeFileSync(`${file}.png`, this.data as Buffer)
        await this.exec(`${this.cwebp} ${file}.png -o ${file}.webp`)
        return `${file}.webp`
    }

    /**
     * Creates static sticker with transparent borders
     * @returns {string} Filename
     */
    async staticNoCrop(): Promise<string> {
        const filename = `${this.path}/${Math.random().toString(36)}`
        fs.writeFileSync(`${filename}.png`, this.data as Buffer)
        const dimensions = sizeOf(this.data as string)
        if (dimensions.width && dimensions.height && dimensions.width < dimensions.height)
            await this.exec(
                `mogrify -bordercolor transparent -border ${
                    (dimensions.height - dimensions.width) / 2
                }x0 ${filename}.png`
            )
        if (dimensions.width && dimensions.height && dimensions.width > dimensions.height)
            await this.exec(
                `mogrify -bordercolor transparent -border 0x${
                    (dimensions.width - dimensions.height) / 2
                } ${filename}.png`
            )
        await this.exec(`${this.cwebp} ${filename}.png -o ${filename}.webp`)
        return `${filename}.webp`
    }
}
