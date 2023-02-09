// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path='../src/internal/node-webpmux.d.ts' />
import { strict as assert } from 'assert'
import Sticker, { extractMetadata, StickerTypes } from '../src'
import sizeOf from 'image-size'

const images = {
    static: {
        potrait: 'https://i.pinimg.com/originals/3a/53/d6/3a53d68345b56241a875595b21ec2a59.jpg',
        landscape: 'https://chasinganime.com/wp-content/uploads/2021/02/0_YgtEypuJ2QfMPCbn.jpg'
    },
    animated: {
        potrait: 'hhttps://c.tenor.com/-1mtmQgH5eYAAAAC/watson-amelia-vtuber.gif',
        landscape: 'https://c.tenor.com/2RdLoyV5VPsAAAAC/ayame-nakiri.gif'
    }
}

describe('Sticker', () => {
    describe('Static Stickers', () => {
        it('should create a static sticker', async () => {
            const sticker = new Sticker(images.static.potrait)
            const buffer = await sticker.build()
            assert.ok(buffer)
        })

        it('should create a cropped sticker with size 512x512', async () => {
            const sticker = new Sticker(images.static.potrait, {
                type: StickerTypes.CROPPED
            })
            const buffer = await sticker.build()
            const { height, width } = sizeOf(buffer)
            assert.equal(height, 512)
            assert.equal(width, 512)
        })

        it('should create a static sticker same height and width', async () => {
            const sticker = new Sticker(images.static.landscape, {
                type: StickerTypes.FULL
            })
            const buffer = await sticker.build()
            const { height, width } = sizeOf(buffer)
            assert.equal(height, width)
        })

        it('should create a circle sticker same height and width', async () => {
            const sticker = new Sticker(images.static.landscape, {
                type: StickerTypes.CIRCLE
            })
            const buffer = await sticker.build()
            const { height, width } = sizeOf(buffer)
            assert.equal(height, width)
        })

        it('should create a rounded sticker same height and width', async () => {
            const sticker = new Sticker(images.static.landscape, {
                type: StickerTypes.ROUNDED
            })
            const buffer = await sticker.build()
            const { height, width } = sizeOf(buffer)
            assert.equal(height, width)
        })
    })

    describe('Animated Stickers', () => {
        it('should create an animated sticker', async () => {
            const sticker = new Sticker(images.animated.landscape)
            const buffer = await sticker.build()
            assert.ok(buffer)
        })

        it('should create an animated sticker with size 512x512', async () => {
            const sticker = new Sticker(images.animated.potrait, {
                type: StickerTypes.CROPPED
            })
            const buffer = await sticker.build()
            const { height, width } = sizeOf(buffer)
            assert.equal(height, 512)
            assert.equal(width, 512)
        })

        it('should create an animated circle sticker with size 512x512', async () => {
            const sticker = new Sticker(images.animated.potrait, {
                type: StickerTypes.CIRCLE
            })
            const buffer = await sticker.build()
            const { height, width } = sizeOf(buffer)
            assert.equal(height, 512)
            assert.equal(width, 512)
        })

        it('should create an animated rounded sticker with size 512x512', async () => {
            const sticker = new Sticker(images.animated.potrait, {
                type: StickerTypes.ROUNDED
            })
            const buffer = await sticker.build()
            const { height, width } = sizeOf(buffer)
            assert.equal(height, 512)
            assert.equal(width, 512)
        })

        it('should create an animated sticker same height and width', async () => {
            const sticker = new Sticker(images.animated.potrait, {
                type: StickerTypes.FULL
            })
            const buffer = await sticker.build()
            const { height, width } = sizeOf(buffer)
            assert.equal(height, width)
        })

        it('should create a sticker from svg', async () => {
            const sticker = new Sticker(`
                <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
                    <path d="M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256 256-114.6 256-256S397.4 0 256 0zm0 464c-119.1 0-216-96.9-216-216S136.9 40 256 40s216 96.9 216 216-96.9 216-216 216z" fill="#ff0000" />
                </svg>
            `)
            const buffer = await sticker.build()
            assert.ok(buffer)
        })
    })

    describe('Metadata', () => {
        it('should create sticker with the provided pack and author name', async () => {
            const options = {
                pack: 'WSF',
                author: 'Well'
            } as const
            const sticker = new Sticker(images.static.potrait).setAuthor(options.author).setPack(options.pack)
            const buffer = await sticker.build()
            const metadata = await extractMetadata(buffer)
            assert.equal(metadata['sticker-pack-name'], options.pack)
            assert.equal(metadata['sticker-pack-publisher'], options.author)
        })
    })
})
