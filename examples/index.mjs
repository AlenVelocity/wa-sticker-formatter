import { writeFileSync } from 'fs'
import { Sticker } from '../dist/Sticker.js'

const image = 'https://c.tenor.com/WXNd5yNr82sAAAPo/anime.mp4'
new Sticker(image).build().then((data) => writeFileSync('sticker_default.webp', data))
new Sticker(image, {
    type: 'crop'
}).build().then((data) => writeFileSync('sticker_crop.webp', data))

new Sticker(image, {
    type: 'full',
    pack: 'ship',
    categories: [
        '🌹'
    ]
}).build().then((data) => writeFileSync('sticker_full.webp', data))
