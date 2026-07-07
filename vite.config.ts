import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: '/',
  publicDir: 'public',
  plugins: [
    // inspectAttr — только для dev: в прод-сборке он засоряет HTML атрибутами code-path
    // и ломает дедупликацию тегов react-helmet-async (дубли <title>/<canonical>).
    ...(command === 'serve' ? [inspectAttr()] : []),
    react(),
    ...(command === 'build' ? [visualizer({ open: false, filename: 'dist/stats.html' })] : []),
  ],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          charts: ['recharts'],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
}))
