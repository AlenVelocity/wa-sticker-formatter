<div align="center">
<img src="https://wallpapercave.com/wp/wp8493901.png" alt="BocchiBot" width="500" />

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
const Sticker = require('wa-sticker-formatter')
```
### TypeScript
```TS 
import Sticker = require('wa-sticker-formatter')
```

## Creating Sticker

```JS
const Sticker = require('wa-sticker-formatter')

const image = fs.readFileSync('./image.png') //any image buffer would work

const sticker = new Sticker(image, { crop: false, pack: 'Packname', author: 'Author' })
await sticker.build()
const sticBuffer = sticker.get()


//sending with Baileys
conn.sendMessage(jid, sticBuffer, MessageType.sticker)

//sending with open-wa
client.sendRawWebpAsSticker(chatid, sticBuffer.toString('Base64'))

```


