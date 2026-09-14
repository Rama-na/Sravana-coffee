import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  GITHUB PAGES BASE PATH  ←  THE ONE VALUE YOU MUST SET
 * ─────────────────────────────────────────────────────────────────────────────
 *  A project site is served from   https://<user>.github.io/<REPOSITORY>/
 *  so Vite has to prefix every asset URL with "/<REPOSITORY>/".
 *
 *  Put your repository name below (keep the leading + trailing slash), e.g.
 *      const REPOSITORY_BASE = '/saravana-coffee/'
 *
 *  The bundled GitHub Action (.github/workflows/deploy.yml) sets the
 *  VITE_BASE env var to "/${{ github.event.repository.name }}/" automatically,
 *  so CI deployments work without touching this file at all.
 *
 *  Using a custom domain or a <user>.github.io user site? Use '/'.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const REPOSITORY_BASE = '/Sravana-coffee/'

export default defineConfig(({ command }) => ({
  // `npm run dev` always serves from root; only the build needs the repo prefix.
  base: command === 'serve' ? '/' : (process.env.VITE_BASE ?? REPOSITORY_BASE),
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    cssCodeSplit: false,
    assetsInlineLimit: 2048,
  },
}))
