import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        presets: ['@babel/preset-flow'],
        plugins: []
      },
      include: /\.(jsx|js|tsx|ts)$/,
    })
  ],
  esbuild: false,
  optimizeDeps: {
    exclude: ['../src/*'],
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
        '.jsx': 'jsx',
      }
    }
  },
  define: {
    global: 'globalThis',
  }
})
