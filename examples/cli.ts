/**
 * Makes one sticker of every type from an image, GIF or video and prints the results.
 *
 *   npm run example -- ./cat.gif
 *   npm run example -- https://example.com/clip.mp4 --pack "My Pack" --author Me --quality 60
 *
 * Stickers are written to examples/output/.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'
import { parseArgs } from 'node:util'
import { Sticker, StickerTypes } from '../src'

const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
        pack: { type: 'string', default: 'wa-sticker-formatter' },
        author: { type: 'string', default: 'example' },
        quality: { type: 'string' }
    }
})

const [input] = positionals
if (!input) {
    console.error('Usage: npm run example -- <file or URL> [--pack name] [--author name] [--quality 1-100]')
    process.exit(1)
}

// Download URLs once instead of once per sticker type
const source = /^https?:/i.test(input) ? Buffer.from(await (await fetch(input)).arrayBuffer()) : input
const outDir = join(import.meta.dirname, 'output')
await mkdir(outDir, { recursive: true })
const name = basename(new URL(input, 'file:///').pathname, extname(input)).replace(/[^\w-]+/g, '_') || 'sticker'

for (const type of Object.values(StickerTypes)) {
    const started = performance.now()
    const message = await new Sticker(source, {
        pack: values.pack,
        author: values.author,
        type,
        quality: values.quality ? Number(values.quality) : undefined
    }).toMessage()
    const file = join(outDir, `${name}-${type}.webp`)
    await writeFile(file, message.sticker)
    console.log(
        [
            type.padEnd(8),
            `${message.width}x${message.height}`.padEnd(8),
            (message.isAnimated ? 'animated' : 'still').padEnd(9),
            `${(message.sticker.length / 1024).toFixed(1)} KB`.padStart(10),
            `${Math.round(performance.now() - started)} ms`.padStart(8),
            ` ${file}`
        ].join(' ')
    )
}
