import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import sharp from 'sharp'
import Sticker, { Exif, extractMetadata, parseExif } from '../dist/index.mjs'
import { gif, png } from './helpers/fixtures.mjs'

/** Builds WhatsApp-style EXIF bytes around an arbitrary JSON string */
const exifFor = (json) => {
    const data = Buffer.from(json, 'utf-8')
    const header = Buffer.from([
        0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x16, 0x00, 0x00, 0x00
    ])
    header.writeUInt32LE(data.length, 14)
    return Buffer.concat([header, data])
}

describe('metadata', () => {
    it('stores pack, author, id and emojis', async () => {
        const sticker = await new Sticker(await png(64, 64), {
            pack: 'WSF',
            author: 'Well',
            id: 'my-pack',
            categories: ['🎉', '🤩']
        }).build()
        assert.deepEqual(await extractMetadata(sticker), {
            'sticker-pack-id': 'my-pack',
            'sticker-pack-name': 'WSF',
            'sticker-pack-publisher': 'Well',
            emojis: ['🎉', '🤩']
        })
    })

    it('works with the setter chain', async () => {
        const sticker = await new Sticker(await png(64, 64))
            .setPack('Pack')
            .setAuthor('Author')
            .setId('id-1')
            .setCategories(['😂'])
            .setType('crop')
            .setQuality(50)
            .setBackground('#ffffff')
            .build()
        const metadata = await Sticker.extractMetadata(sticker)
        assert.equal(metadata['sticker-pack-name'], 'Pack')
        assert.equal(metadata['sticker-pack-publisher'], 'Author')
        assert.equal(metadata['sticker-pack-id'], 'id-1')
        assert.deepEqual(metadata.emojis, ['😂'])
    })

    it('generates a sticker pack ID when none is given', async () => {
        const metadata = await extractMetadata(await new Sticker(await png(16, 16)).build())
        assert.match(metadata['sticker-pack-id'], /^[0-9a-f]{64}$/)
    })

    it('stores app store links', async () => {
        const sticker = await new Sticker(await png(16, 16), {
            androidAppStoreLink: 'https://play.google.com/store/apps/details?id=com.example',
            iosAppStoreLink: 'https://apps.apple.com/app/id123'
        }).build()
        const metadata = await extractMetadata(sticker)
        assert.equal(metadata['android-app-store-link'], 'https://play.google.com/store/apps/details?id=com.example')
        assert.equal(metadata['ios-app-store-link'], 'https://apps.apple.com/app/id123')
    })

    it('keeps metadata on animated stickers', async () => {
        const sticker = await new Sticker(await gif(), { pack: 'Animated', author: 'Me' }).build()
        const metadata = await extractMetadata(sticker)
        assert.equal(metadata['sticker-pack-name'], 'Animated')
    })

    it('handles unicode pack and author names', async () => {
        const sticker = await new Sticker(await png(16, 16), { pack: 'ステッカー 🌸', author: 'Ünïcødé' }).build()
        const metadata = await extractMetadata(sticker)
        assert.equal(metadata['sticker-pack-name'], 'ステッカー 🌸')
        assert.equal(metadata['sticker-pack-publisher'], 'Ünïcødé')
    })

    it('returns an empty object for WebP files without metadata', async () => {
        const plain = await sharp(await png(16, 16))
            .webp()
            .toBuffer()
        assert.deepEqual(await extractMetadata(plain), {})
    })

    it('Exif can tag an existing WebP without converting it', async () => {
        const plain = await sharp(await png(16, 16))
            .webp()
            .toBuffer()
        const tagged = await new Exif({ pack: 'Only Exif', author: 'Me' }).add(plain)
        const metadata = await extractMetadata(tagged)
        assert.equal(metadata['sticker-pack-name'], 'Only Exif')
        assert.equal(metadata['sticker-pack-publisher'], 'Me')
    })
})

describe('parseExif', () => {
    it("reads stickers whose JSON length contains a '{' byte (#40)", () => {
        // Stickers made by Sticker.ly: a JSON length of 0x17B puts a '{' (0x7B) byte in the EXIF header
        const base = {
            'sticker-pack-id': 'com.snowcorp.stickerly.android.stickercontentprovider f2c83f90',
            'sticker-pack-name': 'stickerman',
            'sticker-pack-publisher': 'Sticker.ly * someone',
            'android-app-store-link': 'https://play.google.com/store/apps/details?id=com.snowcorp.stickerly.android',
            'ios-app-store-link': 'https://itunes.apple.com/app/id1458740001?mt=8',
            padding: ''
        }
        base.padding = 'x'.repeat(0x17b - JSON.stringify(base).length)
        const json = JSON.stringify(base)
        assert.equal(json.length, 0x17b)
        assert.deepEqual(parseExif(exifFor(json)), base)
    })

    it('reads nested JSON values', () => {
        const value = { 'sticker-pack-name': 'Nested', extra: { a: { b: 1 } } }
        assert.deepEqual(parseExif(exifFor(JSON.stringify(value))), value)
    })

    it('reads EXIF data that starts with "Exif\\0\\0"', () => {
        const value = { 'sticker-pack-name': 'Prefixed' }
        const exif = Buffer.concat([Buffer.from('Exif\0\0', 'latin1'), exifFor(JSON.stringify(value))])
        assert.deepEqual(parseExif(exif), value)
    })

    it('falls back to scanning non-standard EXIF data', () => {
        const value = { 'sticker-pack-name': 'Scanned' }
        assert.deepEqual(parseExif(Buffer.from(`garbage{not json ${JSON.stringify(value)}`)), value)
    })

    it('returns an empty object for missing or invalid data', () => {
        assert.deepEqual(parseExif(undefined), {})
        assert.deepEqual(parseExif(Buffer.alloc(0)), {})
        assert.deepEqual(parseExif(Buffer.from('no json here')), {})
    })
})
