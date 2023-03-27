import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'
import svgrPlugin from 'vite-plugin-svgr'

// build works but preview fails:
// https://github.com/vitejs/vite/issues/10542#issuecomment-1437037545

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5172,
  },
  plugins: [
    svgrPlugin({
      svgrOptions: {
        icon: true,
        // ...svgr options (https://react-svgr.com/docs/options/)
      },
    }),
    VitePWA({
      workbox: {
        sourcemap: true,
        globPatterns: [
          '**/*.{js,jsx,ts,tsx,css,html,ico,png,svg,webp,avif,jpg,json,woff2,woff}',
        ],
        maximumFileSizeToCacheInBytes: 1000000000,
      },
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'favicon.ico',
        'robots.txt',
        'favicon_192.png',
        'favicon_512.png',
      ],
      // https://developer.mozilla.org/en-US/docs/Web/Manifest
      manifest: {
        name: 'Capturing',
        short_name: 'Capturing data',
        description: 'Capture data: whatever, wherever, whenever, whoever',
        theme_color: '#4a148c',
        display: 'minimal-ui',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable any',
          },
          {
            src: '/favicon_192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/favicon_512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
        categories: ['business', 'productivity'],
        screenshots: [],
      },
      devOptions: {
        //enabled: true,
      },
    }),
    react(),
  ],
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
})
