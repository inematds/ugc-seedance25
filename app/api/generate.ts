// POST /api/generate — modo IA do gerador de brief UGC.
// Entrada: brief (produto, cliente, formato, creator, idioma). Saída: JSON com os 3 prompts.
// Claude escreve product_prompt, creator_prompt e as 5 falas; o front monta o STEP 3 com formats.js.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { callLLM, parseLLMConfig, buildSystemBlocks } from "./llm-client.js";
// @ts-ignore — módulo JS compartilhado com o front
import { FORMATS, BEATS, RULES, WORDS_MIN, WORDS_MAX, countWords } from "../public/formats.js";

type Format = {
  id: string; kind: string; title: string; bestFor: string; demoVerb: string; light: string; tip: string;
  beats: string[]; example: { product_prompt: string; creator_prompt: string; lines: string[] };
};

const FMT = FORMATS as Format[];
const BEATS_TXT = (BEATS as any[]).map((b) => b.t + " " + b.label + ": " + b.pt).join("\n");
const RULES_TXT = (RULES as any[]).map((r) => r.n + ". " + r.title + " — " + r.body).join("\n");
const CATALOG_TXT = FMT.map((f) => "[" + f.id + "] " + f.title + " (" + f.kind + ") — best for: " + f.bestFor + " Demo: " + f.demoVerb + ". Beat actions: " + f.beats.join(" / ") + ". Tip: " + f.tip).join("\n\n");
const EXAMPLES_TXT = FMT.slice(0, 7).map((f) => "[" + f.id + "] " + f.example.lines.map((l, i) => (BEATS as any[])[i].t + " '" + l + "'").join(" | ")).join("\n");

const SYSTEM_PROMPT = `You are the INEMA UGC Ad Writer. You turn a short product brief into the three generation prompts of the "Seedance 2.5 UGC Ads" recipe: (1) a clean e-commerce product photo prompt, (2) an unretouched iPhone front-camera creator portrait prompt (or a first-person POV scene anchor for hands-only formats), and (3) the five spoken lines of a 30-second one-take selfie ad.

You do not chat. You do not explain. You emit exactly one tool call.

THE FIVE-BEAT SKELETON (30 seconds)
${BEATS_TXT}
Total spoken words across the five lines: ${WORDS_MIN}–${WORDS_MAX}. More than that and the delivery rushes. Fewer than 60 and the ad feels empty. Before emitting, count the words of the five lines together; if under ${WORDS_MIN}, lengthen the WHAT IT IS and RESULT lines with one concrete detail each (never the HOOK or the CLOSE). Portuguese and Spanish need as many words as English, not fewer.

HOW THE LINES MUST SOUND
- The hook is the middle of a story, never the start of an ad. No "Hey guys", no "Introducing".
- Write like a friend talking to a friend: contractions, small pauses ("..."), one self-deprecating or surprised beat somewhere.
- Name the product once, in the WHAT IT IS beat. Say the brand at most twice in the whole script.
- The RESULT is stated like a fact to a friend, not a claim. No medical or absolute promises.
- The CLOSE is low-pressure: "just try it", "that's all I'm saying". Never "buy now", never "link in bio", never a discount code.
- Consumables: keep the eat/sip/apply beat. Gadgets: one moment where the creator laughs at themselves. Food/drink: skeptic-converted arc, attack the category first. Apparel: one beat where the material touches the lens. Unboxing: the sealed box is the hook.
- Language: write the lines in the language requested (pt = natural spoken Brazilian Portuguese, colloquial, no formal register; en = American English; es = Latin American Spanish). Everything else (product_prompt, creator_prompt) stays in English.

PRODUCT PROMPT RULES
"Clean e-commerce product photograph of <product with its physical details>, <label: brand + at most two short lines in quotes>, on <a surface that fits the product>, <natural light>, photoreal, no watermark." Label text must be short: a paragraph turns to gibberish. If the user attached a real photo, start with "Using the attached product photo as the exact reference, recreate this product faithfully — identical shape, colors, label text and logo — as a clean e-commerce product photograph..." and for a store screenshot add "ignore any website interface, buttons or text around it".

CREATOR PROMPT RULES
"Unretouched casual iPhone front-camera style portrait of <person: age, hair, skin detail, outfit>, <in the exact room where the ad happens, with one or two props>, <light>, real skin texture, authentic amateur selfie framing, <expression>, no makeup/minimal makeup, no beauty filter, no retouching." The room, outfit and light must match the video setting. For POV formats (hands only) write instead a first-person POV scene anchor: "First-person POV photo looking down at <surface>, a person's hands resting at the edge, <one or two props>, bright window daylight, authentic iPhone photo, photoreal."

Also return: 'person' (a 3–6 word noun phrase for the video prompt, e.g. "woman", "man in the charcoal hoodie"), 'setting' (a short present-tense clause, e.g. "stands in her bright bathroom", "sits at his home desk"), 'gender' ("female" | "male"), and 'beat_actions' (five short present-tense stage directions, one per beat, specific to THIS product — what the hands/body do, e.g. "cracks the can open on camera, takes a real slow sip").

SEVEN RULES YOU ENFORCE
${RULES_TXT}

FORMAT CATALOG (pick the one the user chose; if "auto", choose the best fit and say why in format_reason)
${CATALOG_TXT}

REFERENCE EXAMPLES OF TONE (English originals from the pack — match the register, never copy)
${EXAMPLES_TXT}`;

const TOOL = {
  name: "emit_ugc_brief",
  description: "Emit the three-step UGC brief.",
  input_schema: {
    type: "object" as const,
    properties: {
      format_id: { type: "string", description: "One of 01..09" },
      format_reason: { type: "string", description: "One sentence, only when format was auto-chosen; else empty" },
      product_prompt: { type: "string" },
      creator_prompt: { type: "string" },
      person: { type: "string" },
      setting: { type: "string" },
      gender: { type: "string", enum: ["female", "male"] },
      beat_actions: { type: "array", items: { type: "string" }, minItems: 5, maxItems: 5 },
      lines: { type: "array", items: { type: "string" }, minItems: 5, maxItems: 5, description: "The five spoken lines, one per beat, in the requested language" },
      hook_alternatives: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 3, description: "Two or three alternative hook lines for variants" },
      notes_pt: { type: "string", description: "Two or three short sentences in Portuguese: why these choices, what to watch in QA" },
    },
    required: ["format_id", "product_prompt", "creator_prompt", "person", "setting", "gender", "beat_actions", "lines", "hook_alternatives", "notes_pt"],
  },
} as const;

// ---------- rate limit ----------
const buckets = new Map<string, { n: number; reset: number }>();
function limited(ip: string) {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || b.reset < now) { buckets.set(ip, { n: 1, reset: now + 60_000 }); return false; }
  if (b.n >= 5) return true;
  b.n++; return false;
}

function cors(res: VercelResponse, origin?: string) {
  const allowed = process.env.ALLOWED_ORIGIN || "*";
  res.setHeader("Access-Control-Allow-Origin", allowed === "*" ? "*" : origin === allowed ? origin : allowed);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");
}

export type Brief = {
  brand?: string; product: string; customer?: string; format?: string; creator?: string;
  lang?: "pt" | "en" | "es"; byo?: "none" | "photo" | "screenshot"; extra?: string;
};

export function validate(body: any): { ok: true; brief: Brief } | { ok: false; error: string } {
  const b = body || {};
  const product = String(b.product || "").trim();
  if (!product) return { ok: false, error: "Campo obrigatório: product (o que é o produto)" };
  const total = ["brand", "product", "customer", "creator", "extra"].map((k) => String(b[k] || "")).join("").length;
  if (total > 4000) return { ok: false, error: "Brief longo demais (máx. 4000 caracteres)" };
  const format = String(b.format || "auto");
  if (format !== "auto" && !FORMATS.some((f: any) => f.id === format)) return { ok: false, error: "format inválido (01..09 ou auto)" };
  const lang = ["pt", "en", "es"].includes(b.lang) ? b.lang : "pt";
  const byo = ["none", "photo", "screenshot"].includes(b.byo) ? b.byo : "none";
  return { ok: true, brief: { brand: String(b.brand || "").trim(), product, customer: String(b.customer || "").trim(), format, creator: String(b.creator || "").trim(), lang, byo, extra: String(b.extra || "").trim() } };
}

export function userMessage(b: Brief) {
  return [
    `Brand: ${b.brand || "(none — fictional or unbranded)"}`,
    `Product (one line): ${b.product}`,
    `Customer: ${b.customer || "(infer from product)"}`,
    `Format: ${b.format === "auto" ? "auto — choose the best fit" : b.format}`,
    `Creator: ${b.creator || "(choose a creator that matches the customer; describe age, look, outfit, room)"}`,
    `Lines language: ${b.lang}`,
    `Product source: ${b.byo === "photo" ? "user attached a real product photo (re-shoot it faithfully)" : b.byo === "screenshot" ? "user attached a store-listing screenshot (re-shoot, ignore the interface)" : "generate from scratch"}`,
    b.extra ? `Extra notes: ${b.extra}` : "",
  ].filter(Boolean).join("\n");
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  cors(res, req.headers.origin as string | undefined);
  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const ip = ((req.headers["x-forwarded-for"] as string) || "").split(",")[0]?.trim() || "unknown";
  if (limited(ip)) { res.status(429).json({ error: "Limite: 5 pedidos por minuto por IP" }); return; }

  let body: any;
  try { body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {}; }
  catch { res.status(400).json({ error: "JSON inválido" }); return; }

  const v = validate(body);
  if (!v.ok) { res.status(400).json({ error: v.error }); return; }

  // Backend: OAuth do Claude Code (padrão, local) ou OpenRouter (chave do usuário ou OPENROUTER_API_KEY).
  const llm = parseLLMConfig(body.llm);
  try {
    const msg = await callLLM(llm, {
      max_tokens: 2048,
      system: buildSystemBlocks(llm, SYSTEM_PROMPT),
      tools: [TOOL],
      tool_choice: { type: "tool", name: TOOL.name },
      messages: [{ role: "user", content: userMessage(v.brief) }],
    });
    const tu = (msg.content || []).find((b: any) => b.type === "tool_use");
    if (!tu) throw new Error("modelo não devolveu tool_use");
    const out = tu.input as any;
    const words = countWords(out.lines || []);
    const u: any = msg.usage || {};
    console.log(`[generate] ip=${ip.slice(0, 12)} provider=${msg._provider} model=${msg.model} format=${out.format_id} words=${words} in=${u.input_tokens} out=${u.output_tokens} cache=${u.cache_read_input_tokens ?? 0}`);
    res.status(200).json({ ...out, words, words_ok: words >= WORDS_MIN - 15 && words <= WORDS_MAX + 5, model: `${msg._provider}:${msg.model || llm.model}` });
  } catch (err) {
    const m = err instanceof Error ? err.message : String(err);
    console.error("[generate] erro:", m);
    res.status(502).json({ error: `Geração falhou: ${m}` });
  }
}
