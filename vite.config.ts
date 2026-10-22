import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: '/',
  publicDir: 'public',
  // Корневой .env принадлежит admin-серверу (NODE_ENV=development, секреты). Если Vite его читает,
  // NODE_ENV из него переключает сборку на development-React (jsxDEV, ×2–3 Script Evaluation).
  // Фронтенду нужны только VITE_* — они в env/.env.
  envDir: path.resolve(__dirname, 'env'),
  plugins: [
    // inspectAttr — только для dev: в прод-сборке он засоряет HTML атрибутами code-path
    // и ломает дедупликацию тегов react-helmet-async (дубли <title>/<canonical>).
    ...(command === 'serve' ? [inspectAttr()] : []),
    react(),
    // Карта бандла — только по запросу (ANALYZE=1 npm run build), иначе stats.html попадает в dist и на прод.
    ...(command === 'build' && process.env.ANALYZE === '1' ? [visualizer({ open: false, filename: 'stats.html' })] : []),
  ],
  // JSON-локали → JSON.parse("…"): парсится быстрее объектного литерала (меньше Script Evaluation)
  json: { stringify: true },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          // Изолируем ТОЛЬКО «листовые» ленивые библиотеки: они импортируют react в один
          // сторону, но vendor их не импортирует → циклов между чанками нет.
          if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) return 'motion';
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) return 'charts';
          // Ядро, нужное на КАЖДОЙ странице (в т.ч. при гидрации главной) — держим одним
          // чанком, чтобы исключить меж-вендорные циклы и TDZ (createContext undefined).
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom|@remix-run[\\/]router|use-sync-external-store|i18next|react-i18next|i18next-browser-languagedetector|react-helmet-async|clsx|tailwind-merge|class-variance-authority)[\\/]/.test(id)) {
            return 'vendor';
          }
          // Всё остальное (radix, react-hook-form, zod, embla, date-fns, axios, sonner, vaul…)
          // используется только ленивыми маршрутами (формы/блог/админка) — отдаём Rollup на
          // авто-сплит: эти либы уедут в чанки своих маршрутов и НЕ грузятся на главной.
          return undefined;
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
