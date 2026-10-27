import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // OPENWEATHER_API_KEY has no VITE_ prefix, so it stays on the dev server
  // and is never bundled into the code sent to the browser.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      // Local stand-in for the Netlify Function in netlify/functions/forecast.mjs
      proxy: {
        '/api/forecast': {
          target: 'https://api.openweathermap.org',
          changeOrigin: true,
          rewrite: (path: string) => {
            const city = new URL(path, 'http://localhost').searchParams.get('q') ?? 'London'
            return `/data/2.5/forecast?q=${encodeURIComponent(city)}&cnt=40&appid=${env.OPENWEATHER_API_KEY}`
          },
        },
      },
    },
  }
})
