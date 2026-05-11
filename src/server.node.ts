// Node.js SSR entrypoint for self-hosted (VPS / Docker) deployment.
//
// This file is the build target referenced by vite.config.node.ts
// (tanstackStart({ server: { entry: "server.node" } })). It is NOT used by
// the Cloudflare/Lovable-preview build, which still uses src/server.ts.
//
// At build time, Vite bundles this file together with the TanStack Start
// SSR handler. At runtime (`node dist-node/server/server.node.js`) it spins
// up a plain Node http server on $PORT (default 3000) and adapts Node's
// IncomingMessage <-> Web Request/Response.
//
// Requires Node.js >= 20 (global Request, Response, ReadableStream, fetch).
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { Readable } from "node:stream";

import "./lib/error-capture";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request) => Promise<Response> | Response;
};

// Lazy-load so a module-init failure in the bundled handler is catchable.
let serverEntryPromise: Promise<ServerEntry> | undefined;
async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

// Mirrors the catastrophic-500 normalizer used by the Cloudflare entry.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;
  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }
  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

function nodeRequestToWebRequest(req: IncomingMessage): Request {
  const host = req.headers.host ?? "localhost";
  // x-forwarded-proto honored so reverse proxies (Caddy / Nginx) report https correctly.
  const proto =
    (req.headers["x-forwarded-proto"] as string | undefined)?.split(",")[0]?.trim() ??
    ((req.socket as { encrypted?: boolean }).encrypted ? "https" : "http");
  const url = `${proto}://${host}${req.url ?? "/"}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) headers.append(key, v);
    } else {
      headers.set(key, value);
    }
  }

  const method = req.method ?? "GET";
  const init: RequestInit & { duplex?: "half" } = { method, headers };
  if (method !== "GET" && method !== "HEAD") {
    init.body = Readable.toWeb(req) as unknown as BodyInit;
    init.duplex = "half";
  }
  return new Request(url, init);
}

async function writeWebResponseToNode(webRes: Response, nodeRes: ServerResponse) {
  nodeRes.statusCode = webRes.status;
  webRes.headers.forEach((value, key) => {
    nodeRes.setHeader(key, value);
  });
  if (!webRes.body) {
    nodeRes.end();
    return;
  }
  const nodeStream = Readable.fromWeb(webRes.body as unknown as Parameters<typeof Readable.fromWeb>[0]);
  nodeStream.pipe(nodeRes);
  nodeStream.on("error", (err) => {
    console.error(err);
    if (!nodeRes.headersSent) {
      nodeRes.statusCode = 500;
      nodeRes.end("Internal Server Error");
    } else {
      nodeRes.destroy(err);
    }
  });
}

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

const server = createServer(async (req, res) => {
  try {
    const handler = await getServerEntry();
    const webRequest = nodeRequestToWebRequest(req);
    const rawResponse = await handler.fetch(webRequest);
    const finalResponse = await normalizeCatastrophicSsrResponse(rawResponse);
    await writeWebResponseToNode(finalResponse, res);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("content-type", "text/html; charset=utf-8");
      res.end(renderErrorPage());
    } else {
      res.destroy();
    }
  }
});

server.listen(port, host, () => {
  console.log(`[node-ssr] listening on http://${host}:${port}`);
});

const shutdown = (signal: string) => {
  console.log(`[node-ssr] received ${signal}, shutting down`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

export default server;
