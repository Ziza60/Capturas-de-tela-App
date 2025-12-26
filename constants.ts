
import type { GlassesOption, StyleOption, AspectRatioOption, ClothingOption, LightingOption, ExpressionOption, BeautyOption, PoseOption } from './types';

export const POLAROID_ERAS = [
    {
        id: '1920s',
        label: '1920s',
        caption: 'The Roaring Twenties',
        prompt: '1920s Photography Style. Sepia tone, heavy film grain, soft focus. The subject is wearing 1920s fashion (Peaky Blinders style / Flapper dress). Vintage aesthetics. Authentic daguerreotype feel.'
    },
    {
        id: '1950s',
        label: '1950s',
        caption: 'Diner Vibes',
        prompt: '1950s Technicolor Film Photography. Vibrant colors, slightly washed out. The subject is wearing 1950s rockabilly or grease fashion. Diner or classic car background. Flash photography.'
    },
    {
        id: '1980s',
        label: '1980s',
        caption: 'Neon & Synthwave',
        prompt: '1980s Polaroid Flash Photography. High contrast, neon ambient lighting. The subject is wearing 1980s fashion (Denim jacket, colorful patterns). Retro hairstyle. VHS glitch aesthetic.'
    },
    {
        id: '2090s',
        label: '2090s',
        caption: 'Cyber Future',
        prompt: '2090s Futuristic Photography. Holographic overlay, neon blue and purple lighting. The subject is wearing Cyberpunk fashion. High-tech background. Sharp digital look.'
    }
];

export const FRAMING_PROMPTS = {
  'chest-up': `
  *** FRAMING PROTOCOL (ISO CORPORATE STANDARD) ***

  [MANDATORY COMPOSITION: "NEGATIVE SPACE RULE"]
  1. **HEAD SIZE:** The head must be SMALLER than usual. It should occupy max 1/3 of the vertical space.
  2. **TOP MARGIN:** There MUST be significant empty space above the hair.
  3. **SIDE MARGINS:** There MUST be significant empty space to the left and right of the ears.
  4. **SHOULDERS:** Show the FULL width of the shoulders. Do not crop the deltoids.

  [FEMALE SUBJECT SPECIFIC]
  - WOMEN MUST HAVE THE SAME "WIDE SHOT" FRAMING AS MEN.
  - DO NOT ZOOM IN on the face.
  - DO NOT CROP at the neck. Show the upper chest/lapels.
  `,
  'close-up': `
  *** FRAMING PROTOCOL (LINKEDIN CLOSE-UP) ***
  COMPOSITION: Tight Headshot.
  VISIBLE AREA: Chin to top of the head. Shoulders barely visible.
  PLACEMENT: Eyes should be at the top 1/3 line of the image. Focus intensely on the face.
  PURPOSE: Social Media Profile. Maximum facial connection.
  `
};

export const TEAM_FALLBACK_FRAMING_PROMPT = `You are processing a TEAM HEADSHOT batch for professional corporate use.

SYSTEM CONTEXT (IMPORTANT):
• Framing selection is DISABLED in this mode.
• A single corporate standard framing MUST be applied.
• This fallback is used ONLY when deterministic normalization produced framing errors.

PRIMARY OBJECTIVE:
Correct framing inconsistencies while preserving a strict corporate standard.

WHEN TO ADJUST FRAMING:
Adjust framing ONLY if you detect:
- Missing or cropped shoulders
- Head occupying more than 45% of image height
- Unnatural torso cutoff
- Extreme selfie perspective

If none of these are present:
→ Preserve the original framing exactly.

MANDATORY FRAMING STANDARD (NON-NEGOTIABLE):
- Framing type: Corporate chest-up
- Upper torso visible
- Full shoulders visible (no deltoid crop)
- Head size: approximately 30–35% of image height
- Eyes slightly above vertical center
- Balanced margins

CONSISTENCY RULE:
- All people MUST share identical framing and scale
- No per-person adjustments

GEOMETRY & IDENTITY:
- Do NOT distort anatomy
- Preserve facial identity
- No beautification exaggeration

BACKGROUND:
- Apply background only AFTER framing correction
- Same background for all people

FINAL VALIDATION:
✔ Uniform framing across all people
✔ Visible shoulders
✔ No distortion
✔ Professional corporate appearance

If correction risks inconsistency, prefer conservative framing.`;

export const AGE_OPTIONS = [
    { value: 'young-adult', label: 'Jovem Adulto (20-30)' },
    { value: 'adult', label: 'Adulto (30-50)' },
    { value: 'senior', label: 'Sênior (50+)' }
];

export const GENDER_OPTIONS = [
    { value: 'male', label: 'Masculino' },
    { value: 'female', label: 'Feminino' }
];

export const ETHNICITY_OPTIONS = [
    { value: 'caucasian', label: 'Caucasiano' },
    { value: 'black', label: 'Negro' },
    { value: 'asian', label: 'Asiático' },
    { value: 'latino', label: 'Latino' },
    { value: 'middle_eastern', label: 'Oriente Médio' },
    { value: 'south_asian', label: 'Sul Asiático' }
];

export const ASPECT_RATIO_OPTIONS: AspectRatioOption[] = [
  { id: 'square', label: 'Quadrado (1:1)', prompt: '--ar 1:1', className: 'aspect-square' },
  { id: 'portrait', label: 'Retrato (3:4)', prompt: '--ar 3:4', className: 'aspect-[3/4]' },
  { id: 'landscape', label: 'Paisagem (16:9)', prompt: '--ar 16:9', className: 'aspect-video' },
  { id: 'story', label: 'Story (9:16)', prompt: '--ar 9:16', className: 'aspect-[9/16]' },
];

export const GLASSES_OPTIONS: GlassesOption[] = [
  { id: 'none', label: 'Manter (Se houver)', prompt: '' },
  { id: 'remove', label: 'Remover Óculos', prompt: 'REMOVE GLASSES. The subject must NOT wear glasses. Bare eyes.' },
  { id: 'add-sunglasses', label: 'Adicionar Óculos Escuros', prompt: 'WEARING SUNGLASSES. Stylish black ray-ban wayfarer sunglasses.' }
];

export const LIGHTING_OPTIONS: LightingOption[] = [
  { id: 'default', label: 'Padrão (Balanceado)', prompt: 'Professional balanced studio lighting. Soft shadows.' },
  { id: 'studio', label: 'Estúdio (Contraste)', prompt: 'High-contrast studio lighting. Rembrandt lighting style. Dramatic shadows.' },
  { id: 'natural', label: 'Luz Natural (Janela)', prompt: 'Soft natural window light coming from the side. Golden hour glow. Organic feel.' },
  { id: 'neon', label: 'Neon / Cyberpunk', prompt: 'Cinematic neon lighting. Blue and pink rim lights. Night city vibe.' },
  { id: 'cinematic', label: 'Cinemático (Moody)', prompt: 'Moody cinematic lighting. Dark background, highlighted face. Teal and orange grading.' }
];

export const EXPRESSION_OPTIONS: ExpressionOption[] = [
  { id: 'original', label: 'Original', prompt: '' },
  { id: 'smile', label: 'Sorriso Confiante', prompt: 'Expression: Confident, warm, approachable smile. Showing teeth slightly.' },
  { id: 'serious', label: 'Sério / Autoritário', prompt: 'Expression: Serious, authoritative, focused. Mouth closed. Leadership vibe.' },
  { id: 'happy', label: 'Radiante / Feliz', prompt: 'Expression: Very happy, big genuine laugh/smile. Joyful eyes.' },
  { id: 'neutral', label: 'Neutro (ID)', prompt: 'Expression: Perfectly neutral face. Relaxed muscles. No smile. Passport style.' }
];

export const BEAUTY_OPTIONS: BeautyOption[] = [
  { id: 'default', label: 'Natural (Padrão)', prompt: 'Skin texture: Realistic, natural high-quality skin texture. Pore details visible. DO NOT ALTER FACIAL STRUCTURE.' },
  { id: 'low', label: 'Leve Retoque', prompt: 'Skin texture: Slightly smoothed, reduced blemishes but kept natural. PRESERVE BONE STRUCTURE.' },
  { id: 'matte', label: 'Matte (Pro)', prompt: 'BEAUTY OVERRIDE: Professional matte finish. Reduce shine/oiliness. Even skin tone. Subtle grooming. NO GEOMETRY CHANGE.' },
  { id: 'high', label: 'Glamour (Suave)', prompt: 'Skin texture: Perfect, smooth, magazine-quality skin. Airbrushed look. Glowing. DO NOT CHANGE FACE SHAPE.' }
];

export const POSE_OPTIONS: PoseOption[] = [
    { id: 'default', label: 'Original', prompt: 'Pose: Keep the original head angle and posture.', icon: '👤' },
    { id: 'arms-crossed', label: 'Braços Cruzados', prompt: 'Pose: Arms crossed over chest. Power pose. Confident stance.', icon: '🙅' },
    { id: 'hand-chin', label: 'Mão no Queixo', prompt: 'Pose: Hand resting thoughtfully on chin. Thinking pose.', icon: '🤔' },
    { id: 'hands-pocket', label: 'Mãos no Bolso', prompt: 'Pose: Casual, hands in pockets (if visible). Relaxed shoulders.', icon: '👖' },
    { id: 'leaning-forward', label: 'Inclinado', prompt: 'POSE INSTRUCTION: The subject is leaning slightly forward towards the camera. Engaging, listening pose. Shallow depth of field.', icon: '👀' },
    { id: 'side-profile', label: 'Perfil (45°)', prompt: 'POSE INSTRUCTION: The subject is turned 45 degrees to the side, looking back at the camera. Dynamic shoulder angle.', icon: '👤' }
];

export const TEAM_UNIFORMS: ClothingOption[] = [
  // 1. Executivo / Financeiro
  {
    id: 'corp-grey-suit',
    label: 'Executivo: Terno Cinza + Azul',
    prompt: `UNIFORM PROTOCOL: Force ALL subjects to wear an identical tailored Charcoal Grey business suit with a light blue dress shirt. No tie for women, Navy Blue tie for men. NO LOGOS.`,
  },
  {
    id: 'corp-black-suit-red',
    label: 'Executivo Formal: Terno Preto + Gravata Vermelha',
    prompt: `UNIFORM PROTOCOL: Force ALL subjects to wear an identical Black business suit, crisp white shirt. Men MUST wear a solid Red Tie. Women wear a black blazer over white blouse. NO LOGOS.`,
  },
  // 2. Administrativo
  {
    id: 'corp-beige-blazer',
    label: 'Administrativo: Blazer Bege',
    prompt: `UNIFORM PROTOCOL: Force ALL subjects to wear an identical Beige/Tan Blazer over a clean white shirt. Smart-casual, approachable, bright. NO LOGOS.`,
  },
  // 3. Atendimento
  {
    id: 'corp-white-shirt',
    label: 'Comercial: Camisa Social Branca',
    prompt: `UNIFORM PROTOCOL: Force ALL subjects to wear an identical crisp White Button-Down Dress Shirt (No Jacket/Blazer). Top button open. Clean, airy, friendly. NO LOGOS.`,
  },
  // 4. Tech / Startup
  {
    id: 'tech-polo-grey',
    label: 'Tech: Polo Cinza',
    prompt: `UNIFORM PROTOCOL: Force ALL subjects to wear an identical Grey Modern Polo Shirt. Minimalist startup vibe. NO LOGOS.`,
  },
  {
    id: 'corp-black-blazer',
    label: 'Tech: Blazer Preto + Camiseta',
    prompt: `UNIFORM PROTOCOL: Force ALL subjects to wear an identical Modern Tech look: Black fitted blazer over a high-quality heather grey t-shirt. Smart-casual uniformity. NO LOGOS.`,
  },
  // 5. Operacional
  {
    id: 'ops-polo-green',
    label: 'Operacional: Polo Verde',
    prompt: `UNIFORM PROTOCOL: Force ALL subjects to wear an identical Solid Forest Green Polo Shirt. Practical, uniform look. NO LOGOS.`,
  },
  {
    id: 'ops-polo-orange',
    label: 'Operacional: Polo Laranja',
    prompt: `UNIFORM PROTOCOL: Force ALL subjects to wear an identical Solid Bright Orange Polo Shirt. High visibility, logistics vibe. NO LOGOS.`,
  },
  {
    id: 'corp-polo-blue',
    label: 'Padrão: Polo Azul Royal',
    prompt: `UNIFORM PROTOCOL: Force ALL subjects to wear an identical Royal Blue company polo shirt. Clean, neat, ironed. NO LOGOS.`,
  },
  // 6. Saúde
  {
    id: 'medical-white-coat',
    label: 'Saúde: Jaleco Branco',
    prompt: `UNIFORM PROTOCOL: Force ALL subjects to wear a Professional White Medical Lab Coat over NAVY BLUE scrubs. Ensure the neck looks NATURAL. NO LOGOS.`,
  },
  // 7. Engenharia
  {
    id: 'eng-overall-helmet',
    label: 'Engenharia: Macacão + Capacete',
    prompt: `UNIFORM PROTOCOL: Force ALL subjects to wear Blue/Orange Industrial Workwear (Coveralls) and a White Hard Hat. NO LOGOS.`,
  },
  // 8. Varejo
  {
    id: 'retail-tshirt',
    label: 'Varejo: Camiseta Preta + Crachá',
    prompt: `UNIFORM PROTOCOL: Force ALL subjects to wear a Solid Black T-Shirt. MUST include a blank Lanyard/ID Strap around the neck. NO LOGOS.`,
  },
];

export const HEADSHOT_STYLES: StyleOption[] = [
  // --- PROFESSIONAL ---
  {
    id: 'studio-classic',
    label: 'Estúdio Clássico',
    prompt: 'Professional headshot, studio lighting, solid grey background, sharp focus, 8k resolution, highly detailed.',
    category: 'professional'
  },
  {
    id: 'office-modern',
    label: 'Escritório Moderno',
    prompt: 'ENVIRONMENTAL PORTRAIT. Location: Busy modern corporate office. BACKGROUND: Real office environment (blurred). Glass meeting rooms, coworkers in distance, depth, bokeh. NOT A STUDIO BACKGROUND. NOT A SOLID COLOR. Vibe: Dynamic, successful, bright.',
    category: 'professional'
  },
  {
    id: 'executive-dark',
    label: 'Executivo Dark',
    prompt: 'High-end executive portrait, black background, dramatic rim lighting, serious, wealthy, masterpiece.',
    category: 'professional'
  },
  {
    id: 'tech-startup',
    label: 'Tech Founder',
    prompt: 'ENVIRONMENTAL PORTRAIT. Location: Modern co-working space or tech office. BACKGROUND: Whiteboards, glass walls, open space (blurred). Smart casual attire. Confident. NOT A STUDIO BACKGROUND.',
    category: 'professional'
  },
  {
    id: 'real-estate',
    label: 'Corretor Imobiliário',
    prompt: 'ENVIRONMENTAL PORTRAIT. Location: Luxury home interior or modern living room (blurred). Warm lighting, trustworthy smile. NOT A STUDIO BACKGROUND.',
    category: 'professional'
  },
  {
    id: 'conference-speaker',
    label: 'Palestrante (TED)',
    prompt: `ENVIRONMENTAL PORTRAIT. Keep the faces exactly as they are. Place the subject on a professional stage with a dark blurred background and focused spotlight lighting. Clothing: Smart-casual executive attire. Vibe: Authority, Leadership, TED Talk speaker.`,
    category: 'professional',
  },
  {
    id: 'actor-casting',
    label: 'Ator / Casting',
    prompt: `Professional Actor Headshot / Casting Photo. Lighting: Cinematic, moody, or natural window light (Rembrandt). Background: Blurred texture or simple dark wall. Clothing: Simple solid t-shirt or black turtle neck. Vibe: Charismatic, intense.`,
    category: 'professional',
  },
  {
    id: 'white-studio',
    label: 'Fundo Branco Estúdio',
    prompt: `Background: Pure white (high-key). Clothing: Professional business attire. Lighting: Soft, even, shadowless.`,
    category: 'professional',
  },
  {
    id: 'navy-blue',
    label: 'Fundo Azul Marinho',
    prompt: `Background: Deep, trustworthy navy blue solid background. Clothing: Dark professional suits. Professional corporate look.`,
    category: 'professional',
  },
  {
    id: 'corporate-grey',
    label: 'Cinza Corporativo (ISO)',
    prompt: `BACKGROUND: **Thunder Grey (Hex #454545)**. SOLID, FLAT, MATTE grey. STRICTLY NO GRADIENTS. Clothing: Professional business attire.`,
    category: 'professional',
  },

  // --- UTILITIES (DOCUMENTS) ---
  {
    id: 'passport-pro',
    label: 'Passaporte / ID',
    prompt: 'Biometric ID photo style. White background. Flat lighting. Neutral expression. Frontal view. High visibility.',
    category: 'utilities'
  },
  {
    id: 'linkedin-bw',
    label: 'LinkedIn P&B',
    prompt: 'Professional black and white headshot, high contrast, studio lighting, classic timeless look.',
    category: 'utilities'
  },

  // --- CASUAL & NATURAL ---
  {
    id: 'outdoor-park',
    label: 'Parque / Ar Livre',
    prompt: 'Professional portrait outdoors, blurred park background, trees, natural sunlight, bokeh, golden hour.',
    category: 'casual_natural'
  },
  {
    id: 'urban-street',
    label: 'Urbano / Rua',
    prompt: 'Stylish portrait in a city street, urban background, blurred city lights, depth of field, modern look.',
    category: 'casual_natural'
  },
  {
    id: 'coffee-shop',
    label: 'Cafeteria Cozy',
    prompt: 'Casual portrait inside a cozy coffee shop, warm ambient lighting, blurred cafe background, relaxed atmosphere.',
    category: 'casual_natural'
  },
  {
    id: 'golden-hour',
    label: 'Golden Hour',
    prompt: 'Portrait taken during golden hour, sun flare, warm orange tones, natural backlight, dreamy aesthetic.',
    category: 'casual_natural'
  },
  {
    id: 'beach-lifestyle',
    label: 'Lifestyle Praia',
    prompt: 'Relaxed lifestyle portrait at the beach, soft morning light, ocean background, white linen vibe.',
    category: 'casual_natural'
  },
  {
    id: 'old-money',
    label: 'Old Money (Luxo)',
    prompt: `Aesthetic: "Old Money", Quiet Luxury. Background: An elegant country club estate or garden (blurred). Clothing: High-quality fabrics, linen, cashmere in beige/cream. Lighting: Soft, expensive sunlight.`,
    category: 'casual_natural',
  },
  {
    id: 'modern-home',
    label: 'Residencial Moderno',
    prompt: `Place the subject in a bright, airy, modern living room. Lighting: Soft window light. Clothing: Comfortable but neat casual attire.`,
    category: 'casual_natural',
  },

  // --- CREATIVE ---
  {
    id: 'cyberpunk',
    label: 'Futurista / Cyber',
    prompt: 'Cyberpunk style portrait, neon lights, futuristic city background, blue and purple tones, high tech vibe.',
    category: 'creative_artistic'
  },
  {
    id: 'anime-style',
    label: 'Anime Japonês',
    prompt: 'High quality anime style portrait, cel shaded, vibrant colors, studio ghibli inspired art style.',
    category: 'creative_artistic'
  },
  {
    id: '3d-pixar-style',
    label: 'Avatar 3D (Pixar)',
    prompt: '3D rendered character portrait, Pixar style, disney style, cute, expressive, high quality rendering.',
    category: 'creative_artistic'
  },
  {
    id: 'gta-loading',
    label: 'GTA Loading Screen',
    prompt: 'Grand Theft Auto loading screen art style, digital illustration, cel shaded, high contrast, stylized.',
    category: 'creative_artistic'
  },
  {
    id: 'comic-book',
    label: 'HQs / Comic Book',
    prompt: 'Style: Modern Comic Book art (Marvel/DC style). Ink lines, cel-shading, bold colors. Heroic pose.',
    category: 'creative_artistic'
  },
  {
    id: 'oil-painting',
    label: 'Pintura a Óleo',
    prompt: 'Classic oil painting portrait, textured brushstrokes, fine art style, museum quality, rembrandt lighting.',
    category: 'creative_artistic'
  },
  {
    id: 'watercolor',
    label: 'Aquarela',
    prompt: 'Transform the image into a watercolor painting style. Soft blended colors, paper texture. Artistic and dreamy.',
    category: 'creative_artistic'
  },
  {
    id: 'pencil-sketch',
    label: 'Esboço a Lápis',
    prompt: 'Charcoal pencil sketch portrait, rough texture, artistic shading, white paper background.',
    category: 'creative_artistic'
  },
  {
    id: 'film-noir',
    label: 'Film Noir Vintage',
    prompt: 'Dramatic 1940s Film Noir style. High contrast black and white, deep shadows, venetian blind shadows, moody atmosphere.',
    category: 'creative_artistic'
  },
  {
    id: 'astronaut',
    label: 'Astronauta',
    prompt: 'Realistic astronaut suit/helmet floating in space. Background: Stars and nebulae. Epic sci-fi look.',
    category: 'creative_artistic'
  },
  {
    id: 'retro-filter',
    label: 'Filtro Retrô',
    prompt: 'Apply a warm, nostalgic retro film filter. Enhance grain and color grading for a vintage aesthetic.',
    category: 'creative_artistic'
  },

  // --- TRAVEL ---
  {
    id: 'paris-tower',
    label: 'Paris (Torre Eiffel)',
    prompt: 'Portrait with the Eiffel Tower in the background, Paris, cloudy sky, travel photography.',
    category: 'travel_scenery'
  },
  {
    id: 'beach-sunset',
    label: 'Praia Pôr do Sol',
    prompt: 'Portrait on a tropical beach at sunset, golden light, ocean background, relaxed vibe.',
    category: 'travel_scenery'
  },
  {
    id: 'nyc-times-square',
    label: 'NYC Times Square',
    prompt: 'Portrait in Times Square New York, bright billboards, night time, city energy, urban travel.',
    category: 'travel_scenery'
  },
  {
    id: 'santorini-greece',
    label: 'Santorini Grécia',
    prompt: 'Portrait in Santorini, white buildings with blue domes, bright sunlight, mediterranean sea background.',
    category: 'travel_scenery'
  },
  {
    id: 'swiss-alps',
    label: 'Alpes Suíços (Neve)',
    prompt: 'Portrait in the Swiss Alps, snowy mountains background, winter clothing vibe, cold fresh air.',
    category: 'travel_scenery'
  },
  {
    id: 'rio-cristo',
    label: 'Rio (Cristo Redentor)',
    prompt: 'Portrait with the Christ the Redeemer statue in Rio de Janeiro background. Sunny tropical light.',
    category: 'travel_scenery'
  },
  {
    id: 'rome-colosseum',
    label: 'Roma (Coliseu)',
    prompt: 'Portrait at the Colosseum in Rome. Ancient architecture background. Sunny afternoon.',
    category: 'travel_scenery'
  },
  {
    id: 'egypt-explorer',
    label: 'Egito (Pirâmides)',
    prompt: 'Portrait near the Pyramids of Giza. Desert background. Adventurer vibe.',
    category: 'travel_scenery'
  },
  {
    id: 'dubai-burj',
    label: 'Dubai (Burj Khalifa)',
    prompt: 'Portrait in Dubai with Burj Khalifa in background. Modern luxury skyline.',
    category: 'travel_scenery'
  },
  {
    id: 'japan-cherry',
    label: 'Japão (Cerejeiras)',
    prompt: 'Portrait in Kyoto, Japan. Cherry blossom (Sakura) garden background. Soft pink lighting.',
    category: 'travel_scenery'
  },

  // --- HALLOWEEN / FANTASY ---
  {
    id: 'vampire',
    label: 'Vampiro Gótico',
    prompt: 'Gothic vampire portrait, pale skin, red eyes, dark castle background, moody lighting, halloween costume.',
    category: 'halloween_fantasy'
  },
  {
    id: 'elf-fantasy',
    label: 'Elfo da Floresta',
    prompt: 'High fantasy elf portrait, pointed ears, ethereal forest background, magical lighting, lord of the rings style.',
    category: 'halloween_fantasy'
  },
  {
    id: 'zombie',
    label: 'Zumbi Apocalipse',
    prompt: 'Scary zombie portrait, decaying skin, walking dead style, apocalyptic background, horror movie.',
    category: 'halloween_fantasy'
  },
  {
    id: 'wizard',
    label: 'Mago / Feiticeiro',
    prompt: 'Fantasy wizard portrait, holding a staff, magical aura, library or tower background, mystical.',
    category: 'halloween_fantasy'
  },
  {
    id: 'viking',
    label: 'Guerreiro Viking',
    prompt: 'Viking warrior portrait, face paint, furs, rugged look, cold nordic background, intense stare.',
    category: 'halloween_fantasy'
  },
  {
    id: 'joker-clown',
    label: 'Palhaço / Joker',
    prompt: 'Cosplay of a Joker-style Villain. Messy white greasepaint, smeared red lipstick smile, green hair. Purple suit.',
    category: 'halloween_fantasy'
  },
  {
    id: 'cyborg-terminator',
    label: 'Cyborg Sci-Fi',
    prompt: 'Sci-Fi Cyborg Cosplay. Metallic plate makeup prop on one side of face. Glowing eye. Futuristic armor.',
    category: 'halloween_fantasy'
  },

  // --- TIME TRAVEL ---
  {
    id: 'vintage-1920',
    label: 'Anos 20 (Peaky)',
    prompt: 'Vintage 1920s photo, sepia tone, peaky blinders style, classic suit/dress, grain, old photograph.',
    category: 'time_travel'
  },
  {
    id: 'retro-80s',
    label: 'Anos 80 (Neon)',
    prompt: '1980s synthwave style portrait, neon background, retro fashion, vhs glitch effect, bright colors.',
    category: 'time_travel'
  },
  {
    id: 'yearbook-90s',
    label: 'Yearbook Anos 90',
    prompt: '1990s high school yearbook photo, laser background, retro hairstyle, awkward smile, vintage aesthetic.',
    category: 'time_travel'
  },
  {
    id: 'victorian-era',
    label: 'Era Vitoriana (1800s)',
    prompt: '1800s Victorian era portrait, daguerreotype style, formal clothing, top hat or bonnet, antique photo.',
    category: 'time_travel'
  },
  {
    id: 'wild-west',
    label: 'Velho Oeste',
    prompt: '1800s Wild West wanted poster style, cowboy hat, dust, sepia, rugged western look.',
    category: 'time_travel'
  },
  {
    id: 'tt-ancient-egypt',
    label: 'Egito Antigo',
    prompt: 'Ancient Egypt Pharaoh/Noble. Gold jewelry, linen robes, headdresses. Temple background.',
    category: 'time_travel'
  },
  {
    id: 'tt-samurai',
    label: 'Samurai (Edo)',
    prompt: 'Edo Period Japan. Traditional Kimono or Samurai Armor. Cherry blossom garden background.',
    category: 'time_travel'
  },
  {
    id: 'tt-1950s-diner',
    label: 'Anos 50 (Diner)',
    prompt: '1950s USA Technicolor film look. Leather jacket or Polka dot dress. Retro Diner background.',
    category: 'time_travel'
  }
];

export const CLOTHING_OPTIONS: ClothingOption[] = [
  {
    id: 'original',
    label: 'Manter Roupa Original',
    prompt: 'Mantenha as roupas originais da pessoa retratada. Não troque de vestimenta.',
  },
  {
    id: 'auto-style',
    label: 'Adaptar ao Cenário (Automático)',
    prompt: 'ADAPTE AS ROUPAS À CENA. Ignore as roupas originais. O(a) modelo DEVE usar trajes que se encaixem perfeitamente no cenário/tema (ex.: roupas de inverno para neve, roupas de verão para praia, fantasia para ambiente de fantasia).',
  },
  {
    id: 'executive-suit',
    label: 'Terno Executivo (Navy/Preto)',
    prompt: `Force change clothing to a high-end tailored Navy or Black business suit with a professional silk tie and white shirt. Professional, authoritative look.`,
  },
  {
    id: 'lawyer',
    label: 'Advogado (Terno + Gravata)',
    prompt: `Force change clothing to a formal dark suit WITH a professional silk tie and white shirt. Legal professional look.`,
  },
  {
    id: 'medical',
    label: 'Médico / Jaleco',
    prompt: `Force change clothing to a professional white medical lab coat. Optional stethoscope around neck. Medical professional look.`,
  },
  {
    id: 'business-casual',
    label: 'Business Casual (Camisa)',
    prompt: `Force change clothing to a fitted button-down shirt (blue or white) or a high-quality polo. No tie.`,
  },
  {
    id: 'creative-tech',
    label: 'Criativo Tech (Gola Alta)',
    prompt: `Force change clothing to a sleek black turtleneck or modern minimalist sweater. Steve Jobs / Architect style.`,
  },
  {
    id: 'tshirt-basic',
    label: 'Camiseta Básica (Preta/Branca)',
    prompt: `Force change clothing to a clean, solid high-quality t-shirt (Black or White). Minimalist and modern.`,
  },
];

export const VIRTUAL_TRY_ON_CATEGORIES = [
    { id: 'sports', label: 'Esportes', icon: '⚽' },
    { id: 'men', label: 'Masculino', icon: '🤵' },
    { id: 'women', label: 'Feminino', icon: '💃' },
    { id: 'casual', label: 'Casual', icon: '🧢' },
    { id: 'creative', label: 'Criativo', icon: '🎨' }
];

export const VIRTUAL_TRY_ON_ITEMS = {
    sports: [
        { id: 'vto-s-soccer-br', label: 'Seleção Brasileira', prompt: 'Clothing: Official Brazil Soccer Jersey (Yellow and Green). High quality fabric texture. Nike style (approximate). NO FAKE TEXT.' },
        { id: 'vto-s-soccer-generic', label: 'Camisa de Futebol (Prompt)', prompt: 'Clothing: A generic professional soccer jersey. STYLE: [USER WILL SPECIFY COLOR]. CLEAN DESIGN. NO TEXT. NO SPONSORS.' },
        { id: 'vto-s-gym', label: 'Roupa de Academia', prompt: 'Clothing: Modern athletic gym wear. Nike/Under Armour style. Fitted.' },
        { id: 'vto-s-tracksuit', label: 'Agasalho Esportivo', prompt: 'Clothing: Full zip tracksuit jacket. Adidas style stripes. Sporty.' },
    ],
    men: [
        { id: 'vto-m-tuxedo', label: 'Smoking Black Tie', prompt: 'Clothing: A luxurious black tuxedo with a black bow tie and crisp white pleated shirt. James Bond style.' },
        { id: 'vto-m-linen', label: 'Linho Bege (Verão)', prompt: 'Clothing: A high-quality beige linen suit with a white unbuttoned shirt. Old Money summer vibe.' },
        { id: 'vto-m-leather', label: 'Jaqueta de Couro', prompt: 'Clothing: A stylish black leather motorcycle jacket over a white t-shirt. Bad boy / edgy look.' },
        { id: 'vto-m-polo-navy', label: 'Polo Navy Premium', prompt: 'Clothing: A fitted Navy Blue Ralph Lauren style polo shirt. Smart casual.' },
        { id: 'vto-m-winter', label: 'Sobretudo Lã', prompt: 'Clothing: A camel colored wool trench coat with a scarf. Winter elegance.' },
        { id: 'vto-m-cyber', label: 'Techwear Futurista', prompt: 'Clothing: Black futuristic techwear jacket with straps and high collar. Cyberpunk style.' },
    ],
    women: [
        { id: 'vto-w-blazer-white', label: 'Blazer Branco Power', prompt: 'Clothing: A chic, tailored white power suit blazer. Elegant, authoritative, CEO vibe.' },
        { id: 'vto-w-chanel', label: 'Estilo Chanel', prompt: 'Clothing: A classic tweed jacket in pastel tones with pearl necklace. French elegance.' },
        { id: 'vto-w-dress-red', label: 'Vestido de Gala Vermelho', prompt: 'Clothing: A stunning red evening gown with elegant neckline. Red carpet look.' },
        { id: 'vto-w-silk-blouse', label: 'Blusa de Seda', prompt: 'Clothing: A luxurious silk blouse in soft champagne or ivory color. Professional and feminine.' },
        { id: 'vto-w-leather', label: 'Jaqueta Couro Chic', prompt: 'Clothing: A fitted black leather jacket. Modern and edgy.' },
        { id: 'vto-w-boho', label: 'Vestido Boho Floral', prompt: 'Clothing: A flowy floral dress with bohemian vibes. Natural and relaxed.' },
    ],
    casual: [
        { id: 'vto-c-denim', label: 'Jaqueta Jeans', prompt: 'Clothing: A classic blue denim jacket over a white tee. Vintage Americana.' },
        { id: 'vto-c-hoodie', label: 'Moletom Streetwear', prompt: 'Clothing: A high-quality oversized grey hoodie. Modern streetwear aesthetic.' },
        { id: 'vto-c-flannel', label: 'Camisa Xadrez', prompt: 'Clothing: A red and black flannel shirt. Rustic / Lumberjack style.' },
        { id: 'vto-c-sweater', label: 'Suéter Tricô', prompt: 'Clothing: A cozy, chunky knit sweater in cream color. Comfort aesthetic.' },
    ],
    creative: [
        { id: 'vto-cr-astronaut', label: 'Traje Espacial', prompt: 'Clothing: A realistic white NASA astronaut space suit with detailed patches.' },
        { id: 'vto-cr-medieval', label: 'Armadura Medieval', prompt: 'Clothing: Shining silver plate armor with a royal cape. Knight style.' },
        { id: 'vto-cr-cyberpunk', label: 'Jaqueta Neon', prompt: 'Clothing: A glowing neon cyberpunk jacket with LED accents.' },
        { id: 'vto-cr-superhero', label: 'Traje de Herói', prompt: 'Clothing: A tactical superhero suit with armored texture (design your own, dark colors).' },
    ]
};
