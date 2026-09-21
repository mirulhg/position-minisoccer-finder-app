/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
}

/** Konstanta build-time dari `define` di vite.config.ts — field "version" package.json, apa adanya. */
declare const __APP_VERSION__: string;
