# Executar na Magnific (MCP) — parâmetros, custo, gate, QA

Catálogo e custos gerais: `~/.claude/runbooks/magnific-modelos.md`. Aqui só o que a receita usa.

## Mapeamento do pack → Magnific

| Passo | Pack (Higgsfield) | Magnific |
|---|---|---|
| STEP 1 produto | `gpt_image_2`, quality high, 3:4 | `images_generate` · `mode: gpt-2` (15 cr, texto legível) · aspect 3:4. Fidelidade máxima de marca: `seedream-5-pro` (100 cr) |
| STEP 1 com foto/print | upload + gpt_image_2 com referência | `images_generate` com `references[]` `type: product` (ou `image`) apontando pro upload, `mode: gpt-2` ou `imagen-nano-banana-2` (edição guiada) |
| STEP 2 creator | `soul_2`, 3:4, 2k | `images_generate` · `mode: flux-2-klein` (10 cr, default INEMA) · 3:4. Se ficar "retocado", `seedream-5-pro` |
| STEP 3 vídeo | `seedance_2_5`, `omni_reference`, 9:16, 1080p, 30 s, audio | `video_generate` · `slug: bytedance-seedance-pro-2.5` · `aspectRatio: "9:16"` · `resolution: "720p"` (rascunho) / `"1080p"` (final) · `duration: 30` · `references: [{type:"product", …STEP 1}, {type:"character", …STEP 2}]` · **sem `keyframes`** (proibido junto com references) |
| voz externa | (não existe no pack) | `references[]` `type: audio`, mp3/wav, 2–30 s, ≤ 15 MB; serve pra lipsync/voiceover_sync |

Confirmado no catálogo (2026-09-13): Seedance 2.5 aceita duração 4–30 s, 480p/720p/1080p, 9:16,
prompt até 10.000 caracteres, referências `image/video/character/product/style/audio`,
`soundEffects` e `noMusic`, lipsync nativo. Está em **beta**; tempo esperado ~5 min.

Passar o `identifier`/`url` das criações geradas (de `creations_wait`) nas referências, nunca o
`webUrl`. A regra do Higgsfield "job id, nunca upload cru, por causa do IP check" **não foi
verificada na Magnific**; tratar como precaução, não como fato.

## Custo

- Medido: 5 s · 16:9 · 720p = **2.200 créditos**. O one-take de 30 s em 1080p **não é derivável**
  disso. Sempre rodar `simulate_cost` pro vídeo (720p e 1080p) e pras duas imagens antes de gerar.
- Regra da casa: avisar o usuário se um lote passar de ~5.000 créditos. Um anúncio 30 s 1080p
  provavelmente passa; **mostrar o número e esperar o ok**.
- Nunca deixar `slug`/`mode` em `auto`.

## Gate de execução (ordem fixa)

1. `simulate_cost` → tabela: produto · creator · vídeo 720p · vídeo 1080p · total.
2. Gerar STEP 1 e STEP 2. `creations_wait`. Mostrar as duas ao usuário. Refazer se: rótulo
   ilegível/errado; creator com pele de cera; cômodo/roupa/luz não batem com o STEP 3.
3. **Rascunho 720p** do STEP 3. Baixar pra `~/projetos/output/ugc-seedance25/<slug>/draft-720p.mp4`.
4. QA em frames (abaixo). Reprovou → ajustar prompt, repetir o rascunho. Aprovou → pedir ok.
5. **Final 1080p** → `final-1080p.mp4` na mesma pasta. Registrar no `brief.md` os identificadores
   das criações (produto e creator servem pra série de variantes).

## QA em frames

```bash
ffmpeg -y -i draft-720p.mp4 -vf "fps=0.3,scale=360:-1,tile=3x3" contact.png   # 9 frames de 30 s
ffmpeg -y -i final-1080p.mp4 -vf hflip -c:a copy final-1080p-fixed.mp4        # se o rótulo saiu espelhado
ffprobe -v error -show_entries format=duration -of csv=p=0 final-1080p.mp4      # ≈ 30
```

Checar: um produto só · ≤ 2 mãos · rótulo legível e no sentido certo · rosto = STEP 2 · sem
legenda embutida · produto visível antes de 3 s · sem corte/troca de cena · voz contínua.

## Variantes (regra 7)

Mesmo produto (mesma criação do STEP 1), hook novo e/ou creator novo. Duas por semana. Guardar
no `brief.md` os 2–3 hooks alternativos já escritos pra isso.
