// Dev server local — serve public/ e roteia POST /api/generate pro handler TS (via tsx).
// Uso: npm run dev  (porta 3040 por padrão). Carrega .env se existir.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { tsImport } from "tsx/esm/api";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || "3040", 10);
const PUBLIC_DIR = path.join(__dirname, "public");

const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
  console.log("[dev-server] .env carregado");
}

async function loadHandler(rel) {
  try {
    const mod = await tsImport(path.join(__dirname, rel), import.meta.url);
    const h = typeof mod.default === "function" ? mod.default
      : typeof mod.default?.default === "function" ? mod.default.default : null;
    if (!h) throw new Error("sem default export");
    console.log(`[dev-server] ✓ ${rel}`);
    return h;
  } catch (err) {
    console.error(`[dev-server] ✗ ${rel}:`, err.message);
    return null;
  }
}
const generateHandler = await loadHandler("api/generate.ts");

function makeRes(res) {
  const w = {
    _status: 200,
    status(c) { w._status = c; return w; },
    setHeader(k, v) { res.setHeader(k, v); return w; },
    json(o) { if (!res.headersSent) res.writeHead(w._status, { "Content-Type": "application/json" }); res.end(JSON.stringify(o)); },
    send(d) { if (!res.headersSent) res.writeHead(w._status); res.end(typeof d === "string" ? d : JSON.stringify(d)); },
    end(d) { if (!res.headersSent) res.writeHead(w._status); res.end(d); },
  };
  return w;
}

const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon" };

function serveStatic(req, res) {
  let p = req.url.split("?")[0];
  if (p === "/") p = "/index.html";
  const fp = path.join(PUBLIC_DIR, p);
  if (!fp.startsWith(PUBLIC_DIR) || !fs.existsSync(fp) || !fs.statSync(fp).isFile()) {
    res.writeHead(404, { "Content-Type": "text/plain" }); res.end("404 " + p); return;
  }
  res.writeHead(200, { "Content-Type": MIME[path.extname(fp).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" });
  res.end(fs.readFileSync(fp));
}

http.createServer((req, res) => {
  const url = req.url || "/";
  if (url.startsWith("/api/generate")) {
    if (!generateHandler) { res.writeHead(500, { "Content-Type": "application/json" }); res.end('{"error":"handler não carregado"}'); return; }
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", async () => {
      let body;
      try { body = raw ? JSON.parse(raw) : {}; } catch { res.writeHead(400); res.end('{"error":"JSON inválido"}'); return; }
      try { await generateHandler({ ...req, body, headers: req.headers, method: req.method, url: req.url, query: {}, cookies: {} }, makeRes(res)); }
      catch (e) { console.error("[dev-server] handler:", e); if (!res.headersSent) { res.writeHead(500); res.end(JSON.stringify({ error: String(e?.message || e) })); } }
    });
    return;
  }
  if (req.method === "GET") return serveStatic(req, res);
  res.writeHead(405); res.end();
}).listen(PORT, () => {
  console.log(`\n  🎬 INEMA · UGC Seedance 2.5 — dev server`);
  console.log(`  Local:  http://localhost:${PORT}`);
  console.log(`  API:    POST /api/generate  (modo IA; precisa de ANTHROPIC_API_KEY no .env)`);
  console.log(`  Modo Template funciona sem chave.\n`);
});
