"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const axios_1 = __importDefault(require("axios"));
const child_process_1 = require("child_process");
const util_1 = __importDefault(require("util"));
const fs = __importStar(require("fs-extra"));
const os_1 = __importDefault(require("os"));
const image_size_1 = __importDefault(require("image-size"));
const Jimp = __importStar(require("jimp"));
const streamifier = require('streamifier');
const gifFrames = require('gif-frames');
const exec = util_1.default.promisify(child_process_1.exec);
const file_type_1 = __importDefault(require("file-type"));
class Sticker {
    /**
     * @param data
     * @param param1
     */
    constructor(data, { animated = false, crop = true, author = 'WA-STICKER-FORMATTER', pack = 'MADE USING' }) {
        /**
         * Supported MimeTypes
        */
        this.supportedTypes = ['video/mp4', 'image/gif', 'image/jpeg', 'image/png'];
        /**
         * Processoptions to pass to ffmpeg
        */
        this.processOptions = {
            fps: 15,
            startTime: `00:00:00.0`,
            endTime: `00:00:10.0`,
            loop: 0,
        };
        this.final = '';
        /**
         * MimeType of the buffer provided
        */
        this.mime = '';
        this.outputOptions = [
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
        ];
        this.data = data;
        this.config = {
            animated,
            crop,
            author,
            pack,
        };
        this.path = os_1.default.tmpdir();
    }
    /**
     *
     * @param processOptions (optional)
     */
    build(processOptions = this.processOptions) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.processOptions = processOptions;
            if (typeof this.data === 'string') {
                if (this.data.startsWith('./')) {
                    if (!fs.existsSync(this.data))
                        throw new Error(`${this.data} filepath does not exist`);
                    this.data = yield fs.readFile(this.data);
                }
                else {
                    this.data = (yield axios_1.default.get(this.data, { responseType: 'arraybuffer' })).data;
                }
            }
            const mime = (_a = (yield file_type_1.default.fromBuffer(this.data))) === null || _a === void 0 ? void 0 : _a.mime;
            if (!mime)
                throw new Error('Invalid Input');
            this.mime = mime;
            if (this.mime === 'image/gif' || this.mime === 'video/mp4')
                this.config.animated = true;
            if (!this.config.animated) {
                const file = (!this.config.crop) ? yield this.staticNoCrop() : yield this.static();
                yield this.addMetadata(file);
                this.final = file;
            }
            if (this.config.animated) {
                const file = (!this.config.crop) ? yield this.animatedNoCrop() : yield this.animated();
                yield this.addMetadata(file);
                this.final = file;
                return;
            }
        });
    }
    /**
     * @returns {Buffer} webp
     */
    get() {
        return __awaiter(this, void 0, void 0, function* () {
            const buffer = fs.readFileSync(this.final);
            return buffer;
        });
    }
    animated() {
        return __awaiter(this, void 0, void 0, function* () {
            const filename = `${this.path}/${Math.random().toString()}`;
            const stream = yield streamifier.createReadStream(this.data);
            let success = yield new Promise((resolve, reject) => {
                var command = fluent_ffmpeg_1.default(stream)
                    .inputFormat(this.mime === this.supportedTypes[1] ? 'gif' : 'mp4')
                    .on("error", function (err) {
                    console.log("An error occurred: " + err.message);
                    reject(err);
                })
                    .on("start", function (cmd) {
                    //console.log("Started " + cmd);
                })
                    .addOutputOptions(this.outputOptions)
                    .toFormat("webp")
                    .on("end", () => {
                    resolve(true);
                })
                    .saveToFile(`${filename}.webp`);
            });
            return `${filename}.webp`;
        });
    }
    animatedNoCrop() {
        return __awaiter(this, void 0, void 0, function* () {
            const rn = Math.random();
            const fileName = `${this.path}/${rn.toString(36)}`;
            const fileNameF = `${this.path}/${rn.toString(36)}`;
            const sv = `${fileName}${this.mime === this.supportedTypes[0] ? '.mp4' : '.gif'}`;
            yield fs.writeFile(sv, this.data);
            if (this.mime === this.supportedTypes[0])
                yield exec(`ffmpeg -y -i ${fileName}.mp4 ${fileName}.gif`, {});
            let frames = '';
            yield gifFrames({ url: fileName + '.gif', frames: 'all' }).then(function (frameData) {
                frameData[0].getImage().pipe(fs.createWriteStream(fileName + '.png'));
                frames = frameData;
            });
            //  console.log(frames.length)
            if (frames.length < 7)
                yield exec('convert ' + fileName + '.gif ' + fileName + '.gif  ' + fileName + '.gif', {});
            yield exec('convert ' + fileName + '.gif -coalesce -delete 0 ' + fileName + '.gif', {});
            var dimensions = yield image_size_1.default(fileName + '.gif');
            let success = true;
            let colors;
            while (success) {
                yield Jimp.read(fileName + '.png')
                    .then((image) => {
                    for (let i = 1; i < dimensions.width; i++) {
                        for (let j = 1; j < dimensions.height; j++) {
                            colors = Jimp.intToRGBA(image.getPixelColor(i, j));
                            if (colors.r > 155) {
                                colors.r = colors.r - 5;
                            }
                            else {
                                colors.r = colors.r + 5;
                            }
                            if (colors.g > 155) {
                                colors.g = colors.g - 5;
                            }
                            else {
                                colors.g = colors.g + 5;
                            }
                            if (colors.b > 155) {
                                colors.b = colors.b - 5;
                            }
                            else {
                                colors.b = colors.b + 5;
                            }
                            if (colors.a > 155) {
                                colors.a = colors.a - 5;
                            }
                            else {
                                colors.a = colors.a + 5;
                            }
                            let hex = Jimp.rgbaToInt(colors.r, colors.g, colors.b, colors.a);
                            //     console.log(hex)
                            image.setPixelColor(hex, i, j); // sets the colour of that pixel
                            success = false;
                        }
                    }
                    image.write(fileNameF + '.png');
                })
                    .catch((err) => {
                    // console.log('ERROR: ' + err)
                });
            }
            // console.log(dimensions.width + '  ' + dimensions.height)
            if (dimensions.width < dimensions.height) {
                yield exec('mogrify -bordercolor transparent -border ' + (dimensions.height - dimensions.width) / 2 + 'x0 ' + fileName + '.gif', {});
                yield exec('mogrify -bordercolor transparent -border ' + (dimensions.height - dimensions.width) / 2 + 'x0 ' + fileNameF + '.png', {});
            }
            if (dimensions.width > dimensions.height) {
                yield exec('mogrify -bordercolor transparent -border 0x' + (dimensions.width - dimensions.height) / 2 + ` ${fileName}.gif`, {});
                yield exec('mogrify -bordercolor transparent -border 0x' + (dimensions.width - dimensions.height) / 2 + ` ${fileNameF}.png`, {});
            }
            yield exec('convert ' + fileNameF + '.png ' + fileName + '.gif -resize 256x256 ' + fileName + '.gif', {});
            let stats = fs.statSync(fileName + '.gif');
            // console.log(stats['size'])
            yield exec(`gif2webp ${fileName}.gif -o ${fileName}.webp`);
            return `${fileName}.webp`;
        });
    }
    static() {
        return __awaiter(this, void 0, void 0, function* () {
            const file = `${this.path}/${Math.random().toString()}`;
            fs.writeFileSync(`${file}.png`, this.data);
            yield exec(`cwebp ${file}.png -o ${file}.webp`);
            return `${file}.webp`;
        });
    }
    staticNoCrop() {
        return __awaiter(this, void 0, void 0, function* () {
            const filename = `${this.path}/${Math.random().toString(36)}`;
            fs.writeFileSync(`${filename}.png`, this.data);
            var dimensions = image_size_1.default(this.data);
            //console.log(dimensions.width + '  ' + dimensions.height)
            if (dimensions.width < dimensions.height)
                yield exec(`mogrify -bordercolor transparent -border ${(dimensions.height - dimensions.width) / 2}x0 ${filename}.png`);
            if (dimensions.width > dimensions.height)
                yield exec(`mogrify -bordercolor transparent -border 0x${(dimensions.width - dimensions.height) / 2} ${filename}.png`);
            //'sticker/' + message.from + '.png'
            yield exec(`cwebp ${filename}.png -o ${filename}.webp`);
            return `${filename}.webp`;
        });
    }
    addMetadata(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            yield exec(`webpmux -set exif ${this.createExif()} ${filename} -o ${filename}`);
        });
    }
    createExif(packname = this.config.pack, author = this.config.author) {
        const stickerPackID = "com.etheral.waifuhub.android.stickercontentprovider b5e7275f-f1de-4137-961f-57becfad34f2";
        const json = {
            "sticker-pack-id": stickerPackID,
            "sticker-pack-name": packname,
            "sticker-pack-publisher": author,
        };
        let length = JSON.stringify(json).length;
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
        }
        else {
            code.unshift(0x00);
        }
        const fff = Buffer.from(code);
        const ffff = Buffer.from(JSON.stringify(json), 'utf-8');
        let len;
        if (length < 16) {
            len = length.toString(16);
            len = "0" + length;
        }
        else {
            len = length.toString(16);
        }
        const ff = Buffer.from(len, "hex");
        const buffer = Buffer.concat([f, ff, fff, ffff]);
        const fn = `${this.path}/${Math.random().toString()}.exif`;
        fs.writeFileSync(fn, buffer);
        return fn;
    }
    delete(files) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let file of files) {
                try {
                    fs.unlink(file);
                }
                catch (err) {
                    console.log(err.message);
                    continue;
                }
            }
        });
    }
}
exports.default = Sticker;
//# sourceMappingURL=Sticker.js.map