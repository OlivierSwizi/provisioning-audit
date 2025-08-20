import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";

// https://vitejs.dev/config/
export default defineConfig({
  envPrefix: "REACT_APP_",
  build: {
    outDir: "build",
    sourcemap: true,
  },
  server: {
    port: 3005,
    strictPort: true,
    proxy: {
      // Proxy l'API du back
      "/api": {
        target: "http://localhost:4001",
        changeOrigin: true,
        cookieDomainRewrite: "localhost",
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern",
      },
    },
  },
  plugins: [
    react(),
    checker({
      enableBuild: false,
      terminal: false,
      overlay: {
        initialIsOpen: false,
      },
      eslint: {
        useFlatConfig: true,
        // for example, lint .ts and .tsx
        lintCommand: 'eslint "./src/**/*.{js,jsx}"',
      },
    }),
  ],
});
