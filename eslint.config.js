import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig(
    { ignores: ['dist/', 'docs/', 'node_modules/', 'examples/output/', 'tests/helpers/proto/'] },
    js.configs.recommended,
    tseslint.configs.recommended,
    {
        languageOptions: { globals: globals.node }
    },
    {
        files: ['**/*.cjs'],
        languageOptions: { sourceType: 'commonjs' },
        rules: { '@typescript-eslint/no-require-imports': 'off' }
    }
)
