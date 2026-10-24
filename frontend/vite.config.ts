import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8081,
    strictPort: false,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2020",
    // Increase chunk size warning limit (lucide-react is large by nature)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // 1. Core React runtime
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/") || id.includes("node_modules/react-router-dom/")) {
            return "vendor";
          }
          // 2. Heavy admin-only vendor libraries (never loaded by storefront visitors)
          if (id.includes("node_modules/recharts/") || id.includes("node_modules/victory-vendor/")) {
            return "recharts-vendor";
          }
          if (id.includes("node_modules/xlsx/")) {
            return "xlsx-vendor";
          }
          if (id.includes("node_modules/papaparse/")) {
            return "papaparse-vendor";
          }

          // 3. Lucide icons
          if (id.includes("node_modules/lucide-react/")) {
            return "icons";
          }

          // 4. TanStack Query & Supabase
          if (id.includes("node_modules/@tanstack/")) {
            return "query";
          }
          if (id.includes("node_modules/@supabase/")) {
            return "supabase";
          }

          // 5. Shared UI library vendors (Radix, Sonner, CMDK)
          if (id.includes("node_modules/@radix-ui/") || id.includes("node_modules/sonner/") || id.includes("node_modules/cmdk/")) {
            return "ui-vendor";
          }

          // 6. Shared application UI & Contexts
          if (id.includes("src/components/ui/")) {
            return "ui-components";
          }
          if (id.includes("src/contexts/")) {
            return "app-contexts";
          }
        },
      },
    },
  },
}));

