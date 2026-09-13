// Fonte única de conteúdo do pack "Seedance 2.5 UGC Ads" adaptado pro ecossistema INEMA.
// Usado pelo front (modo Template) e pela função serverless (system prompt do modo IA).
// Prompts ficam em inglês (o modelo lê melhor); as FALAS vão no idioma escolhido pelo usuário.

export const VERSION = "1.0.0";

export const BEATS = [
  { id: "hook", t: "0-4s", label: "HOOK", pt: "Abre no meio de um pensamento; produto já subindo pro quadro." },
  { id: "what", t: "4-11s", label: "WHAT IT IS", pt: "Nomeia o produto, vira o rótulo pra lente." },
  { id: "demo", t: "11-18s", label: "DEMO", pt: "Usa na câmera: aplica, come, veste, abre, liga." },
  { id: "result", t: "18-25s", label: "RESULT", pt: "A prova, inclinando pra lente." },
  { id: "close", t: "25-30s", label: "CLOSE", pt: "Uma frase sem pressão. Nunca hard sell." },
];

export const WORDS_MIN = 70;
export const WORDS_MAX = 80;

export const REALISM = {
  face: "Realism: pore-level natural skin texture, {light}, authentic amateur framing, no beauty filter, no cinematic grade, no on-screen text.",
  pov: "Realism: real hand and skin detail, {light}, authentic amateur POV framing, no cinematic grade, no on-screen text.",
};

export const AUDIO = {
  face: "AUDIO: {pronoun} real voice lip-synced exactly to the quoted lines{lang}, {delivery}, {sfx}dry quiet room tone, field-recording quality; no music, no water droplets, no bubbles, no synthesized blips.",
  pov: "AUDIO: warm natural {gender} voiceover exactly on the quoted lines{lang}, {sfx}dry room tone, field-recording quality; no music, no water droplets, no bubbles, no synthesized blips.",
};

export const VIDEO_OPEN = {
  face: "Continuous unedited 30-second vertical handheld iPhone front-camera selfie video, one single take with no cuts. The {person} from the reference {setting}, phone at arm's length, talking straight to camera like a friend, slight natural handheld sway. The {product} from the reference is the only product.",
  mirror: "Continuous unedited 30-second vertical handheld iPhone selfie video, one single take with no cuts, filmed partly to the front camera and partly into a full-length mirror. The {person} from the reference {setting}; the {product} from the reference is the only product.",
  pov: "Continuous unedited 30-second vertical handheld iPhone video, one single take with no cuts, first-person POV looking down at the scene from the reference. Only the hands and the {product} from the reference ever appear — no face, no body. A relaxed {gender} voice narrates like they're talking to a friend, never like an announcer.",
};

// Cabeçalhos de parâmetro por plataforma-alvo.
export const TARGETS = {
  magnific: {
    name: "Magnific (MCP)",
    step1: "images_generate · mode gpt-2 (rótulo legível; seedream-5-pro se precisar de fidelidade máxima) · 3:4",
    step2: "images_generate · mode flux-2-klein (ou seedream-5-pro) · 3:4",
    step3: "video_generate · slug bytedance-seedance-pro-2.5 · aspectRatio 9:16 · resolution 1080p (rascunho: 720p) · duration 30 · references[]: {type:'product', image do STEP 1} + {type:'character', image do STEP 2} · sem keyframes",
    note: "Rodar simulate_cost antes de gerar. Custo do 30 s 1080p ainda não medido (5 s/720p/16:9 = 2.200 cr). Fallback de voz PT-BR: inemavox → references[] type audio.",
  },
  higgsfield: {
    name: "Higgsfield (MCP)",
    step1: "gpt_image_2 · quality high · 3:4",
    step2: "soul_2 · 3:4 · quality 2k",
    step3: "seedance_2_5 · mode omni_reference · 9:16 · 1080p · duration 30 · generate_audio true · both job ids as image_references (job ids, nunca uploads crus)",
    note: "≈390 créditos por one-take 30 s 1080p; ≈195 em 720p. Render 18–22 min.",
  },
  fal: {
    name: "fal.ai / kie.ai",
    step1: "gpt-image (ou flux) · 3:4 · texto do rótulo curto",
    step2: "flux / seedream · 3:4 · retrato realista",
    step3: "bytedance/seedance 2.5 pro · reference-to-video · 9:16 · 1080p · 30 s · audio on · duas imagens de referência",
    note: "Conferir nome exato do endpoint e limites de duração no dia — mudam com frequência.",
  },
};

// Os 9 formatos do pack. `kind`: face (creator falando), mirror (try-on com espelho), pov (só mãos + voz off).
// `example` traz o exemplo original do pack (marca fictícia) pra servir de gabarito de tom.
export const FORMATS = [
  {
    id: "01", kind: "face", title: "Classic Review", subtitle: "A confissão de skincare",
    bestFor: "séruns, hidratantes, cabelo, qualquer coisa aplicada na câmera. O UGC padrão.",
    demoVerb: "aplica na pele",
    light: "flat daylight", delivery: "natural conversational pacing with tiny pauses", sfx: "",
    beats: [
      "leans in mid-thought while raising the product into frame next to the face",
      "taps the label",
      "applies it on camera (drops on fingertips, pats onto cheek)",
      "tilts cheek toward the lens into the window light",
      "back to center, small shrug and grin, holds the product up",
    ],
    tip: "Troque o produto nos passos 1 e 3, mantenha o resto. O hook é a edição de maior alavancagem: tem que soar como o meio de uma história, nunca como o começo de um anúncio.",
    example: {
      brand: "DEW", product: "barrier repair serum", customer: "mulher, 20-30, pele sensível",
      product_prompt: "Clean e-commerce product photograph of a frosted glass skincare serum bottle with a white dropper cap, minimal matte white label reading 'DEW · Barrier Repair Serum · Hyaluronic + Ceramides', on a beige stone bathroom counter, soft natural window light, photoreal, no watermark.",
      creator_prompt: "Unretouched casual iPhone front-camera style portrait of a woman in her late 20s, wavy hair loosely tied back, light freckles, bare skin with visible pores, plain grey ribbed tank top, standing in a bright everyday apartment bathroom, flat natural daylight, authentic amateur selfie framing, no makeup, no beauty filter, no retouching.",
      lines: [
        "Okay, I need to talk about this, because two weeks ago my skin was a wreck.",
        "This is the DEW barrier repair serum. Hyaluronic, ceramides... that's literally it.",
        "It's not sticky. It just sinks in, like water.",
        "Look at that. No filter, no makeup. That's just my skin now.",
        "If your skin barrier is fried... just try it. Thank me later.",
      ],
    },
  },
  {
    id: "02", kind: "face", title: "Desk Confession", subtitle: "Problema → ritual → resultado",
    bestFor: "suplementos, café, ferramentas de produtividade. Tudo que se compra pra resolver uma dor diária.",
    demoVerb: "consome na câmera (come um, toma um gole, toca no app)",
    light: "everyday apartment daylight", delivery: "relaxed low-key delivery", sfx: "",
    beats: [
      "starts mid-story about the daily pain while lifting the product into frame",
      "turns the label to the lens, names the routine",
      "opens it and consumes it on camera, reacts honestly",
      "gestures at the workspace with the proof, product still in hand",
      "leans in slightly, taps the lid, one low-pressure line",
    ],
    tip: "O beat de comer/beber na câmera é o que vende um consumível: nunca corte. Bebida = gole + suspiro honesto; app = tocar na tela.",
    example: {
      brand: "RISE", product: "lion's mane focus gummies", customer: "homem, 25-35, trabalha no computador",
      product_prompt: "Clean e-commerce product photograph of an amber glass supplement jar with a black lid, kraft-paper label reading 'RISE · Lion's Mane Focus Gummies', a few translucent red berry gummies beside the jar on a light wood kitchen counter, bright daylight, photoreal, no watermark.",
      creator_prompt: "Unretouched casual iPhone front-camera style portrait of a man in his late 20s, short dark hair, light stubble, charcoal hoodie, sitting at a cluttered home desk with a laptop and coffee mug behind him, everyday apartment daylight, real skin texture, authentic amateur selfie framing, tired-but-friendly expression, no retouching.",
      lines: [
        "So I used to hit a wall every single day at 2pm. Like, useless.",
        "These are lion's mane focus gummies. I take two with my coffee, that's the whole routine.",
        "They actually taste good, which... surprised me.",
        "No jitters, no crash. I've cleared my whole list before lunch every day this week.",
        "Just run it for one week. That's all I'm saying.",
      ],
    },
  },
  {
    id: "03", kind: "face", title: "Night Routine", subtitle: "Demo aconchegante de gadget",
    bestFor: "aparelhos de beleza, gadgets de bem-estar, tech de casa. Produtos com um estado 'uau' visível.",
    demoVerb: "liga/usa o aparelho no corpo",
    light: "warm cozy lamp light", delivery: "warm amused delivery", sfx: "",
    beats: [
      "raises the gadget into frame, already on / glowing",
      "turns the gadget toward the lens and names it, one-line routine",
      "uses it on camera, holds a beat, laughs at herself",
      "lifts it off and leans toward the lens with the proof",
      "hugs the product to the chest, grins, one line",
    ],
    tip: "A piada autodepreciativa no meio da demo (\"pareço vilã de filme\") faz o trabalho pesado: é o beat que torna o anúncio humano. Todo anúncio de gadget precisa de um momento em que o creator ri de si mesmo.",
    example: {
      brand: "(sem marca)", product: "LED red-light therapy face mask", customer: "mulher, 28-38, rotina noturna",
      product_prompt: "Clean e-commerce product photograph of a white silicone LED light-therapy face mask with rows of small red and amber LEDs glowing softly, resting on a marble vanity next to its white controller remote, soft evening lamp light, photoreal, no text on product, no watermark.",
      creator_prompt: "Unretouched casual iPhone front-camera style portrait of a Black woman in her early 30s, neat shoulder-length braids, glowing real skin with visible pores, oversized cream sweatshirt, sitting on her bed in a cozy warmly lit bedroom in the evening, string lights softly blurred behind her, authentic amateur selfie framing, warm genuine smile, minimal makeup, no retouching.",
      lines: [
        "Everyone keeps asking what I changed about my skin... it's this thing.",
        "Red light therapy mask. Ten minutes a night, that's it.",
        "I know I look like a movie villain right now.",
        "But my dark spots are fading, and I do it literally lying in bed.",
        "Laziest skincare I own. Obsessed.",
      ],
    },
  },
  {
    id: "04", kind: "face", title: "Unboxing", subtitle: "A primeira reação",
    bestFor: "lançamentos, embalagem premium, tech. Quando a revelação em si é o conteúdo.",
    demoVerb: "abre a caixa e usa pela primeira vez",
    light: "neutral daylight", delivery: "genuine unscripted-feeling reactions with small pauses",
    sfx: "real paper and plastic sounds from the unboxing synced to the hands, ",
    beats: [
      "holds the sealed box up to the lens (the sealed box IS the hook)",
      "peels the box open on camera, tilts it to show the product seated inside",
      "lifts the product out, first tactile detail near the lens",
      "first use on camera, eyes widen, voice drops a little",
      "looks back at the product in hand, half-laughs, verdict",
    ],
    tip: "Arco: antecipação → embalagem → produto → primeiro uso → veredito. A revelação tem que cair no meio do vídeo, não no começo: a caixa lacrada É o hook.",
    example: {
      brand: "AURA", product: "premium wireless earbuds", customer: "mulher, 20-28, tech",
      product_prompt: "Clean e-commerce product photograph of a matte sage-green earbuds charging case, lid open showing white earbuds inside, sitting on top of its minimal matte kraft box printed only with 'AURA' in small dark letters, on a light desk, soft daylight, photoreal, no watermark.",
      creator_prompt: "Unretouched casual iPhone front-camera style portrait of a woman in her early 20s, straight dark hair with curtain bangs, silver hoop earrings, black long-sleeve top, sitting at a tidy desk by a window in a small apartment, neutral daylight, real skin texture, authentic amateur selfie framing, curious excited expression, no retouching.",
      lines: [
        "Okay, these finally came, and I've been waiting three weeks. We're opening them right now.",
        "Oh, okay... the box is already nicer than my phone's was.",
        "Listen to that click. And this green... why is this green so good?",
        "Oh. Okay. That's... genuinely so much better than what I've been using.",
        "Yeah, these are staying in. Sorry to my old pair.",
      ],
    },
  },
  {
    id: "05", kind: "mirror", title: "Try-On", subtitle: "O fit check",
    bestFor: "roupa, activewear, acessórios, joias. Qualquer coisa que se veste.",
    demoVerb: "veste na câmera e checa no espelho",
    light: "natural daylight", delivery: "light amused delivery", sfx: "soft fabric rustle synced to the try-on, ",
    beats: [
      "front camera, holds the folded item up and squishes it",
      "pulls it on in frame, laughing as the head pops through",
      "turns to the mirror, phone visible in hand, checks the fit side-on",
      "back to front camera close, rubs the material between fingers near the lens",
      "hands in pocket, little shoulder shrug, repurchase-intent line",
    ],
    tip: "Close-up de textura vende tecido melhor que qualquer adjetivo: sempre roteirize um beat em que o material toca a lente. O fecho 'já sei que vou comprar a cinza' é padrão comprovado: intenção de recompra lê como o review mais forte possível.",
    example: {
      brand: "LOFT", product: "cloud-soft oversized hoodie", customer: "mulher, 20-30, conforto",
      product_prompt: "Clean e-commerce product photograph of an oatmeal-cream heavyweight oversized hoodie, thick soft fleece visibly plush, neatly folded on a light linen surface with a small woven label reading 'LOFT', soft daylight, photoreal, no watermark.",
      creator_prompt: "Unretouched casual iPhone front-camera style portrait of a woman in her mid 20s, blonde hair in a claw clip, minimal makeup, plain white tee, standing in front of a full-length mirror in a bright bedroom, natural daylight, real skin texture, authentic amateur mirror-selfie framing, relaxed confident expression, no retouching.",
      lines: [
        "This is the hoodie everyone's been gatekeeping. Look how thick this is.",
        "Okay, first of all, it's like putting on a duvet.",
        "It's oversized but it still has, like, a shape? See the drop shoulder?",
        "And the inside is the softest thing I own. I'm not exaggerating.",
        "I got the oatmeal one. I already know I'm buying the grey.",
      ],
    },
  },
  {
    id: "06", kind: "pov", title: "Product-Only POV", subtitle: "Mãos e voz off",
    bestFor: "utensílios de cozinha, casa, papelaria. Quando o produto deve ser a única estrela.",
    demoVerb: "as mãos usam o produto em tempo real",
    light: "bright natural kitchen daylight", delivery: "", sfx: "real handling sounds synced to each action, ",
    beats: [
      "hands lift the product off the surface, tilting it in the window light",
      "hands show the key detail up close (label, mechanism, texture)",
      "hands use it in real time, the satisfying core action",
      "hands present the outcome, product resting label side up",
      "hands still, product centered in the light",
    ],
    tip: "POV funciona quando a satisfação é visual: fatiar, despejar, descascar, clicar. Cada frase da voz off tem que casar com o que as mãos fazem naquele beat; deriva é o que faz voz off parecer falsa.",
    example: {
      brand: "FORGE", product: "Japanese-steel chef's knife", customer: "quem cozinha em casa",
      product_prompt: "Clean e-commerce product photograph of a chef's knife with a hammered Japanese steel blade and dark walnut handle, lying on a light wood cutting board beside a ripe tomato, bright kitchen daylight, photoreal, no watermark.",
      creator_prompt: "First-person POV photo looking down at a light wood cutting board on a kitchen counter, a woman's hands with short clean nails resting at the edge, a ripe tomato and fresh herbs beside the board, bright window daylight from the left, authentic iPhone photo, photoreal.",
      lines: [
        "I put off buying a real knife for years. Biggest kitchen mistake I ever made.",
        "Look at this. No sawing, no squashing. The weight just does it for you.",
        "This is the part that got me. It makes you feel like you know what you're doing.",
        "It's one knife. It replaced four of mine.",
        "If you cook at all... this is the one thing worth the money.",
      ],
    },
  },
  {
    id: "07", kind: "face", title: "Taste Test", subtitle: "A reação honesta",
    bestFor: "comida, bebida, snacks. A reação é o anúncio inteiro.",
    demoVerb: "abre e prova na câmera",
    light: "bright kitchen daylight", delivery: "dry sarcastic-to-surprised delivery",
    sfx: "the real crack-hiss of the can opening and quiet carbonation synced to the sip, ",
    beats: [
      "holds the product up to the lens, unimpressed, attacks the category",
      "turns the label to camera, skeptical",
      "opens it on camera, real slow taste, pause, brow furrows, then genuine surprise: one word",
      "looks at the product, then back at the lens, the honest comparison",
      "second longer taste, points at the product, takes it back",
    ],
    tip: "O arco cético-convertido bate elogio direto pra qualquer coisa comestível: os primeiros 10 segundos atacam a categoria, não o produto. A palavra única 'Espera.' depois do gole é o anúncio inteiro; mantenha um beat assim de quieto.",
    example: {
      brand: "VOLT", product: "sparkling yuzu energy water, zero sugar", customer: "homem, 25-35, academia",
      product_prompt: "Clean e-commerce product photograph of a slim sleek matte-white beverage can with a thin yellow band, label reading 'VOLT · Sparkling Yuzu · Zero Sugar', beads of condensation on the can, on a concrete kitchen counter, bright daylight, photoreal, no watermark.",
      creator_prompt: "Unretouched casual iPhone front-camera style portrait of a man in his early 30s, athletic build, buzzed hair, gym t-shirt, standing in his kitchen with a fridge behind him, bright daylight, real skin texture with light post-workout flush, authentic amateur selfie framing, skeptical half-smile, no retouching.",
      lines: [
        "Every energy drink says it doesn't taste like battery acid. Every energy drink is lying.",
        "Sparkling yuzu, zero sugar. Sure. We've heard that before.",
        "Wait.",
        "That actually just tastes like... a really good lemon soda? Where's the fake sweetener taste?",
        "Okay. I take it back. This one's not lying.",
      ],
    },
  },
  {
    id: "08", kind: "face", title: "Bring Your Own Product", subtitle: "Review com foto anexada",
    bestFor: "SEU produto real. Uma foto do celular basta; o modelo faz o estúdio.",
    demoVerb: "usa na câmera (aplica / abre / liga / despeja)",
    light: "natural light", delivery: "natural conversational pacing", sfx: "",
    byo: true,
    beats: [
      "mid-thought hook about the pain this product ended, raising it into frame",
      "turns the label to the lens: what it is and the one thing that makes it different",
      "uses it on camera, one honest reaction",
      "leans toward the lens with the proof, stated like a fact to a friend, not a claim",
      "relaxed close, product held up, low-pressure closer",
    ],
    tip: "O passo de re-fotografar não é polimento opcional: é o que faz o rótulo real sobreviver no vídeo. Use o resultado gerado como referência, nunca a foto crua.",
    example: {
      brand: "[MARCA]", product: "[o que é em uma linha]", customer: "[quem compra]",
      product_prompt: "Using the attached product photo as the exact reference, recreate this product faithfully as a clean e-commerce product photograph — identical shape, colors, label text and logo — placed on [a surface that fits the product], soft natural light, photoreal, no watermark.",
      creator_prompt: "Unretouched casual iPhone front-camera style portrait of [ideal customer: age, look, outfit], in [the room where this product gets used], natural light, bare real skin texture, authentic amateur selfie framing, friendly relaxed expression, no beauty filter, no retouching.",
      lines: [
        "[A LINE ABOUT THE PAIN THIS PRODUCT ENDED — e.g. I was this close to giving up on ___ until this showed up.]",
        "This is [PRODUCT NAME]. [ONE LINE ON WHAT IT IS AND THE ONE THING THAT MAKES IT DIFFERENT.]",
        "[ONE LINE REACTING HONESTLY TO USING IT.]",
        "[THE RESULT LINE — what changed, stated like a fact to a friend.]",
        "[LOW-PRESSURE CLOSER — e.g. Just try it once. That's all it took for me.]",
      ],
    },
  },
  {
    id: "09", kind: "pov", title: "Screenshot-to-POV", subtitle: "Do print da loja ao anúncio sem rosto",
    bestFor: "transformar um print de listagem (loja, Amazon, Etsy) em demo de mãos + voz off. Sem creator.",
    demoVerb: "as mãos usam o produto em tempo real",
    light: "natural daylight", delivery: "", sfx: "real handling sounds synced to the hands' actions, ",
    byo: true,
    beats: [
      "hands lift the product into the light, turning it slowly",
      "hands show the key detail up close (label / mechanism / texture)",
      "hands use it in real time, the core action described specifically",
      "hands present the outcome on camera",
      "hands set the product down centered in the light, still",
    ],
    tip: "O caminho mais rápido de 'eu vendo isso' pra um anúncio rodando: um print entra, um anúncio sai, sem rosto. Mande o modelo ignorar a interface em volta do produto ou o anúncio herda botões e preço da listagem.",
    example: {
      brand: "[MARCA]", product: "[o que faz em uma linha]", customer: "[quem compra]",
      product_prompt: "Using the product in the attached screenshot as the exact reference — identical shape, colors, label and logo, ignore any website interface, buttons or text around it — recreate it as a clean photorealistic product photograph in [the setting where it gets used], natural daylight, no watermark.",
      creator_prompt: "First-person POV photo looking down at [the surface where the product gets used], a person's hands resting at the edge, [one or two props that belong there], bright window daylight, authentic iPhone photo, photoreal.",
      lines: [
        "[HOOK — the moment you realized you needed this.]",
        "[WHAT IT IS, and the one spec or ingredient that actually matters.]",
        "[WHAT IT FEELS LIKE IN USE — the honest observation.]",
        "[THE RESULT — what it replaced, saved, or fixed.]",
        "[LOW-PRESSURE CLOSER — one sentence, no hype.]",
      ],
    },
  },
];

export const RULES = [
  { n: 1, title: "Produto em quadro nos 3 primeiros segundos", body: "Roteirize o produto subindo pro quadro durante a fala do hook, nunca depois." },
  { n: 2, title: "Escreva o bloco de realismo ou vira AI-slop", body: "Sem 'pore-level skin texture, flat daylight, amateur framing, no beauty filter, no cinematic grade' você ganha pele de cera e bokeh laranja-azul. Amador é a estética." },
  { n: 3, title: "Toda fala entre aspas, com timestamp", body: "'Ela fala do produto' sem aspas gera resmungo. 70–80 palavras é o teto pra 30 s." },
  { n: 4, title: "Proíba os sons que não quer", body: "Termine o bloco de áudio com a lista curta: no music, no water droplets, no bubbles, no synthesized blips. Lista curta; prompt longo demais começa a falhar." },
  { n: 5, title: "Espere a loteria do espelho", body: "Alguns takes saem espelhados como câmera frontal real. É consistente no clipe: um hflip no ffmpeg corrige tudo. Cheque o rótulo antes de entregar." },
  { n: 6, title: "QA em frames congelados, não em vibe", body: "Contact sheet 3×3 (ffmpeg tile): exatamente um produto, no máximo duas mãos, rótulo legível, rosto igual à referência, nenhuma legenda embutida." },
  { n: 7, title: "Volume é a estratégia", body: "Criativo cansa em ~72 h. Variante nova 2× por semana: mesma receita, hook novo, creator novo, mesma imagem de produto." },
];

// Utilitários compartilhados
export function countWords(lines) {
  return lines.join(" ").replace(/\[[^\]]*\]/g, "").trim().split(/\s+/).filter(Boolean).length;
}

export function fill(tpl, vars) {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ""));
}

// Monta o STEP 3 (prompt de vídeo) a partir do formato + dados do brief + falas.
export function buildVideoPrompt({ format, brand, product, person, setting, gender, lang, lines }) {
  const f = format;
  const pron = gender === "male" ? "his" : gender === "female" ? "her" : "their";
  const genderWord = gender === "male" ? "male" : gender === "female" ? "female" : "";
  const openTpl = f.kind === "mirror" ? VIDEO_OPEN.mirror : f.kind === "pov" ? VIDEO_OPEN.pov : VIDEO_OPEN.face;
  const productName = brand && brand !== "(sem marca)" ? `${brand} ${product}` : product;
  const open = fill(openTpl, { person, setting, product: productName, gender: genderWord || "female" });
  const beatLines = BEATS.map((b, i) => {
    const action = f.beats[i];
    const line = lines[i] || "";
    return f.kind === "pov"
      ? `${b.t}: ${action}. VO: '${line}'`
      : `${b.t}: ${action}: '${line}'`;
  }).join("\n");
  const langNote = lang === "pt" ? " (spoken in natural Brazilian Portuguese)" : lang === "es" ? " (spoken in natural Latin American Spanish)" : "";
  const realism = fill(f.kind === "pov" ? REALISM.pov : REALISM.face, { light: f.light });
  const audio = fill(f.kind === "pov" ? AUDIO.pov : AUDIO.face, {
    pronoun: pron, lang: langNote, delivery: f.delivery || "natural conversational pacing", sfx: f.sfx || "", gender: genderWord || "female",
  });
  return `"${open}\n${beatLines}\n${realism}\n${audio}"`;
}
