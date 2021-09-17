# Wa-Sticker-Formatter

<img src="https://img.icons8.com/color/96/000000/whatsapp--v5.png" alt="wsf" align="right" />

Wa-Sticker-Formatter is a simple tool which allows you to create and format WhatsApp Stickers.

</div>

# ⚠️ **WARNING: BREAKING CHANGES! PLEASE READ README BEFORE SWITCHING FROM 3.x to 4.x**

# Installation

```cmd
> npm i wa-sticker-formatter
```

# Metadata

Before getting started, you need to know some basic information about WhatsApp Sticker Metadata.

In WhatsApp, stickers have thier own metadata embedded in the WebP file. They hold info like the author, the title or pack name, the category.

Let's go through them one by one.

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

## 1. Using the `Sticker` Class

Example:

```TS
import { Sticker } from 'wa-sticker-formatter'
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
    const sticker = await new Sticker(image, stickerMetadata).build()
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
    const sticker = await createSticker(image, stickerMetadata)
})()
```
