import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import Sticker, { extractMetadata } from '../dist/index.mjs'
import { gif, hasEncoder, hasFfmpeg, inspect, mp4, mp4WithSound, png, streams, tone } from './helpers/fixtures.mjs'

const skip = !hasFfmpeg ? 'ffmpeg is not installed' : !hasEncoder('libopus') && 'ffmpeg has no libopus'

describe('sound stickers', { skip, timeout: 300_000 }, () => {
    it("uses a video's own sound", async () => {
        const sound = await new Sticker(mp4WithSound({ seconds: 2 }), { pack: 'Sound', author: 'Me' }).toSoundSticker()
        assert.equal(sound.isAnimated, true)
        assert.deepEqual([sound.width, sound.height], [512, 288])
        assert.equal((await inspect(sound.sticker)).format, 'webp')
        assert.equal((await extractMetadata(sound.sticker))['sticker-pack-name'], 'Sound')

        assert.equal(sound.audio.subarray(0, 4).toString(), 'OggS')
        const found = streams(sound.audio)
        assert.equal(found.length, 1, `only the audio stream, got ${found}`)
        assert.match(found[0], /^Audio: opus, 48000 Hz, mono/)
        assert.equal(sound.seconds, 2)
        assert.equal(sound.waveform.length, 64)
        // The last bar also covers the few milliseconds of padding at the end of the encoded audio
        assert.ok(Math.min(...sound.waveform.subarray(0, 63)) > 80, 'a steady tone has a flat waveform')
    })

    it('uses a separate audio file', async () => {
        const sound = await new Sticker(await gif()).toSoundSticker(tone({ seconds: 3, format: 'mp3' }))
        assert.equal(sound.isAnimated, true)
        assert.match(streams(sound.audio)[0], /^Audio: opus/)
        assert.equal(sound.seconds, 3)
    })

    it('draws quiet parts low on the waveform', async () => {
        const { waveform } = await new Sticker(await gif()).toSoundSticker(tone({ seconds: 4, silence: 2 }))
        assert.ok(Math.max(...waveform.subarray(0, 28)) < 5, 'silent first half')
        assert.ok(Math.min(...waveform.subarray(36)) > 80, 'loud second half')
        assert.equal(Math.max(...waveform), 100)
    })

    it('cuts the sound to maxDuration', async () => {
        const sound = await new Sticker(mp4WithSound({ seconds: 4 }), { maxDuration: 2 }).toSoundSticker()
        assert.equal(sound.seconds, 2)
    })

    it('explains when the video has no sound', async () => {
        await assert.rejects(new Sticker(mp4()).toSoundSticker(), /no audio track/)
    })

    it('rejects still images', async () => {
        await assert.rejects(new Sticker(await png(64, 64)).toSoundSticker(tone()), /must be animated/)
    })

    it('leaves the sound out of toMessage()', async () => {
        const message = await new Sticker(mp4WithSound()).toMessage()
        assert.deepEqual(Object.keys(message).sort(), ['height', 'isAnimated', 'sticker', 'width'])
    })
})
