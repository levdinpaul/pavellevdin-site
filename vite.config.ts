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
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          // Изолируем ТОЛЬКО «листовые» ленивые библиотеки: они импортируют react в один
          // сторону, но vendor их не импортирует → циклов между чанками нет.
          if (id.includes('gsap')) return 'gsap';
          if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) return 'motion';
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) return 'charts';
          // Всё остальное (react, react-dom, router, i18next, radix, helmet…) — в один чанк,
          // чтобы исключить меж-вендорные циклы и ошибки порядка инициализации (TDZ / createContext undefined).
          return 'vendor';
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
