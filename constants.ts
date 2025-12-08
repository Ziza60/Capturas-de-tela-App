
import type { GlassesOption, StyleOption, AspectRatioOption, ClothingOption, LightingOption, ExpressionOption, BeautyOption, PoseOption } from './types';

export const HEADSHOT_STYLES: StyleOption[] = [
  // --- Profissional ---
  {
    id: 'ultra-professional',
    label: 'Corporativo Ultra Profissional',
    prompt: `Create an ultra-professional corporate image.
TARGET: The subject(s) in the uploaded photo.
ACTION: Keep the identity 100% identical to the source.
BACKGROUND PROTOCOL:
- Use a **SOLID MEDIUM-DARK GREY** background (approx Hex #4a4a4a).
- The background MUST be uniform and texture-free (seamless paper look).
- NO gradients, NO office blurs, NO vignettes.
CLOTHING: High-end business suits/blazers in Dark Navy or Black.
LIGHTING: Soft studio lighting (Butterfly), even on both sides of the face.`,
    category: 'professional',
  },
  {
    id: 'conference-speaker',
    label: 'Palestrante em Conferência (TED Style)',
    prompt: `Keep the faces/snouts exactly as they are. Place the subject on a professional stage with a dark blurred background and focused spotlight lighting. Clothing: Smart-casual executive attire (blazer, turtle neck). Vibe: Authority, Leadership, TED Talk speaker.`,
    category: 'professional',
  },
  {
    id: 'actor-casting',
    label: 'Retrato de Ator / Casting',
    prompt: `Keep the faces/snouts exactly as they are. Style: Professional Actor Headshot / Casting Photo. Lighting: Cinematic, moody, or natural window light (Rembrandt). Background: Blurred texture or simple dark wall. Clothing: Simple solid t-shirt, black turtle neck, or denim shirt (focus on face structure, NO SUITS). Vibe: Charismatic, intense, personality-driven.`,
    category: 'professional',
  },
  {
    id: 'corporate-grey',
    label: 'Fundo Cinza Corporativo',
    prompt: `Keep the faces/snouts exactly as they are. 
    BACKGROUND: **Thunder Grey (Hex #454545)**.
    - It must be a SOLID, FLAT, MATTE grey.
    - STRICTLY NO GRADIENTS. NO LIGHT SPOTS. NO VIGNETTES.
    - It must look like a seamless paper backdrop in a studio.
    
    Change clothing to professional business attire (or cute pet equivalent). Apply to all subjects.`,
    category: 'professional',
  },
  {
    id: 'white-studio',
    label: 'Fundo Branco Estúdio',
    prompt: `Keep the faces/snouts exactly as they are. Change background to pure white (high-key). Change clothing to professional business attire (or cute pet equivalent). Apply to all subjects.`,
    category: 'professional',
  },
  {
    id: 'black-studio',
    label: 'Estúdio Fundo Preto (Premium)',
    prompt: `Keep the faces/snouts exactly as they are. Background: Solid deep black. Lighting: High-contrast studio lighting (chiaroscuro) to separate subject from background. Clothing: Dark or bold colors. Vibe: Elegant, premium, artistic.`,
    category: 'professional',
  },
  {
    id: 'navy-blue',
    label: 'Fundo Azul Marinho Profissional',
    prompt: `Keep the faces/snouts exactly as they are. Change background to a deep, trustworthy navy blue. Change clothing to dark professional suits (or cute pet equivalent). Apply to all subjects.`,
    category: 'professional',
  },
  {
    id: 'modern-office',
    label: 'Escritório Moderno de Tecnologia',
    prompt: `Keep the faces/snouts exactly as they are. Place the subject(s) in a blurred modern tech office background (bright, glass, plants). Change clothing to smart-casual tech attire.`,
    category: 'professional',
  },
  {
    id: 'classic-bw',
    label: 'Clássico Preto e Branco',
    prompt: `Keep the faces/snouts exactly as they are. 
    Convert the image to a high-quality Black and White professional portrait.
    
    [CRITICAL FRAMING INSTRUCTION]
    - Maintain the STANDARD corporate framing (Medium Shot).
    - DO NOT ZOOM IN ON THE FACE.
    - LEAVE HEADROOM: There must be visible space above the hair. Do not crop the top of the head.
    
    Focus on expression and contrast, but strictly respect the wide framing.`,
    category: 'professional',
  },

  // --- Casual Natural ---
  {
    id: 'old-money',
    label: 'Old Money (Luxo Discreto)',
    prompt: `Keep the faces/snouts exactly as they are. Aesthetic: "Old Money", Quiet Luxury, Ralph Lauren style. Background: An elegant country club estate, manicured garden, or polo field (blurred). Clothing: High-quality fabrics, linen shirts, cashmere sweaters in beige, cream, or white. Lighting: Soft, expensive sunlight.`,
    category: 'casual_natural',
  },
  {
    id: 'outdoor-natural',
    label: 'Luz Natural Externa',
    prompt: `Keep the faces/snouts exactly as they are. Place the subject(s) outdoors with soft natural lighting and a blurred greenery/park background. Change clothing to neat casual wear.`,
    category: 'casual_natural',
  },
  {
    id: 'cozy-cafe',
    label: 'Café Aconchegante',
    prompt: `Keep the faces/snouts exactly as they are. Place the subject(s) in a cozy, blurred coffee shop environment with warm lighting. Clothing: Smart-casual, comfortable sweaters or shirts (or cute pet equivalent).`,
    category: 'casual_natural',
  },
  {
    id: 'urban-street',
    label: 'Urbano Casual',
    prompt: `Keep the faces/snouts exactly as they are. Place the subject(s) on a blurred city street during the day with soft natural light. Clothing: Modern street style, denim jackets or casual layers (or cute pet equivalent).`,
    category: 'casual_natural',
  },
  {
    id: 'golden-hour',
    label: 'Golden Hour (Pôr do Sol)',
    prompt: `Keep the faces/snouts exactly as they are. Place the subject(s) outdoors during the golden hour (sunset). Lighting: Warm, glowing backlighting. Background: Blurred nature or open field. Clothing: Relaxed, warm-toned casual wear.`,
    category: 'casual_natural',
  },
  {
    id: 'modern-home',
    label: 'Ambiente Residencial',
    prompt: `Keep the faces/snouts exactly as they are. Place the subject(s) in a bright, airy, modern living room or home interior. Lighting: Soft window light. Clothing: Comfortable but neat casual attire.`,
    category: 'casual_natural',
  },

  // --- Viagem no Tempo (TIME TRAVEL) ---
  {
    id: 'tt-1920s',
    label: 'Anos 20: Peaky Blinders',
    prompt: `TIME TRAVEL: 1920s Birmingham/London.
    STYLE: Vintage B&W or Sepia photo, slightly grainy.
    CLOTHING: Tweed 3-piece suit with flat cap (men) or Flapper dress with pearls/headband (women).
    BACKGROUND: Foggy industrial street or elegant art deco club.
    ATMOSPHERE: Moody, serious, cinematic.`,
    category: 'time_travel',
  },
  {
    id: 'tt-viking',
    label: 'Era Viking (Nórdico)',
    prompt: `TIME TRAVEL: 9th Century Scandinavia.
    STYLE: Cinematic Historical Drama (like "Vikings" or "The Northman").
    CLOTHING: Realistic leather armor, furs, heavy wool tunics. No fantasy plastic armor.
    BACKGROUND: Misty fjord, wooden longhouse, or snowy forest.
    LIGHTING: Cold, natural, overcast light. Fire torch accents.`,
    category: 'time_travel',
  },
  {
    id: 'tt-wild-west',
    label: 'Velho Oeste (Wanted)',
    prompt: `TIME TRAVEL: 1880s American Wild West.
    STYLE: Daguerreotype / Tin Type photo style (High contrast, sepia, scratches, vintage borders).
    CLOTHING: Cowboy hat, leather duster coat, vest, bandana.
    BACKGROUND: Saloon interior or dusty desert town.
    VIBE: "Wanted Poster" or rugged pioneer portrait.`,
    category: 'time_travel',
  },
  {
    id: 'tt-1980s-retro',
    label: 'Anos 80: Neon & Synthwave',
    prompt: `TIME TRAVEL: 1980s Arcade / Mall Portrait.
    STYLE: Soft focus, film grain, slight chromatic aberration (VHS look).
    CLOTHING: Colorful windbreaker, denim jacket with pins, neon accessories. Big hair volume.
    BACKGROUND: Lasers background (School photo style) or Neon City street.
    LIGHTING: Pink and Blue rim lighting.`,
    category: 'time_travel',
  },
  {
    id: 'tt-victorian',
    label: 'Aristocracia Vitoriana',
    prompt: `TIME TRAVEL: 1890s Victorian London.
    STYLE: Formal Oil Painting or very early photography.
    CLOTHING: High collar suits, velvet, lace, corsets, top hat or intricate hats.
    BACKGROUND: Ornate library, manor house drawing room, velvet curtains.
    VIBE: Dignified, wealthy, serious.`,
    category: 'time_travel',
  },
  {
    id: 'tt-ancient-egypt',
    label: 'Egito Antigo',
    prompt: `TIME TRAVEL: Ancient Egypt Pharaoh/Noble.
    STYLE: Historical cinematic recreation.
    CLOTHING: Gold jewelry, linen robes, pectoral collars, headdresses.
    BACKGROUND: Inside a temple with hieroglyphs or desert with pyramids.
    LIGHTING: Golden sunlight and torchlight.`,
    category: 'time_travel',
  },
  {
    id: 'tt-samurai',
    label: 'Samurai (Japão Feudal)',
    prompt: `TIME TRAVEL: Edo Period Japan.
    STYLE: Historical epic movie still.
    CLOTHING: Traditional Kimono or Samurai Armor (O-yoroi).
    BACKGROUND: Cherry blossom garden or Japanese castle interior.
    VIBE: Honor, stoic, peaceful warrior.`,
    category: 'time_travel',
  },
   {
    id: 'tt-1950s-diner',
    label: 'Anos 50: Greaser/Diner',
    prompt: `TIME TRAVEL: 1950s USA.
    STYLE: Technicolor film look (vibrant red/teal).
    CLOTHING: Leather jacket and white tee (Greaser) or Polka dot dress and scarf.
    BACKGROUND: Retro Diner with checkered floor and neon sign or classic car.
    VIBE: Rock n Roll, Milkshake date.`,
    category: 'time_travel',
  },

  // --- Halloween & Fantasia ---
  {
    id: 'joker-clown',
    label: 'Coringa / Palhaço (Cosplay)',
    prompt: `Theme: COSPLAY of a Joker-style Villain.
    ***CRITICAL IDENTITY INSTRUCTION***: This is a photo of the USER wearing MAKEUP.
    IT IS NOT A MOVIE CHARACTER GENERATION. DO NOT GENERATE HEATH LEDGER OR JOAQUIN PHOENIX.
    1. FACE: Preserve the user's exact nose, chin, and eye shape. The underlying face MUST be the user's.
    2. MAKEUP: Apply messy white greasepaint ON TOP of the user's skin. The skin texture must show through the paint.
    3. DETAILS: Smeared red lipstick in a smile shape (painted on the skin, DO NOT distort the physical mouth).
    4. EYES: Dark smoky eyeshadow (do not change eye shape).
    5. HAIR: Messy green-dyed hair (apply dye to user's actual hair volume/style if possible).
    6. CLOTHING: Purple suit and green vest.
    Vibe: Amateur Cosplay, Halloween Party, Realistic Photo.`,
    category: 'halloween_fantasy',
  },
  {
    id: 'vampire-gothic',
    label: 'Vampiro Gótico (Cosplay)',
    prompt: `Theme: Realistic Vampire COSTUME.
    ACTION: The user is attending a Halloween party. Do not change their face shape.
    MAKEUP: Apply pale powder foundation and subtle contouring to the user's ACTUAL face. Add small, realistic fangs.
    EYES: Maybe add red contact lenses, but keep eye shape identical.
    CLOTHING: Elegant Victorian Gothic attire (High collar, velvet).
    VIBE: Mysterious, elegant, dark.`,
    category: 'halloween_fantasy',
  },
  {
    id: 'zombie-apocalypse',
    label: 'Zumbi Realista (SFX Horror)',
    prompt: `Theme: High-Budget Horror Movie Zombie (SFX Makeup).
    ***CRITICAL: This is the USER wearing professional PROSTHETIC makeup. Do not replace the person.***
    1. SKIN TEXTURE: Rotting, pale grey/green, mottled texture with visible veins. NOT smooth paint.
    2. WOUNDS: Add a realistic, gruesome "torn flesh" prosthetic wound to one cheek or forehead (exposed muscle effect).
    3. EYES: Change eyes to "Dead Eyes" (Cloudy white cataracts or bloodshot red sclera). This is crucial for the scary look.
    4. MOUTH: Darkened, dirty teeth and gums. Maybe some fake blood trickle.
    5. CLOTHING: Tattered, dirty, distressed survivor clothes.
    Vibe: Terrifying, gritty, realistic apocalypse. The Walking Dead style.`,
    category: 'halloween_fantasy',
  },
  {
    id: 'witch-wizard',
    label: 'Bruxa / Mago (Fantasia)',
    prompt: `Theme: High Fantasy Magic User Costume.
    ACTION: Dress the user in high-quality robes.
    PROPS: Maybe holding a glowing staff or orb.
    FACE: Natural face, perhaps with a hood slightly covering the hair but showing the face clearly.
    CLOTHING: Dark purple or black textured robes, leather accessories.
    BACKGROUND: Mystical forest or library.`,
    category: 'halloween_fantasy',
  },
  {
    id: 'cyborg-terminator',
    label: 'Cyborg / Sci-Fi (Prótese)',
    prompt: `Theme: Sci-Fi Cyborg Cosplay.
    ACTION: Apply a "metallic plate" makeup prop to ONE side of the user's face.
    IDENTITY: The other half of the face must be 100% the user's natural skin.
    EYE: One eye might be glowing red (lens), the other natural.
    CLOTHING: Futuristic armor or leather jacket.
    BACKGROUND: Neon lights, cyberpunk street.`,
    category: 'halloween_fantasy',
  },

  // --- Criativo Artístico ---
  {
    id: '3d-pixar-style',
    label: 'Avatar 3D Premium (Pixar Style)',
    prompt: `Create a premium 3D AVATAR GROUP PORTRAIT.
TARGET: ALL subjects (people) in the uploaded photo.
STYLE: Pixar-inspired stylized 3D aesthetic.

GROUP INSTRUCTIONS:
- DETECT ALL FACES.
- Apply the 3D style to EVERY PERSON in the image.
- Do not leave anyone realistic. Uniformity is key.

STYLE REQUIREMENTS:
- Soft 3D modeling with subtle stylization of facial shapes.
- Clean subsurface-scattering skin shaders (soft, natural glow).
- Realistic yet stylized textures (not overly plastic, not hyperrealistic).
- Smooth 3D lighting with global illumination feel.
- Professional cinematic lighting (key light + soft fill + rim light).
- Stylized hair rendering: volumetric, shaped strands, natural highlights.
- Slightly enhanced expressiveness: soft eyebrows, gentle cheek lighting.

EYE & FACE STYLE:
- Eyes rendered in Pixar-style 3D, with stylized character proportions (larger eyes, expressive).
- Physical reflections and catchlights, natural iris detail.
- Face stylized but stable: same jawline, bone structure, and asymmetry.

IDENTITY PRESERVATION:
Despite the stylization, the avatars MUST clearly be the same people:
- same hair geometry, facial landmarks, skin tone.
- same face shape and proportions.
- NO white outlines or sticker effects. Seamless blend.

FINAL RESULT:
A Pixar-quality 3D animated character design of the subjects, expressive and stylized, but still instantly recognizable as the original human subjects.`,
    category: 'creative_artistic',
  },
  {
    id: 'anime-style',
    label: 'Anime Japonês (Moderno)',
    prompt: `Create a HIGH-QUALITY MODERN ANIME GROUP PORTRAIT (Kyoto Animation / Makoto Shinkai aesthetic).
TARGET: ALL subjects (people) in the uploaded photo.

GROUP INSTRUCTIONS:
- DETECT ALL FACES.
- Apply the Anime style to EVERY PERSON in the image.
- Uniform art style for the whole group.

FEATURES:
- EYES: Large, expressive, and bright. Detailed irises with depth and reflections.
- EYEBROWS: Thin and arched, positioned slightly above the eyes.
- NOSE: Small and subtle, minimalist contour, almost imperceptible.
- MOUTH: Small, thin lips, slightly curved (neutral or soft smile). NOT a simple line.
- FACE SHAPE: Oval, with a slightly pointed chin and soft cheeks (youthful look).
- SKIN: Smooth, flawless, with a slight pink flush on the cheeks for liveliness.
- HAIR: Stylized, spiky yet fluid strands, falling softly over the forehead and contouring the face. Dynamic flow.
- LIGHTING: Soft contour highlights, enhancing three-dimensionality while keeping the clean anime look.

IDENTITY PRESERVATION: Keep hair color, eye color, and accessories, but ADAPT anatomy to this specific anime aesthetic for ALL subjects in the photo.`,
    category: 'creative_artistic',
  },
  {
    id: '90s-yearbook',
    label: 'Anuário Escolar Anos 90',
    prompt: `Keep the faces/snouts exactly as they are. Style: 1990s American Yearbook Photo. Background: The classic mottled blue/grey laser canvas backdrop. Lighting: Slightly harsh studio flash with soft focus. Clothing: Retro 90s turtleneck, sweater vest, or denim shirt. Effect: Add slight film grain and vintage color grading.`,
    category: 'creative_artistic',
  },
  {
    id: 'retro-filter',
    label: 'Filtro Retrô',
    prompt: `Do not change features. Apply a warm, nostalgic retro film filter to the entire image. Enhance grain and color grading for a vintage look.`,
    category: 'creative_artistic',
  },
  {
    id: 'film-noir',
    label: 'Film Noir Vintage',
    prompt: `Keep the faces/snouts exactly as they are. Render the image in dramatic 1940s Film Noir style. High contrast black and white, shadows, moody atmosphere.`,
    category: 'creative_artistic',
  },
  {
    id: 'cyberpunk-neon',
    label: 'Neon Cyberpunk',
    prompt: `Keep the subjects recognizable. Place subject(s) in a night-time cyberpunk city with neon lights (blue/pink). Lighting should reflect the neon environment.`,
    category: 'creative_artistic',
  },
  {
    id: 'art-deco',
    label: 'Retrato Art Déco',
    prompt: `Keep the subjects recognizable. Reimagine the portrait in 1920s Art Deco style. Gold geometric patterns, luxurious aesthetic.`,
    category: 'creative_artistic',
  },
  {
    id: 'oil-painting',
    label: 'Pintura a Óleo',
    prompt: `STYLE: CLASSIC OIL PAINTING ON CANVAS (Masterpiece).
TECHNIQUE: Impasto (Thick, heavy brushstrokes). Use a Palette Knife for texture.
TEXTURE: Visible canvas grain, rich paint depth, oil sheen.
LIGHTING: Dramatic painterly lighting (Chiaroscuro / Rembrandt style).
INSTRUCTION: The result must look like a physical painting found in a museum, NOT a digital photo.
IDENTITY: Capture the subject's likeness using expressive paint strokes.`,
    category: 'creative_artistic',
  },
  {
    id: 'watercolor',
    label: 'Aquarela',
    prompt: `Transform the image into a watercolor painting style. Soft blended colors, paper texture. Keep the likeness of the subjects.`,
    category: 'creative_artistic',
  },
  {
    id: 'charcoal-drawing',
    label: 'Desenho em Carvão',
    prompt: `Transform the image into a charcoal drawing style. Monochromatic, textured, sketched look. Keep the likeness of the subjects.`,
    category: 'creative_artistic',
  },
  {
    id: 'comic-book',
    label: 'Personagem de Comic Book (HQ)',
    prompt: `Style: Modern Comic Book art (Marvel/DC style). PRIORITY: The faces/snouts MUST remain identical to the source photo. Do not create new faces. Apply ink lines and cel-shading to the existing subjects.`,
    category: 'creative_artistic',
  },
  {
    id: 'astronaut',
    label: 'Astronauta no Espaço',
    prompt: `Keep the faces/snouts exactly as they are. Place the subject(s) inside realistic astronaut suits/helmets floating in space. Background: Stars and nebulae.`,
    category: 'creative_artistic',
  },
  {
    id: 'viking',
    label: 'Guerreiro(a) Viking',
    prompt: `Keep the faces/snouts exactly as they are. Dress the subject(s) in realistic Viking armor/furs. Background: Nordic landscape. Do not alter facial/snout features.`,
    category: 'creative_artistic',
  },
  {
    id: '80s-style',
    label: 'Estilo Anos 80',
    prompt: `Keep the faces/snouts exactly as they are. Apply an 1980s aesthetic: neon clothing, big hair styling (if applicable), retro background patterns.`,
    category: 'creative_artistic',
  },
  {
    id: 'medieval-fantasy',
    label: 'Fantasia Medieval',
    prompt: `Keep the faces/snouts exactly as they are. Dress the subject(s) in medieval fantasy attire (robes, armor). Background: Fantasy forest or castle.`,
    category: 'creative_artistic',
  },

  // --- Viagem Cenários ---
  {
    id: 'rio-cristo',
    label: 'Cristo Redentor (Rio)',
    prompt: `Keep the faces/snouts exactly as they are. Place the subject(s) visiting the Christ the Redeemer statue in Rio de Janeiro. Background: The massive iconic statue and a view of the city/clouds. Lighting: Bright, sunny tropical light. Clothing: Casual summer attire (light fabrics, sunglasses optional).`,
    category: 'travel_scenery',
  },
  {
    id: 'rio-sugarloaf',
    label: 'Pão de Açúcar (Rio)',
    prompt: `Keep the faces/snouts exactly as they are. Place the subject(s) in Rio de Janeiro with the Sugarloaf Mountain (Pão de Açúcar) and Guanabara Bay prominently in the background. Lighting: Beautiful sunny day or sunset over the bay. Clothing: Relaxed tourist/summer fashion.`,
    category: 'travel_scenery',
  },
  {
    id: 'paris-chic',
    label: 'Chique Parisiense',
    prompt: `Keep the faces/snouts exactly as they are. Place the subject(s) in Paris with the Eiffel Tower in background. Clothing: Stylish winter/fall coats or chic casual wear.`,
    category: 'travel_scenery',
  },
  {
    id: 'santorini-summer',
    label: 'Verão em Santorini',
    prompt: `Keep the faces/snouts exactly as they are. Place the subject(s) in Santorini, Greece (white buildings, blue sea). Clothing: Light summer wear (linen, white).`,
    category: 'travel_scenery',
  },
  {
    id: 'egypt-explorer',
    label: 'Explorador(a) no Egito',
    prompt: `Keep the faces/snouts exactly as they are. Place the subject(s) near the Pyramids of Giza. Clothing: Safari/Desert adventurer gear.`,
    category: 'travel_scenery',
  },
  {
    id: 'alpine-adventure',
    label: 'Aventura Alpina',
    prompt: `Keep the faces/snouts exactly as they are. Place the subject(s) in the snowy Swiss Alps. Clothing: Winter ski jackets and beanies.`,
    category: 'travel_scenery',
  },
  {
    id: 'rome-colosseum',
    label: 'Turista em Roma',
    prompt: `Keep the faces/snouts exactly as they are. Place the subject(s) at the Colosseum in Rome. Clothing: Casual tourist attire.`,
    category: 'travel_scenery',
  },
  {
    id: 'dubai-burj-khalifa',
    label: 'Luxo em Dubai',
    prompt: `Keep the faces/snouts exactly as they are. Place the subject(s) in Dubai with Burj Khalifa in background. Clothing: High-end luxury evening wear.`,
    category: 'travel_scenery',
  },
  {
    id: 'china-temple',
    label: 'Templo do Céu (China)',
    prompt: `Keep the faces/snouts exactly as they are. Place the subject(s) at the Temple of Heaven in Beijing. Background: The iconic circular Hall of Prayer for Good Harvests. Lighting: Clear bright day. Clothing: Casual tourist attire.`,
    category: 'travel_scenery',
  },
  {
    id: 'pisa-tower',
    label: 'Torre de Pisa (Itália)',
    prompt: `Keep the faces/snouts exactly as they are. Place the subject(s) in front of the Leaning Tower of Pisa in Italy. Background: The famous leaning bell tower and blue sky. Lighting: Sunny afternoon. Clothing: Relaxed summer travel wear.`,
    category: 'travel_scenery',
  },
  {
    id: 'venice-canal',
    label: 'Canais de Veneza',
    prompt: `Keep the faces/snouts exactly as they are. Place the subject(s) on a gondola or bridge in Venice. Background: Historic canals, water, and Italian architecture. Lighting: Golden hour romantic light. Clothing: Stylish smart-casual.`,
    category: 'travel_scenery',
  },
  {
    id: 'india-tajmahal',
    label: 'Taj Mahal (Índia)',
    prompt: `Keep the faces/snouts exactly as they are. Place the subject(s) in front of the Taj Mahal in Agra, India. Background: The majestic white marble mausoleum and reflecting pool. Lighting: Soft morning light. Clothing: Respectful, elegant travel attire.`,
    category: 'travel_scenery',
  },
];

export const CLOTHING_OPTIONS: ClothingOption[] = [
  {
    id: 'original',
    label: 'Manter Roupa Original',
    prompt: `Keep the subject's original clothing. Do not change attire.`,
  },
  {
    id: 'auto-style',
    label: 'Adaptar ao Cenário (Automático)',
    prompt: `ADAPT CLOTHING TO THE SCENE. Ignore original clothing. The subject MUST wear attire that fits the background location/theme perfectly (e.g., Winter clothes for snow, Summer clothes for beach, Costume for fantasy).`,
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

// --- TEAM UNIFORMS (EXPANDED BRAND KIT) ---
const STANDARD_FRAMING = `
    *** CORPORATE UNIFORM GEOMETRY (ISO) ***
    ORIENTATION: STRICT FRONTAL.
    SHOULDERS: Broad, Square, and Symmetric.
    HEAD SIZE: Normalized to 35-40% of image height.
    
    *** UNIFORM ALIGNMENT ***
    The shirt/suit collar must be centered.
    The chest area must be flat and facing forward (for logo placement).
`;

export const TEAM_UNIFORMS: ClothingOption[] = [
  // 1. Executivo / Financeiro
  {
    id: 'corp-grey-suit',
    label: 'Executivo: Terno Cinza + Azul',
    prompt: `UNIFORM PROTOCOL: Force ALL subjects to wear an identical tailored Charcoal Grey business suit with a light blue dress shirt. No tie for women, Navy Blue tie for men. 
    ${STANDARD_FRAMING}
    LOGO ZONE: Ensure the lapel/chest area is unobstructed and facing forward.
    NO LOGOS, NO TEXT.`,
  },
  {
    id: 'corp-black-suit-red',
    label: 'Executivo Formal: Terno Preto + Gravata Vermelha',
    prompt: `UNIFORM PROTOCOL: Force ALL subjects to wear an identical Black business suit, crisp white shirt. Men MUST wear a solid Red Tie. Women wear a black blazer over white blouse.
    ${STANDARD_FRAMING}
    LOGO ZONE: Ensure the lapel/chest area is unobstructed.
    NO LOGOS, NO TEXT.`,
  },
  // 2. Administrativo
  {
    id: 'corp-beige-blazer',
    label: 'Administrativo: Blazer Bege',
    prompt: `UNIFORM PROTOCOL: Force ALL subjects to wear an identical Beige/Tan Blazer over a clean white shirt. Smart-casual, approachable, bright.
    ${STANDARD_FRAMING}
    LOGO ZONE: Ensure left/right chest is visible and flat for logo placement.
    NO LOGOS, NO TEXT.`,
  },
  // 3. Atendimento
  {
    id: 'corp-white-shirt',
    label: 'Comercial: Camisa Social Branca (Sem Terno)',
    prompt: `UNIFORM PROTOCOL: Force ALL subjects to wear an identical crisp White Button-Down Dress Shirt (No Jacket/Blazer). Top button open. Clean, airy, friendly.
    ${STANDARD_FRAMING}
    LOGO ZONE: Ensure the chest pocket area is clearly visible and not folded.
    NO LOGOS, NO TEXT.`,
  },
  // 4. Tech / Startup
  {
    id: 'tech-polo-grey',
    label: 'Tech: Polo Cinza (Detalhe Laranja)',
    prompt: `UNIFORM PROTOCOL: Force ALL subjects to wear an identical Grey Modern Polo Shirt. Minimalist startup vibe.
    ${STANDARD_FRAMING}
    LOGO ZONE: Ensure the chest area is flat and unobstructed for logo placement.
    NO LOGOS, NO TEXT.`,
  },
  {
    id: 'corp-black-blazer',
    label: 'Tech: Blazer Preto + Camiseta',
    prompt: `UNIFORM PROTOCOL: Force ALL subjects to wear an identical Modern Tech look: Black fitted blazer over a high-quality heather grey t-shirt. Smart-casual uniformity.
    ${STANDARD_FRAMING}
    LOGO ZONE: Ensure the blazer lapel does not cover the t-shirt chest area too much.
    NO LOGOS, NO TEXT.`,
  },
  // 5. Operacional
  {
    id: 'ops-polo-green',
    label: 'Operacional: Polo Verde',
    prompt: `UNIFORM PROTOCOL: Force ALL subjects to wear an identical Solid Forest Green Polo Shirt. Practical, uniform look.
    ${STANDARD_FRAMING}
    LOGO ZONE: Left/Right chest must be visible and square to camera.
    NO LOGOS, NO TEXT.`,
  },
  {
    id: 'ops-polo-orange',
    label: 'Operacional: Polo Laranja',
    prompt: `UNIFORM PROTOCOL: Force ALL subjects to wear an identical Solid Bright Orange Polo Shirt. High visibility, logistics vibe.
    ${STANDARD_FRAMING}
    LOGO ZONE: Left/Right chest must be visible and square to camera.
    NO LOGOS, NO TEXT.`,
  },
  {
    id: 'corp-polo-blue',
    label: 'Padrão: Polo Azul Royal',
    prompt: `UNIFORM PROTOCOL: Force ALL subjects to wear an identical Royal Blue company polo shirt. Clean, neat, ironed.
    ${STANDARD_FRAMING}
    LOGO ZONE: Ensure the chest area is flat and unobstructed.
    CRITICAL: SOLID BLUE COLOR ONLY. NO EXISTING LOGOS. NO TEXT. NO EMBLEMS.`,
  },
  // 6. Saúde
  {
    id: 'medical-white-coat',
    label: 'Saúde: Jaleco Branco + Estetoscópio',
    prompt: `UNIFORM PROTOCOL: Force ALL subjects to wear a Professional White Medical Lab Coat over **NAVY BLUE** scrubs.
    
    *** MEDICAL UNIFORM ANATOMY FIX ***
    1. STETHOSCOPE WEIGHT: The stethoscope MUST REST HEAVILY on the base of the neck/shoulders. It should NOT look like a floating necklace. 
    2. NECK LENGTH: Ensure the neck looks NATURAL. Do not elongate the neck to fit the stethoscope. If space is tight, lower the shoulders.
    3. FABRIC: Heavy Cotton White Coat texture to avoid white blowout.
    
    *** GENDER SPECIFIC ***
    - FOR WOMEN: Widen the shot to show the shoulders fully. 
    
    ${STANDARD_FRAMING}
    LOGO ZONE: Ensure the chest pocket area of the Lab Coat is FLAT and VISIBLE for badge placement.
    NO LOGOS, NO TEXT.`,
  },
  {
    id: 'medical-polo-blue',
    label: 'Saúde Casual: Polo Azul Claro',
    prompt: `UNIFORM PROTOCOL: Force ALL subjects to wear an identical Light Baby Blue Polo Shirt. Vibe: Dental Clinic, Physiotherapy, Lab.
    ${STANDARD_FRAMING}
    LOGO ZONE: Clean chest area.
    NO LOGOS, NO TEXT.`,
  },
  // 7. Engenharia / Indústria
  {
    id: 'eng-overall-helmet',
    label: 'Engenharia: Macacão + Capacete',
    prompt: `UNIFORM PROTOCOL: Force ALL subjects to wear Blue/Orange Industrial Workwear (Coveralls) and a White Hard Hat.
    
    *** GEOMETRY OVERRIDE (ISO) ***
    DO NOT ZOOM OUT TO FIT THE HELMET.
    Crop the helmet if necessary.
    The Eyes MUST be at the 44% line.
    
    LOGO ZONE: The chest area MUST be flat and clear.
    NO LOGOS, NO TEXT.`,
  },
  // 8. Segurança
  {
    id: 'security-navy',
    label: 'Segurança: Uniforme Tático Azul',
    prompt: `UNIFORM PROTOCOL: Force ALL subjects to wear a Tactical Navy Blue Security Pilot Shirt.
    
    *** CRITICAL: SHOULDER EPAULETS (PLATINAS) ***
    - The subject MUST have RIGID SHOULDER BOARDS (Epaulets) on both shoulders.
    - Each Epaulet must have TWO DISTINCT WHITE STRIPES (Bars).
    - The stripes must be horizontal, clearly visible, and located on the shoulders.

    *** GEOMETRY OVERRIDE: WIDE FRAMING ***
    - ZOOM OUT to show the FULL WIDTH of the shoulders.
    - DO NOT CROP the shoulders. The Epaulets must be fully inside the frame.
    - HEAD SIZE: Target 30% of image height (Smaller than standard to allow shoulder width).
    - HEADROOM: Leave 20% empty space above the hair.

    ${STANDARD_FRAMING}
    LOGO ZONE: Clean chest area.
    NO LOGOS (User will add).`,
  },
  // 9. Hotelaria
  {
    id: 'hospitality-bowtie',
    label: 'Hotelaria: Colete + Borboleta',
    prompt: `UNIFORM PROTOCOL: Force ALL subjects to wear a Black Vest over a white shirt with a Black Bow Tie. Vibe: High-end Waiter, Bartender, Concierge.
    
    *** HOSPITALITY SPECIFIC ANTI-ZOOM ***
    - The Bow Tie detail often causes the camera to zoom in. PREVENT THIS.
    - SHOW THE WAISTCOAT (VEST) BUTTONS.
    - Frame from MID-CHEST or WAIST up. Do NOT frame from collarbone up.
    
    ${STANDARD_FRAMING}
    LOGO ZONE: Ensure the vest chest area is visible for logo.
    NO LOGOS, NO TEXT.`,
  },
  // 10. Varejo
  {
    id: 'retail-tshirt',
    label: 'Varejo: Camiseta Preta + Crachá',
    prompt: `UNIFORM PROTOCOL: Force ALL subjects to wear a Solid Black T-Shirt. MUST include a blank Lanyard/ID Strap around the neck.
    ${STANDARD_FRAMING}
    LOGO ZONE: Ensure the chest area is visible (do not let lanyard cover the logo spot).
    NO LOGOS, NO TEXT.`,
  },
  // 11. Educação
  {
    id: 'edu-shirt',
    label: 'Educação: Camisa Social Azul',
    prompt: `UNIFORM PROTOCOL: Force ALL subjects to wear a Light Blue Oxford Shirt. Neat, teacher/academic look.
    ${STANDARD_FRAMING}
    LOGO ZONE: Pocket area must be clear.
    NO LOGOS, NO TEXT.`,
  },
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

export const GLASSES_OPTIONS: GlassesOption[] = [
  {
    id: 'none',
    label: 'Original',
    prompt: '',
  },
  {
    id: 'remove',
    label: 'Remover Óculos',
    prompt: `If subjects are wearing glasses, remove them and reconstruct the eyes naturally. If not, do nothing.`,
  },
  {
    id: 'add-sunglasses',
    label: 'Adicionar Óculos de Sol',
    prompt: `Add stylish sunglasses to all subjects.`,
  },
];

export const ASPECT_RATIO_OPTIONS: AspectRatioOption[] = [
  {
    id: 'square',
    label: 'Quadrado (1:1)',
    prompt: `Aspect Ratio: Square (1:1).`,
    className: 'aspect-square',
  },
  {
    id: 'portrait',
    label: 'Retrato (4:5)',
    prompt: `Aspect Ratio: Vertical (4:5).`,
    className: 'aspect-[4/5]',
  },
  {
    id: 'story',
    label: 'Story (9:16)',
    prompt: `Aspect Ratio: Vertical Story (9:16).`,
    className: 'aspect-[9/16]',
  },
   {
    id: 'landscape',
    label: 'Paisagem (16:9)',
    prompt: `Aspect Ratio: Landscape (16:9).`,
    className: 'aspect-video',
  },
];

// --- NEW CONSTANTS FOR CALIBRATION ---

export const LIGHTING_OPTIONS: LightingOption[] = [
  { id: 'default', label: 'Padrão do Estilo', prompt: '' },
  { id: 'soft', label: 'Suave & Difusa', prompt: `LIGHTING OVERRIDE: Soft, diffused window light. Flattering, minimal shadows.` },
  { id: 'dramatic', label: 'Dramática / Cinema', prompt: `LIGHTING OVERRIDE: Cinematic, high-contrast lighting. Moody atmosphere with rim light.` },
  { id: 'studio', label: 'Estúdio Profissional', prompt: `LIGHTING OVERRIDE: Perfectly balanced studio strobe lighting. Crisp and professional.` },
  { id: 'warm', label: 'Quente / Golden', prompt: `LIGHTING OVERRIDE: Warm, golden hour tone. Inviting and friendly.` },
];

export const EXPRESSION_OPTIONS: ExpressionOption[] = [
  { id: 'original', label: 'Original', prompt: '' },
  { id: 'smile', label: 'Sorriso Confiante', prompt: `EXPRESSION OVERRIDE: The subject must have a warm, confident professional smile. Show teeth slightly if natural.` },
  { id: 'neutral', label: 'Sério / Neutro', prompt: `EXPRESSION OVERRIDE: The subject must have a calm, neutral, and authoritative expression. Mouth closed.` },
  { id: 'approachable', label: 'Amigável (Soft Smile)', prompt: `EXPRESSION OVERRIDE: The subject must look approachable and kind. Very soft smile, no teeth showing.` },
];

export const BEAUTY_OPTIONS: BeautyOption[] = [
  { id: 'default', label: 'Padrão', prompt: '' },
  { id: 'natural', label: 'Natural (Sem make)', prompt: `BEAUTY OVERRIDE: No makeup look. Clean, hydrated skin texture. Keep natural imperfections.` },
  { id: 'matte', label: 'Matte / Profissional', prompt: `BEAUTY OVERRIDE: Professional matte finish. Reduce shine/oiliness. Even skin tone. Subtle grooming.` },
  { id: 'glamour', label: 'Glamour / Retoque', prompt: `BEAUTY OVERRIDE: High-end beauty retouch. Flawless skin, accentuated eyes, perfect grooming. Magazine quality.` },
];

export const POSE_OPTIONS: PoseOption[] = [
    { 
        id: 'default', 
        label: 'Original / Natural', 
        prompt: '' 
    },
    { 
        id: 'arms-crossed', 
        label: 'Braços Cruzados', 
        prompt: 'POSE INSTRUCTION: The subject must have their arms crossed confidently over their chest. Power pose. Ensure hands/fingers are rendered correctly or hidden.',
        icon: '🙅'
    },
    { 
        id: 'hand-chin', 
        label: 'Mão no Queixo', 
        prompt: 'POSE INSTRUCTION: The subject is resting their chin gently on one hand. Thinking / Contemplative pose. Ensure the hand anatomy is perfect.',
        icon: '🤔'
    },
    { 
        id: 'hands-pockets', 
        label: 'Mãos no Bolso', 
        prompt: 'POSE INSTRUCTION: The subject is standing with hands casually in their pockets. Relaxed, approachable stance.',
        icon: '👖'
    },
    { 
        id: 'leaning-forward', 
        label: 'Inclinado (Engajado)', 
        prompt: 'POSE INSTRUCTION: The subject is leaning slightly forward towards the camera. Engaging, listening pose. Shallow depth of field.',
        icon: '👀'
    },
    {
        id: 'side-profile',
        label: 'Perfil Lateral (45°)',
        prompt: 'POSE INSTRUCTION: The subject is turned 45 degrees to the side, looking back at the camera. Dynamic shoulder angle.',
        icon: '👤'
    }
];

export const AGE_OPTIONS = [
  { value: '', label: 'Detecção Automática' },
  { value: '20s', label: '20-29 anos' },
  { value: '30s', label: '30-39 anos' },
  { value: '40s', label: '40-49 anos' },
  { value: '50s', label: '50-59 anos' },
  { value: '60+', label: '60+ anos' },
];

export const GENDER_OPTIONS = [
  { value: '', label: 'Detecção Automática' },
  { value: 'Male', label: 'Masculino' },
  { value: 'Female', label: 'Feminino' },
  { value: 'Non-binary', label: 'Não-binário' },
  { value: 'ETHNICITY_OPTIONS', label: 'Detecção Automática' },
];

export const ETHNICITY_OPTIONS = [
  { value: '', label: 'Detecção Automática' },
  { value: 'Latin', label: 'Latino / Hispânico' },
  { value: 'Caucasian', label: 'Branco / Caucasiano' },
  { value: 'Black', label: 'Negro / Afrodescendente' },
  { value: 'Asian', label: 'Asiático' },
  { value: 'Middle Eastern', label: 'Oriente Médio' },
  { value: 'Indian', label: 'Indiano / Sul-asiático' },
  { value: 'Mixed', label: 'Mestiço / Multirracial' },
];
