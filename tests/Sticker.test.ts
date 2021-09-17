// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path='../src/lib/node-webmux' />
import { strict as assert } from 'assert'
import Sticker, { StickerTypes } from '../src'
import { Image } from 'node-webpmux'
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
    console.log(StickerTypes)
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

        it('should create an animated sticker same height and width', async () => {
            const sticker = new Sticker(images.animated.potrait, {
                type: StickerTypes.FULL
            })
            const buffer = await sticker.build()
            const { height, width } = sizeOf(buffer)
            assert.equal(height, width)
        })
    })
    
    describe('Metadata', () => {
        it('should create sticker with the provided pack and author name', async () => {
            const sticker = new Sticker(images.static.potrait, {
                pack: 'WSF',
                author: 'Well'
            })
            const buffer = await sticker.build()
            const image = new Image()
            await image.load(buffer)
            const exif = image.exif.toString('utf-8')
            assert.equal(exif.includes('WSF'), true)
            assert.equal(exif.includes('Well'), true)
        })
    })
})

