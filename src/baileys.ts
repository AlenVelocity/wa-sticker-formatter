/**
 * Baileys' generated protobuf code predates sound stickers, so it drops the two fields they use:
 * `Message.audioStickerMessage` (field 134) and `StickerMessage.audioMessage` (field 26).
 * `patchBaileysProto()` teaches the generated classes to encode, decode and convert those fields.
 */

interface Writer {
    uint32(value: number): Writer
    fork(): Writer
    ldelim(): Writer
}

interface Reader {
    buf: Uint8Array
    pos: number
    len: number
}

/** The static methods protobufjs generates for every message class */
interface MessageClass {
    prototype: object
    encode(message: unknown, writer?: Writer): Writer
    decode(reader: Reader | Uint8Array, length?: number, endGroup?: number): Record<string, unknown>
    fromObject(object: unknown): Record<string, unknown>
    toObject(message: unknown, options?: unknown): Record<string, unknown>
}

const PATCHED = Symbol.for('wa-sticker-formatter.patched-fields')

const readVarint = (buf: Uint8Array, pos: number): [value: number, next: number] => {
    let value = 0
    let shift = 0
    for (;;) {
        if (pos >= buf.length) throw new RangeError('Truncated protobuf varint')
        const byte = buf[pos++]
        // Multiplication instead of << so values above 2^31 stay positive
        value += (byte & 0x7f) * 2 ** shift
        if (byte < 0x80) return [value, pos]
        shift += 7
        if (shift > 63) throw new RangeError('Invalid protobuf varint')
    }
}

/**
 * Finds the last length-delimited field `field` among the top-level fields in `buf[start..end)`.
 * Returns undefined when it is missing or the bytes use groups, which WhatsApp's protocol doesn't.
 */
export const findField = (buf: Uint8Array, start: number, end: number, field: number): Uint8Array | undefined => {
    let found: Uint8Array | undefined
    let pos = start
    while (pos < end) {
        const [tag, afterTag] = readVarint(buf, pos)
        pos = afterTag
        const wireType = tag % 8
        if (wireType === 0) {
            pos = readVarint(buf, pos)[1]
        } else if (wireType === 1) {
            pos += 8
        } else if (wireType === 5) {
            pos += 4
        } else if (wireType === 2) {
            const [length, afterLength] = readVarint(buf, pos)
            pos = afterLength + length
            if (Math.floor(tag / 8) === field) found = buf.subarray(afterLength, pos)
        } else {
            return undefined
        }
    }
    return pos === end ? found : undefined
}

/** Wraps a generated class's static methods so they also handle `name` = `field`, of type `Inner` */
const addField = (Outer: MessageClass, name: string, field: number, Inner: MessageClass): void => {
    const patched = ((Outer as unknown as Record<symbol, Set<string>>)[PATCHED] ??= new Set())
    // Already there: patched before, or a Baileys version whose proto has the field
    if (patched.has(name) || name in Outer.prototype) return
    patched.add(name)
    Object.defineProperty(Outer.prototype, name, { value: null, writable: true, configurable: true })

    const { encode, decode, fromObject, toObject } = Outer
    const tag = field * 8 + 2

    Outer.encode = function (message, writer) {
        const out = encode.call(this, message, writer)
        const value = (message as Record<string, unknown> | null)?.[name]
        if (value != null) Inner.encode(value, out.uint32(tag).fork()).ldelim()
        return out
    }

    Outer.decode = function (reader, length, endGroup) {
        const bytes = reader instanceof Uint8Array
        const buf = bytes ? reader : reader.buf
        const start = bytes ? 0 : reader.pos
        const end = length === undefined ? (bytes ? reader.length : reader.len) : start + length
        const message = decode.call(this, reader, length, endGroup)
        if (endGroup === undefined) {
            const value = findField(buf, start, end, field)
            if (value) message[name] = Inner.decode(value)
        }
        return message
    }

    Outer.fromObject = function (object) {
        const message = fromObject.call(this, object)
        const value = (object as Record<string, unknown> | null)?.[name]
        if (message !== object && value != null) message[name] = Inner.fromObject(value)
        return message
    }

    Outer.toObject = function (message, options) {
        const object = toObject.call(this, message, options)
        const value = (message as Record<string, unknown> | null)?.[name]
        if (value != null) object[name] = Inner.toObject(value, options)
        return object
    }
}

const isMessageClass = (value: unknown): value is MessageClass =>
    typeof value === 'function' &&
    ['encode', 'decode', 'fromObject', 'toObject'].every(
        (method) => typeof (value as unknown as Record<string, unknown>)[method] === 'function'
    )

/**
 * Adds sound sticker support to Baileys' protobuf classes, so `relayMessage` sends the
 * `audioStickerMessage` wrapper and the sticker's audio, and received sound stickers keep their
 * audio. Call it once at startup with the `proto` that Baileys exports. It does nothing for fields
 * your Baileys version already has, so it is safe to leave in after Baileys adds them.
 * @param proto - `import { proto } from 'baileys'`
 * @example
 * import { proto } from 'baileys'
 * import { patchBaileysProto } from 'wa-sticker-formatter'
 *
 * patchBaileysProto(proto)
 */
export const patchBaileysProto = (proto: { Message: object }): void => {
    const Message = proto?.Message as unknown as Record<string, unknown> | undefined
    const classes = {
        Message,
        StickerMessage: Message?.StickerMessage,
        AudioMessage: Message?.AudioMessage,
        FutureProofMessage: Message?.FutureProofMessage
    }
    for (const [key, value] of Object.entries(classes)) {
        if (!isMessageClass(value)) {
            throw new TypeError(
                `patchBaileysProto() needs the proto object Baileys exports (import { proto } from 'baileys'). ` +
                    `${key === 'Message' ? 'proto.Message' : `proto.Message.${key}`} is missing.`
            )
        }
    }
    const checked = classes as unknown as Record<keyof typeof classes, MessageClass>
    addField(checked.StickerMessage, 'audioMessage', 26, checked.AudioMessage)
    addField(checked.Message, 'audioStickerMessage', 134, checked.FutureProofMessage)
}
