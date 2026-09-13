# Regras do pack — esqueleto, blocos fixos e as 7 regras

## Esqueleto de 5 beats (30 s · 70–80 palavras faladas)

| Beat | Tempo | O que acontece |
|---|---|---|
| HOOK | 0–4 s | abre no meio de um pensamento; produto **já subindo pro quadro** |
| WHAT IT IS | 4–11 s | nomeia, vira o rótulo pra lente |
| DEMO | 11–18 s | usa na câmera: aplica, come, veste, abre, liga |
| RESULT | 18–25 s | a prova, inclinando pra lente |
| CLOSE | 25–30 s | uma frase sem pressão; nunca hard sell |

## Aberturas fixas do STEP 3

Rosto (padrão):
> Continuous unedited 30-second vertical handheld iPhone front-camera selfie video, one single take with no cuts. The {person} from the reference {setting}, phone at arm's length, talking straight to camera like a friend, slight natural handheld sway. The {product} from the reference is the only product.

Espelho (try-on):
> Continuous unedited 30-second vertical handheld iPhone selfie video, one single take with no cuts, filmed partly to the front camera and partly into a full-length mirror. The {person} from the reference {setting}; the {product} from the reference is the only product.

POV (só mãos):
> Continuous unedited 30-second vertical handheld iPhone video, one single take with no cuts, first-person POV looking down at the scene from the reference. Only the hands and the {product} from the reference ever appear — no face, no body. A relaxed {female/male} voice narrates like they're talking to a friend, never like an announcer.

## Linhas de beat

Rosto: `0-4s: <ação>: '<fala>'` · POV: `0-4s: <ação>. VO: '<fala>'`
Uma linha por beat, timestamps `0-4s / 4-11s / 11-18s / 18-25s / 25-30s`.

## Bloco de realismo (obrigatório)

Rosto: `Realism: pore-level natural skin texture, {luz}, authentic amateur framing, no beauty filter, no cinematic grade, no on-screen text.`
POV: `Realism: real hand and skin detail, {luz}, authentic amateur POV framing, no cinematic grade, no on-screen text.`

Luz = a mesma do STEP 2: flat daylight · everyday apartment daylight · warm cozy lamp light · neutral daylight · natural daylight · bright kitchen daylight.

## Bloco de áudio (obrigatório, termina com a lista de proibidos)

Rosto: `AUDIO: {her/his} real voice lip-synced exactly to the quoted lines (spoken in natural Brazilian Portuguese), {entrega}, {sfx sincronizado}, dry quiet room tone, field-recording quality; no music, no water droplets, no bubbles, no synthesized blips.`
POV: `AUDIO: warm natural {female/male} voiceover exactly on the quoted lines (…), real handling sounds synced to the hands' actions, dry room tone, field-recording quality; no music, no water droplets, no bubbles, no synthesized blips.`

Entrega por formato: conversational with tiny pauses · relaxed low-key · warm amused · genuine unscripted-feeling reactions · light amused · dry sarcastic-to-surprised.
SFX só quando a ação produz som: papel/plástico do unboxing · tecido do try-on · crack-hiss da lata · faca na tábua.

## As 7 regras

1. **Produto em quadro nos 3 primeiros segundos.** O produto sobe durante a fala do hook.
2. **Bloco de realismo ou vira AI-slop.** Sem ele: pele de cera, bokeh laranja-azul. Amador é a estética.
3. **Toda fala entre aspas e com timestamp.** Sem aspas = resmungo. 70–80 palavras é o teto.
4. **Proíba os sons que não quer.** Lista curta no fim do áudio. Prompt longo demais começa a falhar.
5. **Loteria do espelho.** Alguns takes saem espelhados; é consistente no clipe → `ffmpeg -vf hflip`. Cheque o rótulo antes de entregar.
6. **QA em frames congelados.** Contact sheet 3×3: um produto, ≤ 2 mãos, rótulo legível, rosto igual, sem legenda.
7. **Volume é a estratégia.** Criativo cansa em ~72 h. Variante nova 2×/semana: mesma imagem de produto, hook e creator novos.
