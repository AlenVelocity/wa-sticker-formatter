<div align=center>

<img src="https://img.icons8.com/color/96/000000/whatsapp--v5.png" alt="wsf"/>

# Wa-Sticker-Formatter

Wa-Sticker-Formatter is a simple tool which allows you to create and format WhatsApp Stickers.

[![NPM](https://img.shields.io/npm/l/wa-sticker-formatter?style=flat-square&label=License)](https://github.com/AlenSaito1/wa-sticker-formatter/blob/master/LICENSE) [![CodeFactor](https://img.shields.io/codefactor/grade/github/alensaito1/wa-sticker-formatter?style=flat-square&label=Code%20Quality)](https://www.codefactor.io/repository/github/alensaito1/wa-sticker-formatter) [![NPM](https://img.shields.io/npm/dw/wa-sticker-formatter?style=flat-square&label=Downloads)](https://npmjs.com/package/wa-sticker-formatter)


</div>

# Installation

```cmd
> npm i wa-sticker-formatter
```

# Metadata

Before getting started, here's some basic information about WhatsApp Sticker Metadata.

In WhatsApp, stickers have their own metadata embedded in the WebP file as EXIF Metadata. They hold info like the author, the title or pack name and the category.

### 1. Author and Pack Title

<a href="https://ibb.co/MhyzMwJ"><img src="https://i.ibb.co/9vmxsKd/metadata.jpg" alt="metadata" border="0" width=256></a>

The text on bold is the pack title and the rest is the author.
This is actually [Exif](https://en.wikipedia.org/wiki/Exif) Metadata embedded in the WebP file.

### 2 Sticker Category

This is an array of Emojis. [Learn More](https://github.com/WhatsApp/stickers/wiki/Tag-your-stickers-with-Emojis)

# Usage

Wa-Sticker-Formatter provides two ways to create stickers.
The paramers are the same for both.

First is the Buffer, URL or File path of static image, GIF or Video. The second is the options. GIFs and Videos will output an animated WebP file.

Sticker options are:

`pack` - The pack name.<br>
`author` - The author name.<br>
`type` - Value from StickeTypes enum (exported). Can be 'crop' or 'full' or undefined (default).<br>
`categories` - The sticker category. Can be an array of Emojis or undefined (default).<br>
`id` - The sticker id. If this property is not defined, it will be generated.<br>

# Examples

## 1. Using the `Sticker` Class (Recommended)

Example:

```TS
import { Sticker, StickerTypes } from 'wa-sticker-formatter'
// const { Sticker } = require('wa-sticker-formatter')

const image = 'https://c.tenor.com/WZBvSgw5JMgAAAAC/watson-amelia-amelia-watson.gif'

(async () => {
    const stickerMetadata = {
        type: StickerTypes.CROPPED,
        pack: 'watson',
        author: 'amelia',
        categories: [
            '🌹'
        ]
    }
    const sticker = new Sticker(image, { type: StickerTypes.CROPPED })
        .setAuthor('amelia')
        .setPack('watson')
        .setCategories(['🌹'])

    //get Buffer

    const buffer = await sticker.buffer()
    //save to file
    await sticker.toFile('output.webp')
})()

```

## 2. Using the `createSticker` function

```TS
import { createSticker, StickerTypes } from 'wa-sticker-formatter'
// const { createSticker } = require('wa-sticker-formatter')

const image = 'https://c.tenor.com/WZBvSgw5JMgAAAAC/watson-amelia-amelia-watson.gif' // Supports Buffer, URLs and filepath of Static Images, GIFs and Videos

(async () => {
    const stickerMetadata = {
        type: StickerTypes.FULL, //can be full or crop
        pack: 'watson',
        author: 'amelia',
        categories: [
            '🌹'
        ]
    }
    // `createSticker` always returns a Buffer
    const sticker = await createSticker(image, stickerMetadata)
})()
```


## Extract Metadata from a Sticker

```ts
import { extractMetadata } from 'wa-sticker-formatter'
import { readFileSync } from 'fs'

(async () => {
    const sticker = await readFileSync('animated.webp')
    const metadata = await extractMetadata(sticker)
    console.log(metadata) /** {
        'sticker-pack-id': 'ffa64cbdafa7cc0ed999220cfd02fbc511a5070e950e314baabef68f41f85226',
        'sticker-pack-name': 'animated',
        'sticker-pack-publisher': 'potrait-full',
        emojis: []
    } */
     
})()

```

Thanks for using Wa-Sticker-Formatter!


