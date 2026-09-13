# PLANO — UGC Seedance 2.5 (skill + app)

Data: 2026-09-13 · Versão alvo: v1.0.0

Fonte: `docs/The-Seedance-2.5-UGC-Ads-Pack.pdf` (Zubair Trabzada / AI Workshop, 2026) e a
transcrição do vídeo em `docs/seedance-2-5-ugc-ads.md`. Texto pesquisável do PDF em
`docs/The-Seedance-2.5-UGC-Ads-Pack.txt`.

## 1. O que o pack ensina (resumo operacional)

Receita de 3 passos, sempre a mesma:

1. **Produto** — uma foto e-commerce limpa (GPT Image 2 no pack). Rótulo curto (marca + 2 linhas).
   Essa imagem vira a identidade do produto em todos os anúncios.
2. **Creator** — retrato "iPhone câmera frontal sem retoque" (Soul 2 no pack), no mesmo cômodo,
   mesma roupa e mesma luz do vídeo. Guardar o id: o mesmo rosto serve pra uma série.
3. **Vídeo** — Seedance 2.5, 9:16, 1080p, 30 s, áudio nativo, as duas imagens como referência,
   one-take sem cortes. Prompt = shot list com timestamps, 5 beats, cada fala entre aspas,
   bloco de realismo, bloco de áudio com lista de sons proibidos.

Esqueleto de 5 beats (30 s, 70–80 palavras faladas):

| Beat | Tempo | Função |
|---|---|---|
| HOOK | 0–4 s | abre no meio de um pensamento, produto já subindo pro quadro |
| O QUE É | 4–11 s | nomeia, mostra o rótulo |
| DEMO | 11–18 s | usa na câmera: aplica, come, veste, abre |
| RESULTADO | 18–25 s | prova, inclinando pra lente |
| FECHO | 25–30 s | uma frase sem pressão, nunca hard sell |

9 prompts: 01 review de skincare · 02 confissão na mesa (suplemento) · 03 rotina noturna (gadget)
· 04 unboxing · 05 try-on (roupa) · 06 POV só mãos + voz off · 07 teste de sabor · 08 traga seu
produto (foto) · 09 traga seu produto (screenshot → POV sem rosto).

7 regras: produto em quadro nos 3 primeiros segundos · bloco de realismo obrigatório · toda fala
entre aspas e com timestamp · banir sons indesejados · loteria do espelho (hflip) · QA em frames
congelados (contact sheet 3×3) · volume é a estratégia (variante nova 2× por semana).

## 2. Mapeamento pro ecossistema INEMA

O pack é escrito pro Higgsfield MCP. Aqui o alvo principal é a **Magnific (MCP)**, com Higgsfield
e fal.ai como alvos secundários (o app gera os cabeçalhos de parâmetro pra cada um).

| Pack (Higgsfield) | Magnific | Nota |
|---|---|---|
| `gpt_image_2` quality high 3:4 | `images_generate` mode `gpt-2` (15 cr) | texto legível no rótulo; `seedream-5-pro` (100 cr) se precisar de fidelidade máxima |
| `soul_2` 3:4 quality 2k | `flux-2-klein` (10 cr, default INEMA) ou `seedream-5-pro` | retrato realista sem retoque |
| `seedance_2_5` mode `omni_reference` | `video_generate` slug `bytedance-seedance-pro-2.5` | `references[]` com `type: product` e `type: character`; **não** usar keyframes (proibido junto com references) |
| duration 30, 9:16, 1080p, generate_audio | `duration: 30`, `aspectRatio: "9:16"`, `resolution: "1080p"`, áudio nativo | catálogo confirma 4–30 s, 1080p, lipsync, `soundEffects`, `noMusic` |
| "passe job ids, não uploads (IP check)" | **verificar na Magnific** | peculiaridade do Higgsfield; não assumir |

Capacidade extra que o pack não tem: a Magnific aceita **referência de áudio** (mp3/wav ≤ 30 s,
`references[].type: audio`) pra lipsync. Caminho de fallback pra PT-BR: gerar a voz no
**inemavox** (chatterbox, voz `rachel`) e passar como referência de áudio.

**Custo**: só há medição de 5 s / 16:9 / 720p = 2.200 créditos. O one-take de 30 s em 1080p não é
derivável disso. Regra: `simulate_cost` obrigatório antes de qualquer geração real, rascunho em
720p, final em 1080p.

## 3. Decisão de arquitetura

Um repo, duas entregas que compartilham o mesmo conteúdo (formatos, regras, blocos fixos):

```
ugc-seedance25/
├── PLANO.md                     este arquivo
├── README.md
├── docs/                        pack original (pdf, md, txt)
├── skill/ugc-seedance25/        skill Claude Code (symlink em ~/.claude/skills/)
│   ├── SKILL.md                 fluxo: brief → 3 prompts → (opcional) execução Magnific → QA
│   └── references/
│       ├── formatos.md          os 9 formatos condensados (beats + "make it yours")
│       ├── regras.md            esqueleto de 5 beats + 7 regras + blocos fixos
│       ├── magnific.md          mapeamento de parâmetros, custos, gate, QA ffmpeg
│       └── ptbr.md              como escrever as falas em PT-BR (70–80 palavras)
└── app/                         gerador de brief UGC (padrão seedance2/app)
    ├── public/index.html        single-page, INEMA dark âmbar, vanilla JS
    ├── public/formats.js        dados dos 9 formatos + blocos fixos (fonte única)
    ├── api/generate.ts          Vercel serverless: Claude escreve o brief (tool use forçado)
    ├── dev-server.mjs           roda local sem Vercel CLI
    ├── package.json · vercel.json · tsconfig.json · .env.example · .gitignore
```

### Skill `/ugc-seedance25`

- **Entrada**: produto (foto ou descrição), o que é em uma linha, quem compra, formato (01–09 ou
  "escolhe pra mim"), creator (ou "escolhe"), idioma das falas (PT-BR default), alvo (Magnific
  default).
- **Saída sempre**: `~/projetos/output/ugc-seedance25/<slug>/brief.md` com os 3 prompts prontos
  e o bloco de parâmetros do alvo.
- **Execução (só se o usuário pedir)**: `simulate_cost` → mostra o custo → produto → creator →
  rascunho 720p → aprovação → final 1080p. Download pra mesma pasta.
- **QA local (barato, sempre que houver vídeo)**: contact sheet 3×3 com ffmpeg; checar rótulo
  espelhado e corrigir com `hflip`; um produto, no máximo duas mãos, rosto igual à referência,
  sem legenda embutida.

### App (gerador de brief)

- **Modo Template** (sem servidor, sem custo): preenche o formato escolhido com os dados do
  brief; as falas ficam como campos editáveis com contador de palavras (meta 70–80).
- **Modo IA** (`POST /api/generate`): Claude Sonnet escreve produto, creator e as 5 falas no idioma
  escolhido, seguindo as regras do pack. Resposta é JSON via tool use forçado; o front monta os
  3 blocos STEP com botão de copiar cada um, copiar tudo e baixar `.md`.
- **Alvo de plataforma**: Magnific / Higgsfield / fal.ai troca só os cabeçalhos de parâmetro.
- **Checklist de QA** (7 regras) visível ao lado do resultado. Histórico em localStorage.
- Stack: HTML + CSS inline + JS puro; serverless TS Node 20; `@anthropic-ai/sdk`; rate limit
  5 req/min por IP; cache do system prompt; sem build.

## 4. Fases

1. **Conteúdo compartilhado** — `formats.js` + `references/*.md` a partir do PDF. (fonte única)
2. **Skill** — `SKILL.md` + symlink. Verificação: skill aparece na listagem e o fluxo de
   brief → `brief.md` roda sem gerar nada.
3. **App** — front (Template) → serverless (IA) → dev-server. Verificação: `tsc --noEmit`,
   servidor local sobe, modo Template funciona sem rede, modo IA responde JSON válido.
4. **Docs** — README com setup local, deploy (git push → Vercel) e uso da skill.
5. **Fora de escopo agora**: curso/guia, execução em lote, histórico em Supabase, Higgsfield MCP.

## 5. Riscos e o que não está provado

- Custo real do 30 s 1080p na Magnific: desconhecido até rodar `simulate_cost`.
- Lipsync de falas em PT-BR direto do prompt de texto: não testado; fallback via inemavox.
- Regra "job id vs upload" do Higgsfield pode não existir na Magnific.
- Seedance 2.5 na Magnific está em `beta: true`; tempo esperado de geração ~5 min.
