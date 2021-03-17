<div align="center">
<img src="https://wallpapercave.com/wp/wp8493901.png" alt="WATCIKER" width="500" />

# _**WA-STICKER-FORMATTER**_

> Made for your sticker creation needs
>
>
</div><br/>
<br/>

# Installation
```cmd
> npm i wa-sticker-formatter
```

# 🎋 Usage

## Importing
### JavaScript
```JS 
const WSF = require('wa-sticker-formatter')
```
### TypeScript
```TS 
import WSF from 'wa-sticker-formatter'
```

## Creating Sticker

```JS
const WSF = require('wa-sticker-formatter') //import WSF from 'wa-sticker-formatter'

const fs = require('fs') //import * as fs from 'fs'
const image = fs.readFileSync('./image.png') //any image buffer would work

const sticker = new WSF.Sticker(image, { crop: false, pack: 'Packname', author: 'Author' })
await sticker.build()
const sticBuffer = await sticker.get()


//sending with Baileys
conn.sendMessage(jid, sticBuffer, MessageType.sticker)

//saving to file
fs.writeFile('sticker.webp', sticBuffer)

```


