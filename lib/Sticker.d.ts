/// <reference types="node" />
export default class Sticker {
    /**
     * Supported MimeTypes
    */
    supportedTypes: string[];
    /**
     * Buffer of the image/video provided
    */
    private data;
    /**
     * Sticker Config
     */
    config: {
        animated: boolean;
        crop: boolean;
        pack: string;
        author: string;
    };
    /**
     * path of the file
    */
    private path;
    /**
     * Processoptions to pass to ffmpeg
    */
    processOptions: processOptions;
    private final;
    /**
     * MimeType of the buffer provided
    */
    private mime;
    /**
     * @param data
     * @param param1
     */
    constructor(data: Buffer | string, { animated, crop, author, pack }: {
        animated?: boolean | undefined;
        crop?: boolean | undefined;
        author?: string | undefined;
        pack?: string | undefined;
    });
    /**
     *
     * @param processOptions (optional)
     */
    build(processOptions?: processOptions): Promise<void>;
    /**
     * @returns {Buffer} webp
     */
    get(): Promise<Buffer>;
    animated(): Promise<string>;
    animatedNoCrop(): Promise<string>;
    static(): Promise<string>;
    staticNoCrop(): Promise<string>;
    addMetadata(filename: string): Promise<void>;
    createExif(packname?: string, author?: string): string;
    delete(files: string[]): Promise<void>;
    outputOptions: string[];
}
interface processOptions {
    fps: number;
    startTime: string;
    endTime: string;
    loop: number;
}
export {};
//# sourceMappingURL=Sticker.d.ts.map