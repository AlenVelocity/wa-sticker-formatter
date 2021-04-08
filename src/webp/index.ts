import { join } from 'path'

export default (bin: 'cwebp' | 'gif2webp' | 'webpmux'): string =>
    `"${join(
        join(__dirname, '..', '..', 'bin'),
        process.platform === 'darwin'
            ? 'libwebp_osx'
            : process.platform === 'win32'
            ? 'libwebp_win64'
            : 'libwebp_linux',
        'bin',
        bin
    )}"`
