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
`background`

## Import

Before using the library, you need to import it.

```TS
import { Sticker, createSticker, StickerTypes } from 'wa-sticker-formatter' // ES6
// const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter') // CommonJS
```
## Using The `Sticker` constructor (Recommended)

```TS
const sticker = new Sticker(image, {
    pack: 'My Pack', // The pack name
    author: 'Me', // The author name
    type: StickerTypes.FULL, // The sticker type
    categories: ['🤩', '🎉'], // The sticker category
    id: '12345', // The sticker id
    background: '#000000' // The sticker background color (only for full stickers)
})

const buffer = await sticker.toBuffer() // convert to buffer
// or save to file
await sticker.toFile('sticker.webp')

```

The `image` (first parameter) can be a Buffer, URL or File path.

## Using the `createSticker` function

```TS
const buffer = await createSticker(buffer, options) // same params as the constructor
// NOTE: `createSticker` returns a Promise of a Buffer
```

## Options

The following options are valid:

```TS
interface IStickerConfig {
    /** Sticker Pack title*/
    pack?: string
    /** Sticker Pack Author*/
    author?: string
    /** Sticker Pack ID*/
    id?: string
    /** Sticker Category*/
    categories?: Categories[]
    /** Background */
    background?: Sharp.Color
     /** Sticker Type */
    type?: StickerTypes | string
    /* Output quality */
    quality?: number
}
```

## Sticker Types

Sticker types are exported as an enum.

```ts
enum StickerTypes {
    DEFAULT = 'default',
    CROPPED = 'crop',
    FULL = 'full'
}

```

## Background

Background can be a hex color string or a sharp color object.
```JSON
{
    "background": "#FFFFFF"
}
```
or 

```JSON  
{
    "background": {
        "r": 255,
        "g": 255,
        "b": 255,
        "alpha": 1
    }
}
```

# Metadata

Here's some basic information about WhatsApp Sticker Metadata.

In WhatsApp, stickers have their own metadata embedded in the WebP file as They hold info like the author, the title or pack name and the category.

### 1. Author and Pack Title

<a href="https://ibb.co/MhyzMwJ"><img src="https://i.ibb.co/9vmxsKd/metadata.jpg" alt="metadata" border="0" width=256></a>

The text on bold is the pack title and the rest is the author.
This is actually [Exif](https://en.wikipedia.org/wiki/Exif) Metadata embedded in the WebP file.

### 2 Sticker Category

This is an array of Emojis. [Learn More](https://github.com/WhatsApp/stickers/wiki/Tag-your-stickers-with-Emojis)

---
Thanks for using Wa-Sticker-Formatter!


