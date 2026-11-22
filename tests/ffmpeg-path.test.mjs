import assert from 'node:assert/strict'
import { it } from 'node:test'
import Sticker, { FfmpegError, setFfmpegPath } from '../dist/index.mjs'
import { mp4, hasFfmpeg } from './helpers/fixtures.mjs'

// Runs in its own file (and process) because setFfmpegPath() is global
it(
    'explains how to install ffmpeg when it is missing',
    { skip: !hasFfmpeg && 'ffmpeg is needed to make the test video' },
    async () => {
        setFfmpegPath('ffmpeg-binary-that-does-not-exist')
        await assert.rejects(new Sticker(mp4()).build(), (err) => {
            assert.ok(err instanceof FfmpegError)
            assert.match(err.message, /ffmpeg was not found/)
            assert.match(err.message, /FFMPEG_PATH/)
            return true
        })
    }
)
