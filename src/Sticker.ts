import ffmpeg from 'fluent-ffmpeg'
import axios from 'axios'
import { exec as ex } from 'child_process'
import util from 'util'
import * as fs from 'fs-extra'
import os from 'os'
import sizeOf from 'image-size'
import * as Jimp from 'jimp'

const streamifier = require('streamifier')
const gifFrames = require('gif-frames')

const exec = util.promisify(ex)



import ft, { mimeTypes } from 'file-type'

export class Sticker {

    /**
     * Supported MimeTypes
    */
    supportedTypes = ['video/mp4', 'image/gif', 'image/jpeg', 'image/png']
    /**
     * Buffer of the image/video provided
    */
    private data: Buffer | string
   

    /**
     * Sticker Config
     */
    config: {
        animated: boolean
        crop: boolean
        pack: string
        author: string
    }
    /**
     * path of the file
    */
    private path: string

    /**
     * Processoptions to pass to ffmpeg
    */
    processOptions: processOptions = {
            fps: 15,
            startTime: `00:00:00.0`,
            endTime: `00:00:10.0`,
            loop: 0,
    }
    private final: string = ''

    /**
     * MimeType of the buffer provided
    */
    private mime = ''

    /**
     * Creates a new instance of the "Sticker Class"
     * @param data 
     * @param param1 
     */
    constructor(data: Buffer | string, { animated = false, crop = true, author = 'WA-STICKER-FORMATTER', pack = 'MADE USING'}) {
        this.data = data
        this.config = {
            animated,
            crop,
            author,
            pack,
        }
        this.path = os.tmpdir()
    }

    /**
     * Builds the sticker 
     * @param processOptions
     */
    async build(processOptions: processOptions = this.processOptions) {
        this.processOptions = processOptions
        if (typeof this.data === 'string') {
            if (this.data.startsWith('./')) {
                if (!fs.existsSync(this.data)) throw new Error(`${this.data} filepath does not exist`)
                this.data = await fs.readFile(this.data)
            } else {
                this.data = (await axios.get(this.data, { responseType: 'arraybuffer'})).data
            }
        }
    
        const mime = (await ft.fromBuffer((this.data as any)))?.mime
        if (!mime) throw new Error('Invalid Input')
        this.mime = mime
        if (this.mime === 'image/gif' || this.mime === 'video/mp4') this.config.animated = true
        if (!this.config.animated) {
                const file = (!this.config.crop) ? await this.staticNoCrop() : await this.static()
                await this.addMetadata(file)
                this.final = file
        }
        if (this.config.animated) {
            const file = (!this.config.crop) ? await this.animatedNoCrop() : await this.animated()
            await this.addMetadata(file)
            this.final = file
            return
        }
    
    
    }
    /**
     * @returns {Buffer} Returns the build result
     */
    async get() {
        const buffer = fs.readFileSync(this.final)
        return buffer
    }

    /**
     * @returns {string} Filename
     */
    async animated() {
        const filename = `${this.path}/${Math.random().toString()}`
        const stream = await (streamifier as any).createReadStream(this.data)
            let success = await new Promise((resolve, reject) => {
            var command = ffmpeg(stream)
                .inputFormat((this.mime as any) === this.supportedTypes[1] ? 'gif' : 'mp4')
                .on('error', function (err) {
                    console.log('An error occurred: ' + err.message)
                    reject(err)
                })
                .on('start', function (cmd) {
                    //console.log('Started ' + cmd);
                })
                .addOutputOptions(this.outputOptions)
                .toFormat('webp')
                .on('end', () => {
                    resolve(true);
                })
                .saveToFile(`${filename}.webp`)
            })
            return `${filename}.webp`
    }

    /**
     * Creates animated sticker without with transparant borders
     * @returns {string} Filename
     */
    async animatedNoCrop() {
        const rn = Math.random()
        const fileName = `${this.path}/${rn.toString(36)}`
        const fileNameF = `${this.path}/${rn.toString(36)}`
        const sv = `${fileName}${(this.mime as any) === this.supportedTypes[0] ? '.mp4' : '.gif'}`
        await fs.writeFile(sv, this.data)
        if ((this.mime as any) === this.supportedTypes[0]) await exec(`ffmpeg -y -i ${fileName}.mp4 ${fileName}.gif`, {})
        let frames = ''
        await (gifFrames as any)({ url: fileName+'.gif', frames: 'all' }).then(function (frameData: any) {
           frameData[0].getImage().pipe(fs.createWriteStream(fileName + '.png'))
           frames = frameData
        })  
        if (frames.length < 7) await exec('convert ' + fileName + '.gif ' + fileName + '.gif  ' + fileName + '.gif', {})
  
        await exec('convert ' + fileName + '.gif -coalesce -delete 0 ' + fileName + '.gif', {})
        var dimensions = await sizeOf(fileName+ '.gif')
        let success = true
        let colors;
        while (success) {
            await Jimp.read(fileName + '.png')
            .then((image) => {
                for (let i = 1; i < dimensions.width!; i++) {
                for (let j = 1; j < dimensions.height!; j++) {
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
  
                let hex = Jimp.rgbaToInt(colors.r, colors.g, colors.b, colors.a)
                  image.setPixelColor(hex, i, j) 
                success = false
              }
            }
            image.write(fileNameF + '.png')
          })
          .catch((err) => {
          })
      }
      if (dimensions.width! < dimensions.height!) {
        await exec('mogrify -bordercolor transparent -border ' + (dimensions.height! - dimensions.width!) / 2 + 'x0 ' + fileName + '.gif', {})
        await exec('mogrify -bordercolor transparent -border ' + (dimensions.height! - dimensions.width!) / 2 + 'x0 ' + fileNameF + '.png', {})
      }
      if (dimensions.width! > dimensions.height!) {
        await exec('mogrify -bordercolor transparent -border 0x' + (dimensions.width! - dimensions.height!) / 2 + ` ${fileName}.gif`, {})
        await exec('mogrify -bordercolor transparent -border 0x' + (dimensions.width! - dimensions.height!) / 2 + ` ${fileNameF}.png`, {})
      } 
      await exec('convert ' + fileNameF + '.png ' + fileName + '.gif -resize 256x256 ' + fileName + '.gif', {})
      let stats = fs.statSync(fileName + '.gif')
      await exec(`gif2webp ${fileName}.gif -o ${fileName}.webp`)
      return `${fileName}.webp`
    }

    /**
     * Creates Static sticker 
     * @returns {string} Filename
     */
    async static() {
        const file = `${this.path}/${Math.random().toString()}`
        fs.writeFileSync(`${file}.png`, this.data)
        await exec(`cwebp ${file}.png -o ${file}.webp`)
        return `${file}.webp`
    }

    /**
     * Creates static sticker with transparent borders
     * @returns {string} Filename 
     */
    async staticNoCrop() {
        const filename = `${this.path}/${Math.random().toString(36)}`
        fs.writeFileSync(`${filename}.png`, this.data)
        var dimensions = sizeOf(this.data)
        if (dimensions.width! < dimensions.height!) await exec(`mogrify -bordercolor transparent -border ${(dimensions.height! - dimensions.width!) / 2}x0 ${filename}.png`)
        if (dimensions.width! > dimensions.height!) await exec(`mogrify -bordercolor transparent -border 0x${(dimensions.width! - dimensions.height!) / 2} ${filename}.png`)
        await exec(`cwebp ${filename}.png -o ${filename}.webp`)
        return `${filename}.webp`
    }

    /**
     * Adds the pack and author titles to the EXIF metadata of the webp
     * @param filename 
     */
    async addMetadata(filename: string) {
        await exec(`webpmux -set exif ${this.createExif()} ${filename} -o ${filename}`)
    }

    /**
     * Creates the EXIF file withe the given Metadata
     * @param packname 
     * @param author 
     */
    createExif(packname: string = this.config.pack, author: string = this.config.author) {
        const stickerPackID = 'com.etheral.waifuhub.android.stickercontentprovider b5e7275f-f1de-4137-961f-57becfad34f2'
        const json = {
            'sticker-pack-id': stickerPackID,
            'sticker-pack-name': packname,
            'sticker-pack-publisher': author,
        };
    
        let length = new (TextEncoder as any)('utf-8').encode(JSON.stringify(json)).length;
        const f = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00]);
        const code = [0x00,
            0x00,
            0x16,
            0x00,
            0x00,
            0x00];
        if (length > 256) {
            length = length - 256;
            code.unshift(0x01);
        } else {
            code.unshift(0x00);
        }
        const fff = Buffer.from(code);
        const ffff = Buffer.from(JSON.stringify(json), 'utf-8');
        let len
        if (length < 16) {
            len = length.toString(16);
            len = '0' + length;
        } else {
            len = length.toString(16);
        }
    
        const ff = Buffer.from(len, 'hex');
        const buffer = Buffer.concat([f, ff, fff, ffff]);
        const fn = `${this.path}/${Math.random().toString()}.exif`
        fs.writeFileSync(fn, buffer)
        return fn
    }

    /**
     * Output options for FFMpeg
     */
    outputOptions = [
        `-vcodec`,
        `libwebp`,
        `-vf`,
        `crop=w='min(min(iw\,ih)\,500)':h='min(min(iw\,ih)\,500)',scale=500:500,setsar=1,fps=${this.processOptions.fps}`,
        `-loop`,
        `${this.processOptions.loop}`,
        `-ss`,
        this.processOptions.startTime,
        `-t`,
        this.processOptions.endTime,
        `-preset`,
        `default`,
        `-an`,
        `-vsync`,
        `0`,
        `-s`,
        `512:512`]
}

/**
 * Interface for the FFMpeg Process options
 */
interface processOptions {
    fps: number,
    startTime: string,
    endTime: string,
    loop: number,
}
