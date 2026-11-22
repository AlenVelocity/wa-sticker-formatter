const assert = require('node:assert/strict')
const { it } = require('node:test')
const sharp = require('sharp')

it('works with require()', async () => {
    const wsf = require('wa-sticker-formatter')
    const { Sticker, createSticker, StickerTypes, extractMetadata } = wsf
    assert.equal(wsf.default, Sticker)
    assert.equal(StickerTypes.FULL, 'full')

    const image = await sharp({ create: { width: 64, height: 64, channels: 3, background: '#000' } })
        .png()
        .toBuffer()
    const sticker = await new Sticker(image, { pack: 'CJS', type: StickerTypes.CROPPED }).build()
    assert.equal((await extractMetadata(sticker))['sticker-pack-name'], 'CJS')
    assert.ok(Buffer.isBuffer(await createSticker(image)))
})
