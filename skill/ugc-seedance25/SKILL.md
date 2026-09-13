---
name: ugc-seedance25
description: >-
  Anúncio UGC (creator falando pro celular, one-take 30 s, 9:16, 1080p) com Seedance 2.5 —
  brief do produto vira 3 prompts prontos (produto, creator, vídeo) na receita do pack
  "Seedance 2.5 UGC Ads", adaptada pra Magnific MCP. Gera o brief.md sempre; executa na
  Magnific só se pedido, com gate de custo, rascunho 720p e QA em frames. Gatilho: "anúncio ugc",
  "ugc ad", "ad estilo creator", "vídeo de produto falando pro celular", "seedance ugc".
---

# /ugc-seedance25 — anúncio UGC one-take com Seedance 2.5

Você recebe um produto (foto, print ou descrição) e devolve os **3 prompts** da receita do pack,
prontos pra colar — e, só se o usuário pedir, executa na Magnific com controle de custo.

Leia antes de escrever qualquer prompt:
- `references/regras.md` — esqueleto de 5 beats, blocos fixos (realismo, áudio), 7 regras.
- `references/formatos.md` — os 9 formatos; escolha um.
- `references/ptbr.md` — como escrever as falas em PT-BR (70–80 palavras).
- `references/magnific.md` — parâmetros, custos, gate, QA. Só quando for executar.

## 1 · Brief (uma rodada de perguntas, em texto livre)

Pergunte de uma vez o que faltar. Não pergunte o que já está claro no pedido.

| Campo | Se faltar |
|---|---|
| Produto: foto/print (caminho) ou descrição em uma linha | obrigatório |
| Marca | pode ficar vazio (fictícia ou sem marca) |
| Quem compra | inferir do produto e dizer o que assumiu |
| Formato 01–09 | escolher pelo produto (tabela em `formatos.md`) e dizer qual e por quê |
| Creator (idade, visual, roupa, cômodo) | criar um que pareça o cliente; formatos 06/09 não têm creator |
| Idioma das falas | **PT-BR** por padrão |
| Alvo | **Magnific** por padrão (Higgsfield / fal.ai se pedido) |
| Executar ou só o brief? | **só o brief** por padrão |

Se o usuário mandou foto ou print → formato 08 (rosto) ou 09 (POV sem rosto), com o passo de
re-fotografar o produto (nunca usar a imagem crua como referência no vídeo).

## 2 · Escrever os 3 prompts

Ordem fixa. Os prompts ficam **em inglês**; só as falas entre aspas vão no idioma escolhido.

1. **STEP 1 — PRODUTO**: "Clean e-commerce product photograph of …, label reading 'MARCA · duas
   linhas curtas', on <superfície que combina>, soft natural light, photoreal, no watermark."
   Rótulo curto. Com foto/print: "Using the attached … as the exact reference, recreate faithfully —
   identical shape, colors, label and logo …" (print: "ignore any website interface, buttons or text").
2. **STEP 2 — CREATOR** (ou cena âncora POV nos formatos 06/09): "Unretouched casual iPhone
   front-camera style portrait of <pessoa>, in <o cômodo exato do vídeo>, <luz>, real skin texture,
   authentic amateur selfie framing, <expressão>, no beauty filter, no retouching." Cômodo, roupa e
   luz têm que bater com o STEP 3.
3. **STEP 3 — VÍDEO**: abertura fixa do tipo (rosto / espelho / POV) + 5 beats com timestamp, ação
   e fala entre aspas + bloco Realism + bloco AUDIO com a lista de sons proibidos. Modelo completo
   e exemplos em `regras.md` e `formatos.md`.

Escreva as 5 falas primeiro (ver `ptbr.md`), conte as palavras (70–80), depois monte o STEP 3.

## 3 · Entregar o brief (sempre)

Salvar em `~/projetos/output/ugc-seedance25/<slug-marca-produto>/brief.md` com:
cabeçalho (formato, alvo, idioma, contagem de palavras) · STEP 1 · STEP 2 · STEP 3 · as 5 falas
em lista · 2–3 hooks alternativos pra variantes · checklist de QA (7 regras) · bloco de parâmetros
do alvo (copiar de `magnific.md`). Mostrar o caminho e o STEP 3 na resposta.

Se o usuário só queria o brief, **pare aqui**.

## 4 · Executar na Magnific (só se pedido)

Seguir `magnific.md` à risca. Resumo do gate:

1. `simulate_cost` do vídeo (30 s, 9:16, 720p e 1080p) e das duas imagens → mostrar os números.
   Acima de ~5.000 créditos no total, avisar antes de rodar.
2. Produto (`gpt-2`, 3:4) → creator (`flux-2-klein`, 3:4) → mostrar as duas; refazer se o rótulo
   estiver ilegível ou o creator "retocado demais".
3. **Rascunho 720p** do vídeo com `bytedance-seedance-pro-2.5`, referências `product` +
   `character`, sem keyframes. Baixar pra pasta do brief.
4. QA em frames (seção 5). Se passou e o usuário aprovou, **final 1080p**.
5. Falas em PT-BR saíram com sotaque/lipsync ruim? Gerar a voz no inemavox (chatterbox, `rachel`)
   e reenviar com `references[] type audio` (≤ 30 s, mp3/wav).

## 5 · QA em frames (sempre que houver um vídeo)

```bash
# contact sheet 3x3 (um frame a cada ~3,3 s de um vídeo de 30 s)
ffmpeg -y -i ad.mp4 -vf "fps=0.3,scale=360:-1,tile=3x3" contact.png
# rótulo espelhado? corrige o clipe inteiro
ffmpeg -y -i ad.mp4 -vf hflip -c:a copy ad-fixed.mp4
```

Checar no contact sheet: exatamente um produto · no máximo duas mãos · rótulo legível e não
espelhado · rosto igual ao STEP 2 · nenhuma legenda embutida · produto aparece antes de 3 s.
Reprovou → ajustar o prompt (não o modelo) e voltar ao rascunho 720p.

## O que não fazer

- Não gerar nada sem `simulate_cost` e sem o usuário ter pedido execução.
- Não escrever "she talks about the product" sem aspas: vira resmungo.
- Não deixar o prompt ficar cinematográfico (bokeh, grade, slow-mo). Amador é a estética.
- Não passar de 80 palavras faladas. Não usar hard sell, cupom, "link na bio".
- Não usar a foto crua do usuário como referência no vídeo; sempre o produto re-fotografado.
