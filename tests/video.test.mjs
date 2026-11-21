import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import Sticker, { extractMetadata, StickerTypes } from '../dist/index.mjs'
import { hasEncoder, hasFfmpeg, inspect, mp4, pixel, transparentWebm } from './helpers/fixtures.mjs'

const skip = hasFfmpeg ? false : 'ffmpeg is not installed'

describe('videos', { skip, timeout: 300_000 }, () => {
    it('makes an animated sticker from an MP4', async () => {
        const message = await new Sticker(mp4(), { pack: 'Video', author: 'Me' }).toMessage()
        const info = await inspect(message.sticker)
        assert.equal(message.isAnimated, true)
        assert.deepEqual([info.width, info.height], [512, 288])
        assert.ok(info.pages >= 25 && info.pages <= 35, `about 30 frames at 15fps, got ${info.pages}`)
        assert.equal((await extractMetadata(message.sticker))['sticker-pack-name'], 'Video')
    })

    for (const type of [StickerTypes.CROPPED, StickerTypes.FULL, StickerTypes.CIRCLE, StickerTypes.ROUNDED]) {
        it(`makes a 512x512 ${type} video sticker`, async () => {
            const info = await inspect(await new Sticker(mp4(), { type }).build())
            assert.deepEqual([info.width, info.height], [512, 512])
        })
    }

    it('keeps circle corners transparent on every frame', async () => {
        const sticker = await new Sticker(mp4(), { type: 'circle' }).build()
        const { pages } = await inspect(sticker)
        for (const frame of [0, pages - 1]) {
            assert.equal((await pixel(sticker, 2, 2, frame))[3], 0, `frame ${frame} corner`)
            assert.equal((await pixel(sticker, 256, 256, frame))[3], 255, `frame ${frame} centre`)
        }
    })

    it('pads full video stickers with the background colour', async () => {
        const sticker = await new Sticker(mp4(), { type: 'full', background: '#00ff00' }).build()
        const [r, g, b, a] = await pixel(sticker, 256, 10)
        assert.ok(g > 200 && r < 60 && b < 60 && a === 255, `expected green, got ${[r, g, b, a]}`)
    })

    it('respects fps and maxDuration', async () => {
        const info = await inspect(await new Sticker(mp4({ seconds: 4 }), { fps: 10, maxDuration: 1 }).build())
        assert.ok(info.pages >= 9 && info.pages <= 11, `about 10 frames, got ${info.pages}`)
    })

    it('shrinks videos to fit maxSize', async () => {
        const unlimited = await new Sticker(mp4({ seconds: 3 }), { type: 'crop', maxSize: 0, quality: 90 }).build()
        const maxSize = Math.floor(unlimited.length / 2)
        const limited = await new Sticker(mp4({ seconds: 3 }), { type: 'crop', maxSize, quality: 90 }).build()
        assert.ok(limited.length <= maxSize, `${limited.length} > ${maxSize}`)
    })

    it(
        'keeps the transparency of VP9 WebM videos (Telegram video stickers)',
        { skip: !hasEncoder('libvpx-vp9') && 'ffmpeg has no libvpx-vp9' },
        async () => {
            const sticker = await new Sticker(transparentWebm()).build()
            assert.equal((await pixel(sticker, 10, 10))[3], 0, 'background stays transparent')
            assert.equal((await pixel(sticker, 256, 256))[3], 255, 'box stays opaque')
        }
    )

    it('explains when the input is neither an image nor a video', async () => {
        await assert.rejects(new Sticker(Buffer.from('definitely not media')).build(), /Could not convert the input/)
        await assert.rejects(new Sticker(Buffer.from([1, 2, 3])).build(), /Could not convert the input/)
    })
})
