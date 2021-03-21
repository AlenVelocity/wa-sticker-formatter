const axios = require('axios')
const path = require('path')
const { writeFile, readdir, readdirSync, readFileSync,  } = require('fs-extra')
const { Sticker } = require('../lib')

async function create(){

    console.log('STARTING...')
    const sticker = new Sticker('https://images.wallpapersden.com/image/download/watson-amelia-virtual-youtuber_bGlqZ2yUmZqaraWkpJRnaWVlrWZnZWU.jpg', { crop: false })
    await sticker.build()
    const data = await sticker.get()
    console.log(data)
    writeFile(path.join(__dirname, 'test.webp'), data)
}

create()