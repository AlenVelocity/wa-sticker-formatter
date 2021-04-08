export interface IConfig {
    animated?: boolean
    crop?: boolean
    pack?: string
    author?: string
}

/**
 * Interface for the FFMpeg Process options
 */
interface IProcessOptions {
    fps: number
    startTime: string
    endTime: string
    loop: number
}
