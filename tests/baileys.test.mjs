import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { patchBaileysProto } from '../dist/index.mjs'
import { proto as legacy } from './helpers/proto/legacy.mjs'
import { proto as sound } from './helpers/proto/sound.mjs'

// `legacy` is generated the way Baileys generates its proto, from a schema without the sound sticker
// fields. `sound` is the same schema with them, standing in for WhatsApp's side of the wire.

const waveform = Uint8Array.from({ length: 64 }, (_, i) => i)
const content = {
    audioStickerMessage: {
        message: {
            stickerMessage: {
                url: 'https://mmg.whatsapp.net/sticker',
                mimetype: 'image/webp',
                isAnimated: true,
                audioMessage: {
                    url: 'https://mmg.whatsapp.net/audio',
                    mimetype: 'audio/ogg; codecs=opus',
                    seconds: 3,
                    waveform
                }
            }
        }
    }
}

const audioOf = (message) => message.audioStickerMessage?.message?.stickerMessage?.audioMessage

describe('patchBaileysProto', () => {
    it('drops sound sticker fields before patching', () => {
        const bytes = legacy.Message.encode(legacy.Message.fromObject(content)).finish()
        assert.equal(sound.Message.decode(bytes).audioStickerMessage, null)
    })

    it('patches without errors, and again without changing anything', () => {
        patchBaileysProto(legacy)
        const { encode } = legacy.Message
        patchBaileysProto(legacy)
        assert.equal(legacy.Message.encode, encode)
    })

    it('sends what Baileys builds with fromObject()', () => {
        const bytes = legacy.Message.encode(legacy.Message.fromObject(content)).finish()
        const audio = audioOf(sound.Message.decode(bytes))
        assert.equal(audio.url, 'https://mmg.whatsapp.net/audio')
        assert.equal(audio.mimetype, 'audio/ogg; codecs=opus')
        assert.equal(audio.seconds, 3)
        assert.deepEqual([...audio.waveform], [...waveform])
        assert.equal(sound.Message.decode(bytes).audioStickerMessage.message.stickerMessage.isAnimated, true)
    })

    it('sends a sticker built from a prepared StickerMessage instance', () => {
        const stickerMessage = legacy.Message.StickerMessage.fromObject({ url: 'u', isAnimated: true })
        stickerMessage.audioMessage = legacy.Message.AudioMessage.fromObject({ seconds: 2 })
        const message = legacy.Message.fromObject({ audioStickerMessage: { message: { stickerMessage } } })
        assert.equal(audioOf(sound.Message.decode(legacy.Message.encode(message).finish())).seconds, 2)
    })

    it('reads received sound stickers', () => {
        const bytes = sound.Message.encode(sound.Message.fromObject(content)).finish()
        const message = legacy.Message.decode(bytes)
        assert.equal(audioOf(message).seconds, 3)
        assert.deepEqual([...audioOf(message).waveform], [...waveform])
        assert.equal(message.audioStickerMessage.message.stickerMessage.url, 'https://mmg.whatsapp.net/sticker')
        assert.equal(audioOf(legacy.Message.toObject(message)).mimetype, 'audio/ogg; codecs=opus')
        assert.equal(audioOf(JSON.parse(JSON.stringify(message))).seconds, 3)
    })

    it('reads sound stickers nested in other messages', () => {
        const bytes = sound.Message.encode(sound.Message.fromObject({ viewOnceMessage: { message: content } })).finish()
        assert.equal(audioOf(legacy.Message.decode(bytes).viewOnceMessage.message).seconds, 3)
    })

    it('leaves other messages alone', () => {
        const bytes = legacy.Message.encode({ conversation: 'hi' }).finish()
        assert.deepEqual(legacy.Message.toObject(legacy.Message.decode(bytes)), { conversation: 'hi' })
    })

    it('does nothing for a proto that already has the fields', () => {
        const before = { ...sound.Message, sticker: sound.Message.StickerMessage.encode }
        patchBaileysProto(sound)
        assert.equal(sound.Message.encode, before.encode)
        assert.equal(sound.Message.StickerMessage.encode, before.sticker)
    })

    it('explains a wrong argument', () => {
        assert.throws(() => patchBaileysProto({}), /import \{ proto \} from 'baileys'/)
        assert.throws(() => patchBaileysProto({ Message: legacy.Message.StickerMessage }), /StickerMessage is missing/)
    })
})
