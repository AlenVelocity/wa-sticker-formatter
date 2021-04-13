import { IConfig, IProcessOptions } from '../typings'
import webp from '../webp'
import { tmpdir } from 'os'
export default class {
    /**
     * Supported MimeTypes
     */
    supportedTypes = ['video/mp4', 'image/gif', 'image/jpeg', 'image/png']
    /**
     * Buffer of the image/video provided
     */
    data?: Buffer | string

    /**
     * Webpmux binary
     */
    webpmux = webp('webpmux')
    /**
     * cwebp binary
     */
    cwebp = webp('cwebp')
    /**
     * 
     */
    gif2webp = webp('gif2webp')

    /**
     * Sticker Config
     */
    config?: IConfig
    /**
     * path of the file
     */
    path = tmpdir()

    /**
     * Processoptions to pass to ffmpeg
     */
    processOptions: IProcessOptions = {
        fps: 15,
        startTime: `00:00:00.0`,
        endTime: `00:00:10.0`,
        loop: 0
    }
    final = ''

    /**
     * MimeType of the buffer provided
     */
    mime = ''

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
        `512:512`
    ]
}
