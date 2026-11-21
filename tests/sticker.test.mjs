import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Readable } from 'node:stream'
import { pathToFileURL } from 'node:url'
import { after, before, describe, it } from 'node:test'
import Sticker, { createSticker, StickerTypes } from '../dist/index.mjs'
import { gif, inspect, pixel, png, rotatedJpeg, svg } from './helpers/fixtures.mjs'

describe('still images', () => {
    it('keeps the aspect ratio and shrinks large images by default', async () => {
        const info = await inspect(await new Sticker(await png(1000, 500)).build())
        assert.equal(info.format, 'webp')
        assert.deepEqual([info.width, info.height], [512, 256])
        assert.equal(info.pages, 1)
    })

    it('does not upscale small images by default', async () => {
        const info = await inspect(await new Sticker(await png(100, 50)).build())
        assert.deepEqual([info.width, info.height], [100, 50])
    })

    for (const type of [StickerTypes.CROPPED, StickerTypes.FULL, StickerTypes.CIRCLE, StickerTypes.ROUNDED]) {
        it(`makes a 512x512 ${type} sticker`, async () => {
            const info = await inspect(await new Sticker(await png(900, 400), { type }).build())
            assert.deepEqual([info.width, info.height], [512, 512])
        })
    }

    it('pads full stickers with a transparent background by default', async () => {
        const sticker = await new Sticker(await png(1000, 500, '#ff0000'), { type: 'full' }).build()
        assert.equal((await pixel(sticker, 256, 10))[3], 0, 'padding is transparent')
        assert.equal((await pixel(sticker, 256, 256))[3], 255, 'image is opaque')
    })

    it('pads full stickers with the given background colour', async () => {
        const sticker = await new Sticker(await png(1000, 500, '#ff0000'), {
            type: 'full',
            background: '#00ff00'
        }).build()
        const [r, g, b, a] = await pixel(sticker, 256, 10)
        assert.ok(g > 200 && r < 50 && b < 50 && a === 255, `expected green, got ${[r, g, b, a]}`)
    })

    it('cuts circles with transparent corners', async () => {
        const sticker = await new Sticker(await png(600, 600), { type: StickerTypes.CIRCLE }).build()
        assert.equal((await pixel(sticker, 2, 2))[3], 0)
        assert.equal((await pixel(sticker, 256, 256))[3], 255)
        assert.equal((await pixel(sticker, 256, 2))[3], 255, 'top edge centre is inside the circle')
    })

    it('rounds corners for rounded stickers', async () => {
        const sticker = await new Sticker(await png(600, 600), { type: StickerTypes.ROUNDED }).build()
        assert.equal((await pixel(sticker, 1, 1))[3], 0)
        assert.equal((await pixel(sticker, 100, 2))[3], 255)
    })

    it('applies EXIF orientation', async () => {
        const info = await inspect(await new Sticker(await rotatedJpeg()).build())
        assert.deepEqual([info.width, info.height], [256, 512])
    })

    it('renders small SVGs sharply at 512px', async () => {
        const info = await inspect(await new Sticker(svg).build())
        assert.deepEqual([info.width, info.height], [512, 512])
    })

    it('falls back to the default type for unknown types', async () => {
        const sticker = new Sticker(await png(10, 10), { type: 'star' })
        assert.equal(sticker.metadata.type, 'default')
    })
})

describe('animated images', () => {
    it('keeps every frame of a GIF', async () => {
        const info = await inspect(await new Sticker(await gif()).build())
        assert.equal(info.pages, 4)
        assert.deepEqual([info.width, info.height], [512, 256])
        assert.deepEqual(info.delay, [100, 100, 100, 100])
    })

    for (const type of [StickerTypes.CROPPED, StickerTypes.FULL, StickerTypes.CIRCLE, StickerTypes.ROUNDED]) {
        it(`makes a 512x512 animated ${type} sticker`, async () => {
            const info = await inspect(await new Sticker(await gif(), { type }).build())
            assert.equal(info.pages, 4)
            assert.deepEqual([info.width, info.height], [512, 512])
        })
    }

    it('crops each frame separately', async () => {
        const sticker = await new Sticker(await gif(), { type: 'crop' }).build()
        const [r, g, b] = await pixel(sticker, 256, 256, 2)
        assert.ok(b > 200 && r < 50 && g < 50, `frame 3 should be blue, got ${[r, g, b]}`)
    })

    it('masks every frame of animated circle stickers', async () => {
        const sticker = await new Sticker(await gif(), { type: 'circle' }).build()
        for (const frame of [0, 3]) assert.equal((await pixel(sticker, 2, 2, frame))[3], 0)
    })

    it('replaces zero GIF frame delays with 100ms', async () => {
        const info = await inspect(await new Sticker(await gif({ delay: [0, 10, 0, 50] })).build())
        assert.deepEqual(info.delay, [100, 100, 100, 50])
    })

    it('cuts GIFs longer than maxDuration', async () => {
        const colors = Array.from({ length: 10 }, (_, i) => `#${(i * 25).toString(16).padStart(2, '0')}0000`)
        const info = await inspect(
            await new Sticker(await gif({ colors, delay: colors.map(() => 500) }), { maxDuration: 2 }).build()
        )
        assert.equal(info.pages, 4)
    })

    it('re-encodes animated WebP stickers', async () => {
        const first = await new Sticker(await gif()).build()
        const info = await inspect(await new Sticker(first, { type: 'crop' }).build())
        assert.equal(info.pages, 4)
        assert.deepEqual([info.width, info.height], [512, 512])
    })
})

describe('size limit', () => {
    it('lowers quality until the sticker fits in maxSize', async () => {
        const noisy = await sharp512Noise()
        const unlimited = await new Sticker(noisy, { quality: 100, maxSize: 0 }).build()
        const maxSize = Math.floor(unlimited.length / 3)
        const limited = await new Sticker(noisy, { quality: 100, maxSize }).build()
        assert.ok(limited.length <= maxSize, `${limited.length} > ${maxSize}`)
    })

    it('returns the smallest attempt when nothing fits', async () => {
        const sticker = await new Sticker(await sharp512Noise(), { maxSize: 10 }).build()
        assert.ok(sticker.length > 10)
        assert.equal((await inspect(sticker)).format, 'webp')
    })
})

describe('inputs', () => {
    let dir
    let server
    let baseUrl
    let image

    before(async () => {
        image = await png(64, 64)
        dir = await mkdtemp(join(tmpdir(), 'wsf-inputs-'))
        await writeFile(join(dir, 'image.png'), image)
        server = createServer((req, res) => {
            if (req.url === '/image.png') return res.end(image)
            res.statusCode = 404
            res.end()
        })
        await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
        baseUrl = `http://127.0.0.1:${server.address().port}`
    })

    after(async () => {
        server.close()
        await rm(dir, { recursive: true, force: true })
    })

    const cases = {
        Buffer: () => image,
        Uint8Array: () => new Uint8Array(image),
        ArrayBuffer: () => image.buffer.slice(image.byteOffset, image.byteOffset + image.byteLength),
        'file path': () => join(dir, 'image.png'),
        'file URL': () => pathToFileURL(join(dir, 'image.png')),
        'http URL': () => `${baseUrl}/image.png`,
        'data URL': () => `data:image/png;base64,${image.toString('base64')}`,
        'readable stream': () => Readable.from([image.subarray(0, 10), image.subarray(10)]),
        'async iterable': () =>
            (async function* () {
                yield image
            })()
    }

    for (const [name, make] of Object.entries(cases)) {
        it(`accepts a ${name}`, async () => {
            const info = await inspect(await new Sticker(make()).build())
            assert.deepEqual([info.width, info.height], [64, 64])
        })
    }

    it('explains a missing file', async () => {
        await assert.rejects(new Sticker('./does-not-exist.png').build(), /Input file not found/)
    })

    it('reports HTTP errors', async () => {
        await assert.rejects(new Sticker(`${baseUrl}/missing.png`).build(), /404/)
    })

    it('rejects empty input', async () => {
        await assert.rejects(new Sticker(Buffer.alloc(0)).build(), /empty/)
    })

    it('explains that .tgs stickers are not supported', async () => {
        const { gzipSync } = await import('node:zlib')
        await assert.rejects(new Sticker(gzipSync('{"v":"5.5.2"}')).build(), /Telegram animated sticker/)
    })
})

describe('output', () => {
    it('toMessage() returns a Baileys sticker message', async () => {
        const still = await new Sticker(await png(600, 600), { type: 'crop' }).toMessage()
        assert.ok(Buffer.isBuffer(still.sticker))
        assert.equal(still.isAnimated, false)
        assert.deepEqual([still.width, still.height], [512, 512])

        const animated = await new Sticker(await gif(), { type: 'crop' }).toMessage()
        assert.equal(animated.isAnimated, true)
    })

    it('toFile() writes the sticker', async () => {
        const dir = await mkdtemp(join(tmpdir(), 'wsf-out-'))
        try {
            const file = await new Sticker(await png(64, 64)).toFile(join(dir, 'sticker.webp'))
            assert.equal((await inspect(await readFile(file))).format, 'webp')
        } finally {
            await rm(dir, { recursive: true, force: true })
        }
    })

    it('createSticker() matches the Sticker class', async () => {
        const info = await inspect(await createSticker(await png(900, 400), { type: 'crop' }))
        assert.deepEqual([info.width, info.height], [512, 512])
    })

    it('toBuffer() and get() are aliases of build()', async () => {
        const sticker = new Sticker(await png(32, 32))
        for (const buffer of [await sticker.toBuffer(), await sticker.get()]) {
            assert.equal((await inspect(buffer)).format, 'webp')
        }
    })
})

/** 512x512 random noise: compresses badly, good for exercising the size limit */
async function sharp512Noise() {
    const { default: sharp } = await import('sharp')
    return sharp({
        create: { width: 512, height: 512, channels: 3, noise: { type: 'gaussian', mean: 128, sigma: 60 } }
    })
        .png()
        .toBuffer()
}
