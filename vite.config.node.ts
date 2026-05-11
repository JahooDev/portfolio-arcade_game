// Node.js SSR build config for self-hosted VPS deployment (Docker).
//
// This config is INDEPENDENT from vite.config.ts (which is Cloudflare-targeted
// and used by the Lovable in-editor preview / publish flow).
//
// Build:  npm run build:node      -> outputs to dist-node/
// Run:    npm run start:node      -> launches src/server.node.ts on $PORT (default 3000)
//
// Do not import @cloudflare/vite-plugin or @lovable.dev/vite-tanstack-config here.
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart({
      // Use our Node http bootstrap instead of the default Worker-style entry.
      server: { entry: "server.node" },
    }),
    viteReact(),
  ],
  build: {
    outDir: "dist-node",
    emptyOutDir: true,
  },
  resolve: {
    dedupe: ["react", "react-dom", "@tanstack/react-router"],
  },
});
