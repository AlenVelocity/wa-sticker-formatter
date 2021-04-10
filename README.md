<div align="center">
<img src="https://wallpapercave.com/wp/wp8493901.png" alt="WATCIKER" width="500" />

# _**WA-STICKER-FORMATTER**_

> Whatsapp Sticker Creator/Formatter!
> 
>
</div><br/>
<br/>

# Installation
```cmd
> npm i wa-sticker-formatter
```

# Usage

## Importing

###  💛 JavaScript
```JS
const WSF = require('wa-sticker-formatter')
```
### 💙 TypeScript
```TS 
import * as WSF from 'wa-sticker-formatter'
```


## Raw Functions

> Add Metadata to Webp 

```JS
const webpWithMetadata = await WSF.setMetadata('Pack Title', 'Author', image.webp) //returns the webp buffer with metadata
```

> Create an exif metadata file
```TS

const exif = createExif('Pack', 'Author', 'filename') //returns the filename with ".exif"
```


## Creating Sticker 
**Note: The following methods need `imageMagick Legacy CLI tools` to be installed in your system**

> Regular Sticker

```JS
const sticker = new WSF.Sticker('image.png', {})
await sticker.build()
const sticBuffer = await sticker.get()

```

> Non-streched sticker 

```JS
const image = 'https://example.com/example.png' 
const sticker = new WSF.Sticker(image, { crop: false })
await sticker.build()
const sticBuffer = await sticker.get()

```

> Non-cropped Animated sticker 
```JS

const sticker = new WSF.Sticker('./image.mp4', { crop: false, animated: true })
await sticker.build()
const sticBuffer = await sticker.get()

```
> Sticker with Pack and Author Name

```JS

const sticker = new WSF.Sticker('https://example.com/sample.mp4', { crop: false, animated: true, pack: 'Pack', author: 'AUTHOR' })
await sticker.build()
const sticBuffer = await sticker.get()
```

##  Saving/Sending

> Saving to File
```JS
fs.writeFile('sticker.webp', sticBuffer)
```
> Sending With [Baileys](https://github.com/adiwajshing/baileys)
```JS
conn.sendMessage(jid, sticBuffer, MessageType.sticker)
```
> Sending With [Open-Wa/Wa-Automate-Nodejs](https://github.com/open-wa/wa-automate-nodejs)

```JS 
client.sendRawWebpAsSticker(jid, sticBuffer.toString('base64'))
```



