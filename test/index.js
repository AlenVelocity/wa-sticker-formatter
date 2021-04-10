const path = require('path')
const { writeFile, readFile } = require('fs-extra')
const { Sticker, createExif, setMetadata, addMetadataToWebpBuffer } = require('../lib')

async function create(){
    const image = await readFile(path.join(__dirname, 'test.webp'))
    await writeFile(path.join(__dirname, 'tested.webp'), await addMetadataToWebpBuffer(image, 'Well', 'Well'))
}

create()