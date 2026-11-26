/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

const $root = $protobuf.roots.legacy || ($protobuf.roots.legacy = {});

export const proto = $root.proto = (() => {

    const proto = {};

    proto.Message = (function() {

        function Message(p) {
            if (p)
                for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                    if (p[ks[i]] != null && ks[i] !== "__proto__")
                        this[ks[i]] = p[ks[i]];
        }

        Message.prototype.conversation = null;
        Message.prototype.stickerMessage = null;
        Message.prototype.viewOnceMessage = null;

        let $oneOfFields;

        Object.defineProperty(Message.prototype, "_conversation", {
            get: $util.oneOfGetter($oneOfFields = ["conversation"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        Object.defineProperty(Message.prototype, "_stickerMessage", {
            get: $util.oneOfGetter($oneOfFields = ["stickerMessage"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        Object.defineProperty(Message.prototype, "_viewOnceMessage", {
            get: $util.oneOfGetter($oneOfFields = ["viewOnceMessage"]),
            set: $util.oneOfSetter($oneOfFields)
        });

        Message.create = function create(properties) {
            return new Message(properties);
        };

        Message.encode = function encode(m, w, q) {
            if (!w)
                w = $Writer.create();
            if (q === undefined)
                q = 0;
            if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
            if (m.conversation != null && Object.hasOwnProperty.call(m, "conversation"))
                w.uint32(10).string(m.conversation);
            if (m.stickerMessage != null && Object.hasOwnProperty.call(m, "stickerMessage"))
                $root.proto.Message.StickerMessage.encode(m.stickerMessage, w.uint32(210).fork(), q + 1).ldelim();
            if (m.viewOnceMessage != null && Object.hasOwnProperty.call(m, "viewOnceMessage"))
                $root.proto.Message.FutureProofMessage.encode(m.viewOnceMessage, w.uint32(298).fork(), q + 1).ldelim();
            return w;
        };

        Message.decode = function decode(r, l, e, n) {
            if (!(r instanceof $Reader))
                r = $Reader.create(r);
            if (n === undefined)
                n = 0;
            if (n > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            var c, m;
            if (l === undefined)
                c = r.len;
            else {
                c = r.pos + l;
                if (c > r.len)
                    throw RangeError("index out of range");
                l = r.len;
                r.len = c;
            }
            m = new $root.proto.Message();
            while (r.pos < c) {
                var t = r.uint32();
                if (t === e)
                    break;
                switch (t >>> 3) {
                case 1: {
                        m.conversation = r.string();
                        break;
                    }
                case 26: {
                        m.stickerMessage = $root.proto.Message.StickerMessage.decode(r, r.uint32(), undefined, n + 1);
                        break;
                    }
                case 37: {
                        m.viewOnceMessage = $root.proto.Message.FutureProofMessage.decode(r, r.uint32(), undefined, n + 1);
                        break;
                    }
                default:
                    r.skipType(t & 7, n);
                    break;
                }
            }
            if (l !== undefined) {
                if (r.pos !== c)
                    throw RangeError("index out of range");
                r.len = l;
            }
            return m;
        };

        Message.fromObject = function fromObject(d, n) {
            if (d instanceof $root.proto.Message)
                return d;
            if (!$util.isObject(d))
                throw TypeError(".proto.Message: object expected");
            if (n === undefined)
                n = 0;
            if (n > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            var m = new $root.proto.Message();
            if (d.conversation != null) {
                m.conversation = String(d.conversation);
            }
            if (d.stickerMessage != null) {
                if (!$util.isObject(d.stickerMessage))
                    throw TypeError(".proto.Message.stickerMessage: object expected");
                m.stickerMessage = $root.proto.Message.StickerMessage.fromObject(d.stickerMessage, n + 1);
            }
            if (d.viewOnceMessage != null) {
                if (!$util.isObject(d.viewOnceMessage))
                    throw TypeError(".proto.Message.viewOnceMessage: object expected");
                m.viewOnceMessage = $root.proto.Message.FutureProofMessage.fromObject(d.viewOnceMessage, n + 1);
            }
            return m;
        };

        Message.toObject = function toObject(m, o, q) {
            if (!o)
                o = {};
            if (q === undefined)
                q = 0;
            if (q > $util.recursionLimit)
                throw Error("max depth exceeded");
            var d = {};
            if (m.conversation != null && Object.hasOwnProperty.call(m, "conversation")) {
                d.conversation = m.conversation;
                if (o.oneofs)
                    d._conversation = "conversation";
            }
            if (m.stickerMessage != null && Object.hasOwnProperty.call(m, "stickerMessage")) {
                d.stickerMessage = $root.proto.Message.StickerMessage.toObject(m.stickerMessage, o, q + 1);
                if (o.oneofs)
                    d._stickerMessage = "stickerMessage";
            }
            if (m.viewOnceMessage != null && Object.hasOwnProperty.call(m, "viewOnceMessage")) {
                d.viewOnceMessage = $root.proto.Message.FutureProofMessage.toObject(m.viewOnceMessage, o, q + 1);
                if (o.oneofs)
                    d._viewOnceMessage = "viewOnceMessage";
            }
            return d;
        };

        Message.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        Message.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/proto.Message";
        };

        Message.StickerMessage = (function() {

            function StickerMessage(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null && ks[i] !== "__proto__")
                            this[ks[i]] = p[ks[i]];
            }

            StickerMessage.prototype.url = null;
            StickerMessage.prototype.mimetype = null;
            StickerMessage.prototype.height = null;
            StickerMessage.prototype.width = null;
            StickerMessage.prototype.isAnimated = null;

            let $oneOfFields;

            Object.defineProperty(StickerMessage.prototype, "_url", {
                get: $util.oneOfGetter($oneOfFields = ["url"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            Object.defineProperty(StickerMessage.prototype, "_mimetype", {
                get: $util.oneOfGetter($oneOfFields = ["mimetype"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            Object.defineProperty(StickerMessage.prototype, "_height", {
                get: $util.oneOfGetter($oneOfFields = ["height"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            Object.defineProperty(StickerMessage.prototype, "_width", {
                get: $util.oneOfGetter($oneOfFields = ["width"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            Object.defineProperty(StickerMessage.prototype, "_isAnimated", {
                get: $util.oneOfGetter($oneOfFields = ["isAnimated"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            StickerMessage.create = function create(properties) {
                return new StickerMessage(properties);
            };

            StickerMessage.encode = function encode(m, w, q) {
                if (!w)
                    w = $Writer.create();
                if (q === undefined)
                    q = 0;
                if (q > $util.recursionLimit)
                    throw Error("max depth exceeded");
                if (m.url != null && Object.hasOwnProperty.call(m, "url"))
                    w.uint32(10).string(m.url);
                if (m.mimetype != null && Object.hasOwnProperty.call(m, "mimetype"))
                    w.uint32(42).string(m.mimetype);
                if (m.height != null && Object.hasOwnProperty.call(m, "height"))
                    w.uint32(48).uint32(m.height);
                if (m.width != null && Object.hasOwnProperty.call(m, "width"))
                    w.uint32(56).uint32(m.width);
                if (m.isAnimated != null && Object.hasOwnProperty.call(m, "isAnimated"))
                    w.uint32(104).bool(m.isAnimated);
                return w;
            };

            StickerMessage.decode = function decode(r, l, e, n) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                if (n === undefined)
                    n = 0;
                if (n > $Reader.recursionLimit)
                    throw Error("maximum nesting depth exceeded");
                var c, m;
                if (l === undefined)
                    c = r.len;
                else {
                    c = r.pos + l;
                    if (c > r.len)
                        throw RangeError("index out of range");
                    l = r.len;
                    r.len = c;
                }
                m = new $root.proto.Message.StickerMessage();
                while (r.pos < c) {
                    var t = r.uint32();
                    if (t === e)
                        break;
                    switch (t >>> 3) {
                    case 1: {
                            m.url = r.string();
                            break;
                        }
                    case 5: {
                            m.mimetype = r.string();
                            break;
                        }
                    case 6: {
                            m.height = r.uint32();
                            break;
                        }
                    case 7: {
                            m.width = r.uint32();
                            break;
                        }
                    case 13: {
                            m.isAnimated = r.bool();
                            break;
                        }
                    default:
                        r.skipType(t & 7, n);
                        break;
                    }
                }
                if (l !== undefined) {
                    if (r.pos !== c)
                        throw RangeError("index out of range");
                    r.len = l;
                }
                return m;
            };

            StickerMessage.fromObject = function fromObject(d, n) {
                if (d instanceof $root.proto.Message.StickerMessage)
                    return d;
                if (!$util.isObject(d))
                    throw TypeError(".proto.Message.StickerMessage: object expected");
                if (n === undefined)
                    n = 0;
                if (n > $util.recursionLimit)
                    throw Error("maximum nesting depth exceeded");
                var m = new $root.proto.Message.StickerMessage();
                if (d.url != null) {
                    m.url = String(d.url);
                }
                if (d.mimetype != null) {
                    m.mimetype = String(d.mimetype);
                }
                if (d.height != null) {
                    m.height = d.height >>> 0;
                }
                if (d.width != null) {
                    m.width = d.width >>> 0;
                }
                if (d.isAnimated != null) {
                    m.isAnimated = Boolean(d.isAnimated);
                }
                return m;
            };

            StickerMessage.toObject = function toObject(m, o, q) {
                if (!o)
                    o = {};
                if (q === undefined)
                    q = 0;
                if (q > $util.recursionLimit)
                    throw Error("max depth exceeded");
                var d = {};
                if (m.url != null && Object.hasOwnProperty.call(m, "url")) {
                    d.url = m.url;
                    if (o.oneofs)
                        d._url = "url";
                }
                if (m.mimetype != null && Object.hasOwnProperty.call(m, "mimetype")) {
                    d.mimetype = m.mimetype;
                    if (o.oneofs)
                        d._mimetype = "mimetype";
                }
                if (m.height != null && Object.hasOwnProperty.call(m, "height")) {
                    d.height = m.height;
                    if (o.oneofs)
                        d._height = "height";
                }
                if (m.width != null && Object.hasOwnProperty.call(m, "width")) {
                    d.width = m.width;
                    if (o.oneofs)
                        d._width = "width";
                }
                if (m.isAnimated != null && Object.hasOwnProperty.call(m, "isAnimated")) {
                    d.isAnimated = m.isAnimated;
                    if (o.oneofs)
                        d._isAnimated = "isAnimated";
                }
                return d;
            };

            StickerMessage.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            StickerMessage.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/proto.Message.StickerMessage";
            };

            return StickerMessage;
        })();

        Message.AudioMessage = (function() {

            function AudioMessage(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null && ks[i] !== "__proto__")
                            this[ks[i]] = p[ks[i]];
            }

            AudioMessage.prototype.url = null;
            AudioMessage.prototype.mimetype = null;
            AudioMessage.prototype.seconds = null;
            AudioMessage.prototype.ptt = null;
            AudioMessage.prototype.waveform = null;

            let $oneOfFields;

            Object.defineProperty(AudioMessage.prototype, "_url", {
                get: $util.oneOfGetter($oneOfFields = ["url"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            Object.defineProperty(AudioMessage.prototype, "_mimetype", {
                get: $util.oneOfGetter($oneOfFields = ["mimetype"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            Object.defineProperty(AudioMessage.prototype, "_seconds", {
                get: $util.oneOfGetter($oneOfFields = ["seconds"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            Object.defineProperty(AudioMessage.prototype, "_ptt", {
                get: $util.oneOfGetter($oneOfFields = ["ptt"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            Object.defineProperty(AudioMessage.prototype, "_waveform", {
                get: $util.oneOfGetter($oneOfFields = ["waveform"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            AudioMessage.create = function create(properties) {
                return new AudioMessage(properties);
            };

            AudioMessage.encode = function encode(m, w, q) {
                if (!w)
                    w = $Writer.create();
                if (q === undefined)
                    q = 0;
                if (q > $util.recursionLimit)
                    throw Error("max depth exceeded");
                if (m.url != null && Object.hasOwnProperty.call(m, "url"))
                    w.uint32(10).string(m.url);
                if (m.mimetype != null && Object.hasOwnProperty.call(m, "mimetype"))
                    w.uint32(18).string(m.mimetype);
                if (m.seconds != null && Object.hasOwnProperty.call(m, "seconds"))
                    w.uint32(40).uint32(m.seconds);
                if (m.ptt != null && Object.hasOwnProperty.call(m, "ptt"))
                    w.uint32(48).bool(m.ptt);
                if (m.waveform != null && Object.hasOwnProperty.call(m, "waveform"))
                    w.uint32(154).bytes(m.waveform);
                return w;
            };

            AudioMessage.decode = function decode(r, l, e, n) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                if (n === undefined)
                    n = 0;
                if (n > $Reader.recursionLimit)
                    throw Error("maximum nesting depth exceeded");
                var c, m;
                if (l === undefined)
                    c = r.len;
                else {
                    c = r.pos + l;
                    if (c > r.len)
                        throw RangeError("index out of range");
                    l = r.len;
                    r.len = c;
                }
                m = new $root.proto.Message.AudioMessage();
                while (r.pos < c) {
                    var t = r.uint32();
                    if (t === e)
                        break;
                    switch (t >>> 3) {
                    case 1: {
                            m.url = r.string();
                            break;
                        }
                    case 2: {
                            m.mimetype = r.string();
                            break;
                        }
                    case 5: {
                            m.seconds = r.uint32();
                            break;
                        }
                    case 6: {
                            m.ptt = r.bool();
                            break;
                        }
                    case 19: {
                            m.waveform = r.bytes();
                            break;
                        }
                    default:
                        r.skipType(t & 7, n);
                        break;
                    }
                }
                if (l !== undefined) {
                    if (r.pos !== c)
                        throw RangeError("index out of range");
                    r.len = l;
                }
                return m;
            };

            AudioMessage.fromObject = function fromObject(d, n) {
                if (d instanceof $root.proto.Message.AudioMessage)
                    return d;
                if (!$util.isObject(d))
                    throw TypeError(".proto.Message.AudioMessage: object expected");
                if (n === undefined)
                    n = 0;
                if (n > $util.recursionLimit)
                    throw Error("maximum nesting depth exceeded");
                var m = new $root.proto.Message.AudioMessage();
                if (d.url != null) {
                    m.url = String(d.url);
                }
                if (d.mimetype != null) {
                    m.mimetype = String(d.mimetype);
                }
                if (d.seconds != null) {
                    m.seconds = d.seconds >>> 0;
                }
                if (d.ptt != null) {
                    m.ptt = Boolean(d.ptt);
                }
                if (d.waveform != null) {
                    if (typeof d.waveform === "string")
                        $util.base64.decode(d.waveform, m.waveform = $util.newBuffer($util.base64.length(d.waveform)), 0);
                    else if (d.waveform.length >= 0)
                        m.waveform = d.waveform;
                }
                return m;
            };

            AudioMessage.toObject = function toObject(m, o, q) {
                if (!o)
                    o = {};
                if (q === undefined)
                    q = 0;
                if (q > $util.recursionLimit)
                    throw Error("max depth exceeded");
                var d = {};
                if (m.url != null && Object.hasOwnProperty.call(m, "url")) {
                    d.url = m.url;
                    if (o.oneofs)
                        d._url = "url";
                }
                if (m.mimetype != null && Object.hasOwnProperty.call(m, "mimetype")) {
                    d.mimetype = m.mimetype;
                    if (o.oneofs)
                        d._mimetype = "mimetype";
                }
                if (m.seconds != null && Object.hasOwnProperty.call(m, "seconds")) {
                    d.seconds = m.seconds;
                    if (o.oneofs)
                        d._seconds = "seconds";
                }
                if (m.ptt != null && Object.hasOwnProperty.call(m, "ptt")) {
                    d.ptt = m.ptt;
                    if (o.oneofs)
                        d._ptt = "ptt";
                }
                if (m.waveform != null && Object.hasOwnProperty.call(m, "waveform")) {
                    d.waveform = o.bytes === String ? $util.base64.encode(m.waveform, 0, m.waveform.length) : o.bytes === Array ? Array.prototype.slice.call(m.waveform) : m.waveform;
                    if (o.oneofs)
                        d._waveform = "waveform";
                }
                return d;
            };

            AudioMessage.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            AudioMessage.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/proto.Message.AudioMessage";
            };

            return AudioMessage;
        })();

        Message.FutureProofMessage = (function() {

            function FutureProofMessage(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null && ks[i] !== "__proto__")
                            this[ks[i]] = p[ks[i]];
            }

            FutureProofMessage.prototype.message = null;

            let $oneOfFields;

            Object.defineProperty(FutureProofMessage.prototype, "_message", {
                get: $util.oneOfGetter($oneOfFields = ["message"]),
                set: $util.oneOfSetter($oneOfFields)
            });

            FutureProofMessage.create = function create(properties) {
                return new FutureProofMessage(properties);
            };

            FutureProofMessage.encode = function encode(m, w, q) {
                if (!w)
                    w = $Writer.create();
                if (q === undefined)
                    q = 0;
                if (q > $util.recursionLimit)
                    throw Error("max depth exceeded");
                if (m.message != null && Object.hasOwnProperty.call(m, "message"))
                    $root.proto.Message.encode(m.message, w.uint32(10).fork(), q + 1).ldelim();
                return w;
            };

            FutureProofMessage.decode = function decode(r, l, e, n) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                if (n === undefined)
                    n = 0;
                if (n > $Reader.recursionLimit)
                    throw Error("maximum nesting depth exceeded");
                var c, m;
                if (l === undefined)
                    c = r.len;
                else {
                    c = r.pos + l;
                    if (c > r.len)
                        throw RangeError("index out of range");
                    l = r.len;
                    r.len = c;
                }
                m = new $root.proto.Message.FutureProofMessage();
                while (r.pos < c) {
                    var t = r.uint32();
                    if (t === e)
                        break;
                    switch (t >>> 3) {
                    case 1: {
                            m.message = $root.proto.Message.decode(r, r.uint32(), undefined, n + 1);
                            break;
                        }
                    default:
                        r.skipType(t & 7, n);
                        break;
                    }
                }
                if (l !== undefined) {
                    if (r.pos !== c)
                        throw RangeError("index out of range");
                    r.len = l;
                }
                return m;
            };

            FutureProofMessage.fromObject = function fromObject(d, n) {
                if (d instanceof $root.proto.Message.FutureProofMessage)
                    return d;
                if (!$util.isObject(d))
                    throw TypeError(".proto.Message.FutureProofMessage: object expected");
                if (n === undefined)
                    n = 0;
                if (n > $util.recursionLimit)
                    throw Error("maximum nesting depth exceeded");
                var m = new $root.proto.Message.FutureProofMessage();
                if (d.message != null) {
                    if (!$util.isObject(d.message))
                        throw TypeError(".proto.Message.FutureProofMessage.message: object expected");
                    m.message = $root.proto.Message.fromObject(d.message, n + 1);
                }
                return m;
            };

            FutureProofMessage.toObject = function toObject(m, o, q) {
                if (!o)
                    o = {};
                if (q === undefined)
                    q = 0;
                if (q > $util.recursionLimit)
                    throw Error("max depth exceeded");
                var d = {};
                if (m.message != null && Object.hasOwnProperty.call(m, "message")) {
                    d.message = $root.proto.Message.toObject(m.message, o, q + 1);
                    if (o.oneofs)
                        d._message = "message";
                }
                return d;
            };

            FutureProofMessage.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            FutureProofMessage.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                if (typeUrlPrefix === undefined) {
                    typeUrlPrefix = "type.googleapis.com";
                }
                return typeUrlPrefix + "/proto.Message.FutureProofMessage";
            };

            return FutureProofMessage;
        })();

        return Message;
    })();

    return proto;
})();

export { $root as default };
