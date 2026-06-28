import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    alias: {
      '~': resolve(__dirname, 'app'),
      '#imports': resolve(__dirname, 'app/composables'),
    },
  },
})
