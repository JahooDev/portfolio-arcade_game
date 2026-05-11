# Self-hosted Node.js deployment

This project ships **two parallel build targets** that share the same source:

| Target | Config | Output | Used by |
| --- | --- | --- | --- |
| Cloudflare Workers | `vite.config.ts` + `wrangler.jsonc` | `dist/` | Lovable in-editor preview & one-click publish |
| Node.js SSR | `vite.config.node.ts` | `dist-node/` | Self-hosted VPS / Docker / Caddy / Nginx |

The Cloudflare path is left untouched so the Lovable preview keeps working.

## Build & run locally (Node)

```bash
npm install
npm run build:node
npm run start:node      # listens on http://0.0.0.0:3000
```

Override the port: `PORT=4173 npm run start:node`.

## Docker

```bash
docker build -t my-arcade .
docker run --rm -p 3000:3000 my-arcade
```

The image is multi-stage (deps → build → runtime) and only ships
`dist-node/` plus production `node_modules` in the final layer.

## Reverse proxy (Caddy example)

```caddy
arcade.example.com {
  reverse_proxy localhost:3000
}
```

Nginx/Apache work the same way — proxy to `localhost:3000`. Make sure the
proxy forwards `Host` and sets `X-Forwarded-Proto` so the SSR handler
generates correct absolute URLs.

## Requirements

- Node.js **>= 20** (uses global `Request` / `Response` / `ReadableStream`).

## Files added for the Node target

- `vite.config.node.ts` — Vite/TanStack Start build without the Cloudflare plugin.
- `src/server.node.ts` — plain Node `http` server that adapts Node ↔ Web fetch.
- `Dockerfile`, `.dockerignore`.
- `npm run build:node`, `npm run start:node`.

Editing UI / route / component files affects **both** targets — only the
server bootstrap and build pipeline differ.
