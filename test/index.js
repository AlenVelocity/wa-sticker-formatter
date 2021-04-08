const path = require('path')
const { writeFile } = require('fs-extra')
const { Sticker, createExif, setMetadata } = require('../lib')

async function create(){

    console.log('STARTING...')
    const sticker = new Sticker('https://i.pinimg.com/originals/d9/07/ae/d907ae3f975f8fc02e9881cb1330817e.gif', { crop: false })
    sticker.setAuthor('Cool Author')
    sticker.setPack('Cool Packname')
    await sticker.build()
    const data = await sticker.get()
    console.log(data)
    writeFile(path.join(__dirname, '..', '..', '..', '..','time', 'Whatsapp-Botto-Xre','test.webp'), data)
}

create()