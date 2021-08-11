import { statSync, writeFileSync } from 'fs'
import { Sticker } from '../dist/Sticker.js'

const main = async () => {
    const image = 'https://c.tenor.com/WZBvSgw5JMgAAAAC/watson-amelia-amelia-watson.gif'
    await new Sticker(image).build().then((data) => writeFileSync('sticker_default.webp', data))
    console.log('default', statSync('sticker_default.webp').size)
    await new Sticker(image, {
        type: 'crop'
    }).build().then((data) => writeFileSync('sticker_crop.webp', data))
    console.log('crop', statSync('sticker_crop.webp').size)

    await new Sticker(image, {
        type: 'full',
        pack: 'ship',
        categories: [
            '🌹'
        ]
    }).build().then((data) => writeFileSync('sticker_full.webp', data))
    console.log('full', statSync('sticker_full.webp').size)
}

main()
