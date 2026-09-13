# INEMA · UGC Seedance 2.5

Anúncios UGC (creator falando pro celular, one-take de 30 s, 9:16, 1080p) com Seedance 2.5, a
partir do pack "The Seedance 2.5 UGC Ads Pack" (Zubair Trabzada · AI Workshop, 2026), adaptado
pro ecossistema INEMA (Magnific MCP como alvo principal; Higgsfield e fal.ai como secundários).

## 📖 Guia de uso

Guia completo (landing + passo a passo): **https://inematds.github.io/ugc-seedance25/guia/**
App online (modo Template): https://inematds.github.io/ugc-seedance25/app/public/

Duas entregas que compartilham o mesmo conteúdo:

```
ugc-seedance25/
├── index.html                redireciona pro app (GitHub Pages)
├── PLANO.md                  desenho da solução, mapeamento pro Magnific, riscos
├── docs/                     pack original: PDF, transcrição do vídeo (.md), texto extraído (.txt)
├── skill/ugc-seedance25/     skill Claude Code  →  symlink em ~/.claude/skills/ugc-seedance25
│   ├── SKILL.md              brief → 3 prompts → brief.md → (opcional) Magnific com gate de custo → QA
│   └── references/           regras.md · formatos.md · ptbr.md · magnific.md
└── app/                      gerador de brief (web) — padrão seedance2/app
    ├── public/index.html     single-page, INEMA dark âmbar, vanilla JS
    ├── public/formats.js     fonte única: 9 formatos, beats, blocos fixos, alvos, regras
    ├── api/generate.ts       função serverless — modo IA (tool use forçado)
    ├── api/llm-client.ts     cliente unificado: Claude OAuth (padrão) · OpenRouter · Anthropic API
    └── dev-server.mjs        roda local sem Vercel CLI
```

## A receita (do pack)

1. **Produto**: foto e-commerce limpa, rótulo curto. Vira a identidade do produto.
2. **Creator**: retrato "iPhone câmera frontal, sem retoque", no cômodo exato do vídeo.
3. **Vídeo**: Seedance 2.5, 9:16, 1080p, 30 s, áudio nativo, as duas imagens como referência.
   Prompt = shot list de 5 beats (hook · o que é · demo · resultado · fecho), cada fala entre
   aspas com timestamp, bloco de realismo, bloco de áudio com sons proibidos. 70–80 palavras.

## Skill

Instalada por symlink. Gatilhos: "anúncio ugc", "ugc ad", "seedance ugc", ou `/ugc-seedance25`.

- Sempre gera `~/projetos/output/ugc-seedance25/<slug>/brief.md` com os 3 prompts.
- Só executa na Magnific se você pedir: `simulate_cost` → produto → creator → rascunho 720p →
  QA em frames (contact sheet, checagem de espelho) → final 1080p.
- Falas em PT-BR por padrão; fallback de voz via inemavox → referência de áudio.

## App

```bash
cd app
npm install
npm run check        # tsc + syntax do formats.js
npm run dev          # http://localhost:3040
```

- **Modo Template**: roda 100% no navegador, sem servidor e sem chave. Você escreve as falas; o
  app monta os 3 prompts com os cabeçalhos da plataforma escolhida, conta palavras, copia e
  baixa o `.md`. É o que o GitHub Pages serve.
- **Modo IA** (`POST /api/generate`): o modelo escreve produto, creator, ações de beat e as 5
  falas no idioma escolhido. Backend, em ordem:
  1. **Claude OAuth do Claude Code** (padrão): lê `~/.claude/.credentials.json` da máquina onde
     o servidor roda. Custo zero na assinatura. Basta `claude login` e `npm run dev`.
  2. **OpenRouter** (opcional): o usuário escolhe em "Backend da IA" e cola a chave (fica só no
     navegador), ou o servidor define `OPENROUTER_API_KEY`. É o caminho pra um deploy público.
  3. Anthropic API (`ANTHROPIC_API_KEY`) continua suportada no cliente, mas não aparece na UI.
- Modelo padrão `claude-sonnet-5` (`LLM_MODEL` ou campo "Modelo" no app). Rate limit 5/min/IP.

Deploy serverless (opcional, pra modo IA público): commit + push; no Vercel, Root Directory =
`app`, sem build command, output `public`, env `OPENROUTER_API_KEY` e `ALLOWED_ORIGIN`.

## Estado da verificação (2026-09-13)

- `npm run check` passa. Dev-server sobe; página, `formats.js` e validações da API respondem.
- Modo Template verificado em Chromium headless (exemplo, montagem, troca de alvo, contador).
- Modo IA verificado ao vivo via **Claude OAuth** (formato 07, falas em PT-BR, JSON completo).
  OpenRouter não testado ao vivo (sem chave); o cliente é o mesmo já em produção no seedance2.
- Nada foi gerado na Magnific. Custo do one-take 30 s 1080p ainda não medido.
