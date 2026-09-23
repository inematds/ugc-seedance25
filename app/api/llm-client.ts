// Cliente LLM unificado (copiado de seedance2/app/api/llm-client-local.ts) com 3 backends
//   1. Claude OAuth    — reads from ~/.claude/.credentials.json (Max/Pro subscription)
//   2. Anthropic API   — direct sk-ant-... key
//   3. OpenRouter      — sk-or-... key, routes to any model
//
// The frontend sends the user's preference in the request body as:
//   { llm: { provider: 'oauth' | 'anthropic-api' | 'openrouter', apiKey?, model? } }
//
// If not provided, falls back to Claude OAuth (the local default).
//
// Tool format: this client uses Anthropic-native format as the canonical
// interface. For OpenRouter (which uses OpenAI format), it converts the
// request on the way out and the response on the way back — so upstream
// code always works with { content: [{type: "tool_use", input: {...}}] }.

import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type LLMAuth =
  | { type: "anthropic-oauth" }
  | { type: "anthropic-api"; apiKey: string }
  | { type: "openrouter"; apiKey: string };

export interface LLMConfig {
  auth: LLMAuth;
  model: string; // canonical short name, e.g. "claude-sonnet-4-5"
}

// Canonical model name → provider-specific model string
// Add more models as needed.
const MODEL_MAP: Record<string, { anthropic: string; openrouter: string }> = {
  "claude-sonnet-5": {
    anthropic: "claude-sonnet-5",
    openrouter: "anthropic/claude-sonnet-5",
  },
  "claude-opus-5-5": {
    anthropic: "claude-opus-5-5",
    openrouter: "anthropic/claude-opus-5.5",
  },
  "claude-opus-5": {
    anthropic: "claude-opus-5",
    openrouter: "anthropic/claude-opus-5",
  },
  "claude-sonnet-4-5": {
    anthropic: "claude-sonnet-4-5",
    openrouter: "anthropic/claude-sonnet-4.5",
  },
  "claude-sonnet-4-6": {
    anthropic: "claude-sonnet-4-6",
    openrouter: "anthropic/claude-sonnet-4.6",
  },
  "claude-opus-4-6": {
    anthropic: "claude-opus-4-6",
    openrouter: "anthropic/claude-opus-4.6",
  },
};

function resolveModel(canonical: string, provider: "anthropic" | "openrouter"): string {
  const entry = MODEL_MAP[canonical];
  if (entry) return entry[provider];
  // Unknown model — pass through verbatim (user knows what they're doing)
  return canonical;
}

// ─────────────────────────────────────────────────────────────
// OAuth credentials loader
// ─────────────────────────────────────────────────────────────

interface ClaudeOAuthCredentials {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scopes: string[];
}

const CREDENTIALS_PATH = path.join(os.homedir(), ".claude", ".credentials.json");

function loadOAuthCredentials(): ClaudeOAuthCredentials | null {
  try {
    if (!fs.existsSync(CREDENTIALS_PATH)) return null;
    const raw = fs.readFileSync(CREDENTIALS_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    const oauth = parsed?.claudeAiOauth;
    if (!oauth?.accessToken) return null;
    return oauth as ClaudeOAuthCredentials;
  } catch {
    return null;
  }
}

function isTokenValid(creds: ClaudeOAuthCredentials): boolean {
  return creds.expiresAt > Date.now() + 60_000;
}

// ─────────────────────────────────────────────────────────────
// Anthropic native format (direct API or OAuth)
// ─────────────────────────────────────────────────────────────

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";

async function callAnthropicDirect(
  token: string,
  isOauth: boolean,
  body: any
): Promise<any> {
  const headers: Record<string, string> = {
    "anthropic-version": "2023-06-01",
    "content-type": "application/json",
  };
  if (isOauth) {
    headers["Authorization"] = `Bearer ${token}`;
    headers["anthropic-beta"] = "oauth-2025-04-20";
  } else {
    headers["x-api-key"] = token;
  }

  const response = await fetch(ANTHROPIC_API, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = { error: { type: "parse_error", message: text.slice(0, 500) } };
  }

  if (!response.ok) {
    const msg =
      parsed?.error?.message ||
      JSON.stringify(parsed?.error || parsed).slice(0, 300);
    const err = new Error(`Anthropic ${response.status}: ${msg}`);
    (err as any).status = response.status;
    (err as any).body = parsed;
    throw err;
  }

  return parsed;
}

// ─────────────────────────────────────────────────────────────
// OpenRouter (OpenAI-compatible format)
// ─────────────────────────────────────────────────────────────

const OPENROUTER_API = "https://openrouter.ai/api/v1/chat/completions";

async function callOpenRouter(
  apiKey: string,
  model: string,
  body: any
): Promise<any> {
  // --- Convert Anthropic body → OpenAI body ---

  // 1. System prompt: Anthropic can be string or array of {text}; OpenAI needs one system message
  const messages: any[] = [];
  if (body.system) {
    let systemText: string;
    if (Array.isArray(body.system)) {
      systemText = body.system
        .map((s: any) => (typeof s === "string" ? s : s.text || ""))
        .filter(Boolean)
        .join("\n\n");
    } else {
      systemText = String(body.system);
    }
    if (systemText) {
      messages.push({ role: "system", content: systemText });
    }
  }

  // 2. User/assistant messages
  // Content may be a string OR an array of blocks (multimodal: text + image).
  // Anthropic format: [{type: "image", source: {type: "base64", media_type, data}}, {type: "text", text}]
  // OpenAI format:    [{type: "image_url", image_url: {url: "data:MEDIA;base64,DATA"}}, {type: "text", text}]
  for (const msg of body.messages || []) {
    if (Array.isArray(msg.content)) {
      const converted = msg.content.map((block: any) => {
        if (block.type === "image" && block.source?.type === "base64") {
          const dataUrl = `data:${block.source.media_type};base64,${block.source.data}`;
          return { type: "image_url", image_url: { url: dataUrl } };
        }
        if (block.type === "text") {
          return { type: "text", text: block.text };
        }
        // Pass-through for other block types
        return block;
      });
      messages.push({ role: msg.role, content: converted });
    } else {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  // 3. Tools: Anthropic {name, description, input_schema} → OpenAI {type, function: {name, description, parameters}}
  const tools = (body.tools || []).map((tool: any) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.input_schema,
    },
  }));

  // 4. tool_choice: Anthropic {type: "tool", name: X} → OpenAI {type: "function", function: {name: X}}
  let toolChoice: any = "auto";
  if (body.tool_choice?.type === "tool" && body.tool_choice.name) {
    toolChoice = {
      type: "function",
      function: { name: body.tool_choice.name },
    };
  }

  const openAiBody: any = {
    model,
    messages,
    max_tokens: body.max_tokens || 4096,
    temperature: body.temperature ?? 0.7,
  };
  if (tools.length > 0) {
    openAiBody.tools = tools;
    openAiBody.tool_choice = toolChoice;
  }

  const response = await fetch(OPENROUTER_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://inema.club",
      "X-Title": "INEMA Prompt Engine",
    },
    body: JSON.stringify(openAiBody),
  });

  const text = await response.text();
  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = { error: { message: text.slice(0, 500) } };
  }

  if (!response.ok) {
    const msg =
      parsed?.error?.message ||
      JSON.stringify(parsed?.error || parsed).slice(0, 300);
    const err = new Error(`OpenRouter ${response.status}: ${msg}`);
    (err as any).status = response.status;
    (err as any).body = parsed;
    throw err;
  }

  // --- Convert OpenAI response → Anthropic-like shape ---
  // OpenAI: { choices: [{ message: { content, tool_calls: [{ id, type, function: { name, arguments } }] } }] }
  // We want: { content: [{ type: "tool_use", id, name, input }] }
  const message = parsed.choices?.[0]?.message;
  if (!message) {
    throw new Error("OpenRouter: no message in response");
  }

  const content: any[] = [];

  if (message.content && typeof message.content === "string" && message.content.trim()) {
    content.push({ type: "text", text: message.content });
  }

  for (const tc of message.tool_calls || []) {
    let input: any = {};
    try {
      input = JSON.parse(tc.function?.arguments || "{}");
    } catch (err) {
      console.warn("[openrouter] failed to parse tool arguments:", err);
    }
    content.push({
      type: "tool_use",
      id: tc.id,
      name: tc.function?.name,
      input,
    });
  }

  return {
    content,
    usage: {
      input_tokens: parsed.usage?.prompt_tokens,
      output_tokens: parsed.usage?.completion_tokens,
      cache_read_input_tokens: 0,
    },
    model: parsed.model || model,
    _provider: "openrouter",
  };
}

// ─────────────────────────────────────────────────────────────
// Main entry
// ─────────────────────────────────────────────────────────────

/**
 * Call the configured LLM with an Anthropic-format request body.
 * Returns Anthropic-format response shape (content array with tool_use blocks).
 *
 * The request body's `model` field is ignored — we resolve it from config.model
 * using MODEL_MAP based on the target provider.
 */
export async function callLLM(config: LLMConfig, body: any): Promise<any> {
  if (config.auth.type === "anthropic-oauth") {
    const creds = loadOAuthCredentials();
    if (!creds) {
      throw new Error(
        "Sem credenciais OAuth em ~/.claude/.credentials.json. Rode `claude login` na máquina do servidor ou use OpenRouter em \"Backend da IA\"."
      );
    }
    if (!isTokenValid(creds)) {
      throw new Error(
        "Token OAuth expirado. Rode `claude login` ou use OpenRouter em \"Backend da IA\"."
      );
    }
    if (!creds.scopes.includes("user:inference")) {
      throw new Error("Your Claude OAuth token lacks the user:inference scope.");
    }

    const adjustedBody = {
      ...body,
      model: resolveModel(config.model, "anthropic"),
    };
    const result = await callAnthropicDirect(creds.accessToken, true, adjustedBody);
    return { ...result, _provider: "oauth" };
  }

  if (config.auth.type === "anthropic-api") {
    if (!config.auth.apiKey) {
      throw new Error("Sem chave da Anthropic. Informe em \"Backend da IA\" ou defina ANTHROPIC_API_KEY no servidor.");
    }
    const adjustedBody = {
      ...body,
      model: resolveModel(config.model, "anthropic"),
    };
    const result = await callAnthropicDirect(config.auth.apiKey, false, adjustedBody);
    return { ...result, _provider: "anthropic-api" };
  }

  if (config.auth.type === "openrouter") {
    if (!config.auth.apiKey) {
      throw new Error("Sem chave do OpenRouter. Informe em \"Backend da IA\" ou defina OPENROUTER_API_KEY no servidor.");
    }
    const openRouterModel = resolveModel(config.model, "openrouter");
    return callOpenRouter(config.auth.apiKey, openRouterModel, body);
  }

  throw new Error(`Unknown LLM auth type: ${(config.auth as any).type}`);
}

// ─────────────────────────────────────────────────────────────
// Parse LLM config from request body
// ─────────────────────────────────────────────────────────────

/**
 * Parse LLM config from a request body. Falls back to local OAuth default
 * when no config is provided or when provider is "oauth" / "default".
 */
export function parseLLMConfig(requestLlm: any): LLMConfig {
  const defaultModel = process.env.LLM_MODEL || "claude-sonnet-5";

  if (!requestLlm || typeof requestLlm !== "object") {
    return { auth: { type: "anthropic-oauth" }, model: defaultModel };
  }

  const provider = String(requestLlm.provider || "oauth").toLowerCase();
  const model = String(requestLlm.model || defaultModel);

  if (provider === "oauth" || provider === "default") {
    return { auth: { type: "anthropic-oauth" }, model };
  }

  if (provider === "anthropic-api" || provider === "anthropic") {
    return {
      auth: { type: "anthropic-api", apiKey: String(requestLlm.apiKey || process.env.ANTHROPIC_API_KEY || "") },
      model,
    };
  }

  if (provider === "openrouter") {
    return {
      auth: { type: "openrouter", apiKey: String(requestLlm.apiKey || process.env.OPENROUTER_API_KEY || "") },
      model,
    };
  }

  // Unknown provider — fall back
  return { auth: { type: "anthropic-oauth" }, model: defaultModel };
}

/**
 * Given an LLMConfig, returns the system prompt blocks to use.
 * OAuth requires prefixing with Claude Code identity (due to
 * user:sessions:claude_code scope requirement). Direct API and
 * OpenRouter don't need that prefix.
 */
export function buildSystemBlocks(
  config: LLMConfig,
  inemaSystemPrompt: string
): Array<{ type: string; text: string; cache_control?: { type: string } }> {
  const inemaBlock = {
    type: "text",
    text: inemaSystemPrompt,
    cache_control: { type: "ephemeral" },
  };

  if (config.auth.type === "anthropic-oauth") {
    return [
      {
        type: "text",
        text: "You are Claude Code, Anthropic's official CLI for Claude.",
      },
      inemaBlock,
    ];
  }

  return [inemaBlock];
}
