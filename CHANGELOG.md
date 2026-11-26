# Changelog

## 5.1.0

### Added

- Stickers with sound. `toSoundSticker()` returns the animated sticker plus an Ogg Opus sound, taken from the video itself or from a separate audio file, with the length and waveform WhatsApp's audio message needs.
- `patchBaileysProto()` adds the `audioStickerMessage` and `StickerMessage.audioMessage` fields to Baileys' protobuf classes. Without it, Baileys 7.0.0-rc14 sends sound stickers as empty messages and drops them when they're received. The README shows how to send one.

## 5.0.0

A rewrite of the conversion code on current dependencies. The public API (`Sticker`, `createSticker`, `StickerTypes`, `extractMetadata`, `Exif`) is the same; the breaking changes are listed below.

### Fixed

- sharp is now 0.34 or 0.35 instead of 0.30. This fixes install and load errors on Linux ARM64, Alpine/musl, Heroku and new Node.js versions, and npm shares the sharp copy Baileys already installs instead of nesting an old one ([#96](https://github.com/AlenVelocity/wa-sticker-formatter/issues/96), [#34](https://github.com/AlenVelocity/wa-sticker-formatter/issues/34), [#27](https://github.com/AlenVelocity/wa-sticker-formatter/issues/27)).
- Animated stickers that were too big for WhatsApp to play. Stickers are now kept under `maxSize` (1 MB by default) by lowering quality and, for videos, frame rate ([#9](https://github.com/AlenVelocity/wa-sticker-formatter/issues/9), [#49](https://github.com/AlenVelocity/wa-sticker-formatter/issues/49)).
- Glitchy video stickers. Videos were converted to a 256-colour GIF before becoming a WebP; they now go straight to an animated WebP with ffmpeg's `libwebp_anim` encoder ([#49](https://github.com/AlenVelocity/wa-sticker-formatter/issues/49)).
- A failing ffmpeg crashed the process with an unhandled error event, or left the promise pending forever. It now rejects with an `FfmpegError` that includes ffmpeg's error output ([#36](https://github.com/AlenVelocity/wa-sticker-formatter/issues/36)).
- `extractMetadata()` failed on stickers whose JSON length contains a `{` byte, such as many Sticker.ly stickers. It now reads the EXIF tag properly instead of searching for the first `{` (closes [#40](https://github.com/AlenVelocity/wa-sticker-formatter/pull/40), thanks [@guiguicdd](https://github.com/guiguicdd) for finding the cause).
- Animated `rounded` stickers skipped the frame-by-frame crop because of a typo (`'rouded'`).
- Animated crops of GIFs larger than 500px cut a 500px square from the middle instead of using the largest square.
- GIF frames with a delay of 10 ms or less kept that delay, which plays far too fast (or not at all) in some players. They are now shown for 100 ms, as browsers do.
- Phone photos with an EXIF rotation came out sideways.
- Small SVGs came out at their own size, or blurry when `crop` or `full` scaled them up. They are now rendered at 512px.
- Temporary files from animated crops were never deleted.
- `setId()`, used in the README, didn't exist (only `setID()`).

### Added

- Animated GIF and WebP input no longer needs ffmpeg. Only video does.
- `toMessage()` returns `isAnimated`, `width` and `height` along with `sticker`. Baileys passes these to WhatsApp, which uses `isAnimated` to play the animation.
- `maxSize`, `fps` and `maxDuration` options.
- `androidAppStoreLink` and `iosAppStoreLink` options, stored under the EXIF keys sticker-maker apps use. These are likely what WhatsApp uses for the link to the app in [#45](https://github.com/AlenVelocity/wa-sticker-formatter/issues/45).
- Input can be a `Uint8Array`, `ArrayBuffer`, `URL`, `data:` URL, readable stream or async iterable (e.g. Baileys' `downloadContentFromMessage()`).
- Transparent VP9/VP8 WebM videos, such as Telegram video stickers, keep their transparency.
- `setFfmpegPath()`. ffmpeg is also found through `FFMPEG_PATH` or the optional `ffmpeg-static` package.
- A clear error for Telegram `.tgs` stickers, which are Lottie animations and aren't supported ([#46](https://github.com/AlenVelocity/wa-sticker-formatter/issues/46)).
- ESM build next to the CommonJS one, with types for both.
- `parseExif()` to read sticker metadata from raw EXIF bytes.
- `categories` accepts any emoji string; the old list is still offered by editor autocomplete.

### Breaking changes

- Requires Node.js 20.9 or newer.
- `type: 'default'` scales images larger than 512x512 down to fit (aspect ratio kept). It used to leave them at full size.
- Stickers are limited to `maxSize` (1 MB). Pass `maxSize: 0` to turn the limit off.
- When `quality` isn't set, animated stickers start at 80 instead of 100. Still images still start at 100.
- `StickerTypes` is a plain object instead of a TypeScript enum. Values and usage are the same; `StickerTypes.FULL` used as a type is now `typeof StickerTypes.FULL`.
- `Exif.add()` takes a Buffer, Uint8Array or file path, no longer a node-webpmux `Image`.
- The `metadata` object passed to `new Sticker()` is copied instead of modified, and `sticker.metadata.quality` stays `undefined` unless you set it.
- Removed dependencies: `fluent-ffmpeg` (deprecated upstream), `axios`, `file-type`, `fs-extra` and `image-size`. `image-size` also carried two unpatched DoS advisories (CVE-2025-71329, CVE-2025-71330).

### Tooling

- TypeScript 6, ESLint 10 flat config, Prettier 3, tsdown for the build.
- Tests use the Node.js test runner, run against the built package, and generate their own images and videos instead of downloading them.
- CI tests Node.js 20, 22, 24 and 26 on Linux, Linux ARM64, Windows and macOS, plus sharp 0.34. Docs are published to GitHub Pages from `master`, and publishing a GitHub release publishes to npm with provenance.

## 4.4.4

See the [GitHub releases](https://github.com/AlenVelocity/wa-sticker-formatter/releases) for 4.x and earlier.
