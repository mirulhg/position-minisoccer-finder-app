import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Baca langsung dari package.json di file konfigurasi ini saja (build-time,
// lewat node:fs) — BUKAN di-import di kode aplikasi React, supaya field lain
// di package.json (daftar dependency, dst) tidak ikut ke dalam bundle.
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as { version: string }

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
})
