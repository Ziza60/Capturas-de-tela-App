
import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { GlassesOption, StyleOption, UploadedFile, AspectRatioOption, ClothingOption, UserProfile, LightingOption, ExpressionOption, BeautyOption, FramingStyle, PoseOption, CameraSettings, ImageAnalysisResult } from '../types';
import { FRAMING_PROMPTS } from '../constants';

// Helper function for delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- KEY ROTATION LOGIC ---
// Detect available keys from environment variables
const API_KEYS = [
  process.env.API_KEY,
  process.env.API_KEY_2,
  process.env.API_KEY_3,
  process.env.API_KEY_4,
  process.env.API_KEY_5
].filter((key): key is string => !!key && key.length > 0);

// Gets a specific key based on attempt number (Round Robin strategy)
const getKeyForAttempt = (attemptIndex: number) => {
    if (API_KEYS.length === 0) return process.env.API_KEY || '';
    return API_KEYS[attemptIndex % API_KEYS.length];
};

export async function generateHeadshot(
  uploadedFiles: UploadedFile | UploadedFile[], // Updated to accept array
  style: StyleOption,
  glassesOption: GlassesOption | null,
  clothingOption: ClothingOption | null,
  aspectRatioOption: AspectRatioOption | null,
  userProfile?: UserProfile,
  lightingOption?: LightingOption,
  expressionOption?: ExpressionOption,
  beautyOption?: BeautyOption,
  poseOption?: PoseOption,
  is4kMode?: boolean,
  framingStyle?: FramingStyle,
  backgroundColor?: string,
  cameraSettings?: CameraSettings
): Promise<string> {
  
  // Defensive check
  if (API_KEYS.length === 0) {
    throw new Error("A variável de ambiente API_KEY não está definida.");
  }

  // Normalize to array
  const files = Array.isArray(uploadedFiles) ? uploadedFiles : [uploadedFiles];
  const primaryFile = files[0]; // Used for mimeType detection if needed, though parts handle it

  // --- STYLE CATEGORY DETECTION ---
  const isTravelMode = style.category === 'travel_scenery';
  const isHalloween = style.category === 'halloween_fantasy';
  const isCreativeMode = style.category === 'creative_artistic';
  const isTimeTravel = style.category === 'time_travel';
  
  // Detect Batch/Corporate intent based on framing style presence
  const isCorporateBatch = !!framingStyle && !isTravelMode && !isHalloween && !isCreativeMode && !isTimeTravel;

  // --- DYNAMIC CAMERA ANGLE LOGIC ---
  // We determine the angle instruction separately so it can override the default protocol
  let angleProtocol = "";
  let opticsInstruction = "";

  if (cameraSettings) {
      // 1. Angle Instruction (Overrides default anchoring)
      if (cameraSettings.angle === 'low-angle') {
          angleProtocol = `
          [CRITICAL CAMERA ANGLE: LOW ANGLE / HERO SHOT]
          - POSITION: Place the camera BELOW the subject's eye line, looking UP.
          - EFFECT: The subject should look powerful and dominant.
          - GEOMETRY: Chin slightly elevated. Broad shoulders.
          - ANCHOR: Camera at chest height, tilted up 30 degrees.
          `;
      } else if (cameraSettings.angle === 'high-angle') {
          angleProtocol = `
          [CRITICAL CAMERA ANGLE: HIGH ANGLE / SELFIE STYLE]
          - POSITION: Place the camera ABOVE the subject's eye line, looking DOWN.
          - EFFECT: The subject should look approachable and friendly.
          - GEOMETRY: Forehead slightly closer to lens. Chin tapered.
          - ANCHOR: Camera at hairline height, tilted down 30 degrees.
          `;
      } else {
          // Default Eye Level
          angleProtocol = `
          [CRITICAL: VERTICAL ANCHORING - EYE LEVEL]
          - POSITION: The subject's EYES must be positioned at the **35% to 38% height line** of the image.
          - ANGLE: Strictly 0 degrees tilt. Parallel to the face.
          `;
      }

      // 2. Aperture/Depth of Field Instruction
      let blurDesc = "";
      if (cameraSettings.depthOfField < 30) blurDesc = "f/1.2 Aperture. EXTREME BOKEH. Background must be completely creamy and unrecognizable. Subject pops out.";
      else if (cameraSettings.depthOfField > 70) blurDesc = "f/11 Aperture. Deep depth of field. Background details are visible and sharp.";
      else blurDesc = "f/5.6 Aperture. Standard professional portrait separation.";

      opticsInstruction = `
      *** LENS OPTICS SETTINGS ***
      APERTURE: ${blurDesc}
      `;
  }

  // -------------------------------------------------------------------------
  // PROTOCOL 1: CORPORATE HEADSHOT ISO STANDARD (STRICT GEOMETRY)
  // Used for: Professional, Casual Natural
  // -------------------------------------------------------------------------
  const CORPORATE_ISO_PROTOCOL = `
**PHASE 1: CORPORATE HEADSHOT ISO STANDARD (STRICT COMPOSITION)**
You are an AI Photographer enforcing a strict uniformity standard for a corporate directory.
Consistency is the #1 priority.

${angleProtocol} 

[COMPOSITION RULES]
- **HEADROOM (MANDATORY):** There MUST be a significant empty space (gap) between the top of the hair and the frame edge. DO NOT CUT THE HAIR.
- **SHOULDER VISIBILITY:** You MUST show the FULL width of the shoulders. Do not crop the deltoids.
- **NO ZOOM:** If the subject has broad shoulders or a uniform with epaulets, ZOOM OUT to fit them. DO NOT CROP THE HEAD to fit the body.

[ANATOMY CORRECTION - NECK]
- **NO GIRAFFE NECK:** Ensure the neck length is natural. The Trapezius muscles (shoulders) must be visible and anchored naturally to the neck.
- If using a suit/coat, the collar must sit on the neck base, not float around it.

[CAMERA & LENS]
- **LENS:** 85mm Portrait Lens.
- **DISTANCE:** 4.5 METERS AWAY. (Pushed back significantly to ensure headroom).
- **SHOT TYPE:** Medium Shot (Plan Américain) - Chest Up (Showing Shoulders).

[BACKGROUND CONSISTENCY]
- If a solid background is requested, it must be **FLAT and MATTE**.
- NO Vignette (dark corners). NO Spotlights (bright centers).
- The color must be uniform across all generated images in this batch.
`;

  const CORPORATE_SAFETY_BLOCKS = `
**PHASE 2: COMMERCIAL UNIFORMITY & SAFETY**
[NEGATIVE PROMPT - STRICTLY FORBIDDEN]
- **DO NOT DRAW TEXT, NUMBERS, OR GRIDS ON THE IMAGE.**
- **DO NOT ZOOM IN.**
- Do not create a "before/after" comparison.
- Do not distort hands (hide hands if possible).

[FAIL-SAFE INSTRUCTION]
If the user provided a selfie (close-up), you MUST "Zoom Out" and hallucinate the missing neck, shoulders, and chest area to match the Medium Shot protocol.
`;

  // -------------------------------------------------------------------------
  // PROTOCOL 2: TRAVEL & SCENERY (ENVIRONMENTAL PORTRAIT)
  // -------------------------------------------------------------------------
  const TRAVEL_SCENERY_PROTOCOL = `
**TRAVEL PHOTOGRAPHY PROTOCOL (ENVIRONMENTAL PORTRAIT)**
The goal is to show the subject VISITING a famous location. The Background is equally important as the Subject.

[CRITICAL: GEOMETRY & SCALING - "NO GIANT TOURIST"]
- **SUBJECT SCALE:** The subject must occupy **MAXIMUM 30%** of the frame width.
- **HIERARCHY:** The Landmark is the HERO. The person is the GUEST.
- **HEADROOM:** Leave **20-25%** empty space above the subject's head.

[SHOT TYPE: AMERICAN SHOT]
- **CROP LINE:** Crop the subject strictly at **MID-THIGH (Knees up)**.
- **DEPTH:** Infinite depth of field (Background sharp).
`;

  // -------------------------------------------------------------------------
  // PROTOCOL 3: HALLOWEEN & COSPLAY
  // -------------------------------------------------------------------------
  const HALLOWEEN_COSPLAY_PROTOCOL = `
**HALLOWEEN IDENTITY PROTOCOL**
1. DO NOT GENERATE A CELEBRITY.
2. The goal is to show the *USER* wearing a costume/makeup.
3. PRESERVE FACIAL STRUCTURE: Keep the user's nose, jawline, eye distance exactly as they are.
`;

  // -------------------------------------------------------------------------
  // PROTOCOL 4: TIME TRAVEL / PHOTO BOOTH
  // -------------------------------------------------------------------------
  const TIME_TRAVEL_PROTOCOL = `
**TIME TRAVEL PHOTO BOOTH PROTOCOL**
You are a sci-fi camera that transports the subject to a specific historical era.
1. **HISTORICAL ACCURACY:** Clothing, environment, and props must be accurate to the era.
2. **MEDIUM EMULATION (CRITICAL):**
   - Pre-1950s: Use appropriate B&W, Sepia, Daguerreotype, or Tin Type effects.
   - 1950s-1990s: Use appropriate film grain, technicolor, or VHS texture.
3. **IDENTITY PRESERVATION:** Keep the user's facial features EXACTLY as they are, but adapt hairstyle and makeup to fit the era (e.g., powdered wig for Victorian, big hair for 80s) WITHOUT changing the bone structure.
  `;

  // -------------------------------------------------------------------------
  // PROTOCOL 5: CREATIVE & STYLIZED ART (ANIME / 3D / CARICATURE)
  // -------------------------------------------------------------------------
  const CREATIVE_STYLIZATION_PROTOCOL = `
**CREATIVE DIGITAL ART PROTOCOL**
You are a Digital Artist (3D Modeler / Anime Illustrator).
Your goal is to TRANSFORM the image into a specific art style while keeping the subjects recognizable.

[GROUP PHOTO HANDLING - CRITICAL]
- **DETECT ALL FACES:** You must apply the style to EVERY person in the image.
- **UNIFORMITY:** Do not leave one person realistic and the others stylized. All must look like they belong in the same universe (e.g., all Anime or all Pixar).
- **GROUP COMPOSITION:** Keep the relative positions of the people exactly as they are in the source photo.

[GEOMETRY & STYLE PERMISSION]
- **GEOMETRY CHANGE AUTHORIZED:** You are ALLOWED to change facial proportions (eyes, nose, head shape) if the style requires it (e.g., Disney/Pixar, Anime).
- **SKIN TEXTURE:** Replace realistic skin with the target style texture (e.g., Plastic/3D, Cel-shaded/2D).
- **REALISM OFF:** Do NOT try to make it photorealistic. Make it ARTISTIC.
  `;

  // --- SELECT PROTOCOL BASED ON STYLE ---
  // Default to Corporate
  let selectedProtocol = CORPORATE_ISO_PROTOCOL + CORPORATE_SAFETY_BLOCKS;
  
  // Overrides
  if (isTravelMode) selectedProtocol = TRAVEL_SCENERY_PROTOCOL;
  if (isHalloween) selectedProtocol = HALLOWEEN_COSPLAY_PROTOCOL;
  if (isTimeTravel) selectedProtocol = TIME_TRAVEL_PROTOCOL;
  if (isCreativeMode) selectedProtocol = CREATIVE_STYLIZATION_PROTOCOL; // New override for Anime/3D

  // --- IDENTITY INSTRUCTION SELECTION ---
  // The user found that "Anime" and "3D" styles were not working for groups because the identity rules were too strict.
  // We need to relax them specifically for Creative modes.
  let identityInstruction = `
    *** CRITICAL INSTRUCTION: MAXIMUM FACE FIDELITY ***
    1. THE FACE MUST BE IDENTICAL TO THE SOURCE PHOTO. 
    2. PRESERVE IDENTITY AT ALL COSTS: Do not "beautify" or "idealize" the facial structure. 
    3. NOSE, EYES, MOUTH: Keep the exact shape, size, and distance of the features.
    4. ASYMMETRY IS REALISM: If the source face has asymmetry, KEEP IT. Do not fix it.
    5. It is better to look exactly like the user than to look "perfect" or "AI-generated".
  `;

  if (isCreativeMode) {
      identityInstruction = `
      *** CREATIVE STYLE ADAPTATION MODE ***
      1. RECOGNIZABLE IDENTITY: The subjects must be recognizable by hair, accessories, and general vibes.
      2. ADAPT FEATURES: You MUST adapt their features to the target style (Anime/3D). Big eyes, smooth skin, stylized hair are REQUIRED.
      3. GROUP CONSISTENCY: Apply this logic to ALL FACES found in the image.
      `;
  }

  // --- MULTI-SHOT INSTRUCTION ---
  let multiShotContext = "";
  if (files.length > 1) {
      multiShotContext = `
      [MULTI-SHOT REFERENCE ACTIVE]
      The user has provided ${files.length} reference photos of the SAME person.
      1. ANALYZE ALL PHOTOS: Synthesize the facial structure, eye shape, nose bridge, and jawline from all provided angles.
      2. CONSISTENCY: Do not just copy one photo. Create a 3D mental model of the subject's face and render it in the target style.
      3. This improves likeness by 200%. USE IT.
      `;
  }

  let systemInstruction = `
    You are a world-class AI Photographer and Digital Artist.
    Your goal is to generate a high-quality image based on the user's uploaded photo(s).
    
    ${identityInstruction}

    ${multiShotContext}
    ${selectedProtocol}

    GENERAL RULES:
    1. HIGH QUALITY: 8k resolution, perfect skin texture (or style texture).
    2. REMOVE ARTIFACTS: No distorted hands, glasses, or hair.
  `;

  // --- RETRY LOGIC WITH EXPONENTIAL BACKOFF & MODEL FALLBACK ---
  const MAX_RETRIES = 5;
  let lastError: any;
  
  // Cost Optimization: Default to Flash unless 4K mode is explicitly on
  let currentModel = is4kMode ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  let usingFallbackModel = false;

  // LIKENESS INSTRUCTION LOGIC
  const likenessScore = userProfile?.likenessThreshold || 60;
  let likenessInstruction = "";
  let identityEnforcementPrompt = "";

  if (isCreativeMode) {
      // Ignore user strictness for creative modes to allow style transfer
       likenessInstruction = "CREATIVE FREEDOM: Prioritize the artistic style (Anime/3D) over exact anatomical match for ALL subjects.";
       identityEnforcementPrompt = `
       *** CREATIVE STYLIZATION ACTIVE ***
       - PRIORITY: STYLE > EXACT IDENTITY.
       - You MUST transform the faces to match the art style (Anime/3D/Cartoon).
       - Do NOT output a photorealistic face.
       - Retain recognizable features (hair color, gender, glasses), but CHANGE the geometry to fit the style.
       - Apply this transformation to EVERY PERSON in the group.
       `;
  } else if (likenessScore >= 80) {
      likenessInstruction = "EXTREME IDENTITY MODE: Do NOT change a single pixel of the facial structure. Keep moles, scars, asymmetry, and exact nose shape. Realism > Beauty.";
      identityEnforcementPrompt = "*** CRITICAL: OUTPUT FACE MUST MATCH SOURCE FACE EXACTLY ***";
  } else if (likenessScore <= 30) {
      likenessInstruction = "CREATIVE IDENTITY MODE: Heavily idealize the face. Smooth skin, perfect symmetry, enhance beauty significantly. Make them look like a movie star version of themselves.";
      identityEnforcementPrompt = "OUTPUT FACE SHOULD BE AN IDEALIZED VERSION OF THE SOURCE.";
  } else {
      // Even Balanced mode should be strict now for Professional styles
      likenessInstruction = "HIGH FIDELITY BALANCED: Keep the person fully recognizable. Apply professional lighting but DO NOT change the bone structure or eye shape.";
      identityEnforcementPrompt = "*** CRITICAL: OUTPUT FACE MUST MATCH SOURCE FACE EXACTLY ***";
  }

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
        const currentKey = getKeyForAttempt(attempt);
        const ai = new GoogleGenAI({ apiKey: currentKey });
        
        // Construct the prompt parts - INTERLEAVE IMAGES
        const parts: any[] = [];
        
        // Add all images to the prompt
        files.forEach(file => {
             parts.push({ inlineData: { mimeType: file.mimeType, data: file.base64 } });
        });

        parts.push({ text: `
                TARGET STYLE: ${style.prompt}
                
                ${identityEnforcementPrompt}
                
                ${clothingOption ? `CLOTHING INSTRUCTION: ${clothingOption.prompt}` : ''}
                ${aspectRatioOption ? `ASPECT RATIO: ${aspectRatioOption.prompt}` : ''}
                
                ${backgroundColor ? `
                *** BACKGROUND OVERRIDE ***
                The user has requested a specific SOLID background color.
                TARGET COLOR HEX: ${backgroundColor}
                CRITICAL INSTRUCTION: The background MUST be this exact solid color. 
                FINISH: Matte, Flat, Uniform. 
                NO GRADIENTS, NO SHADOWS, NO TEXTURES.
                ` : ''}

                ${isCorporateBatch ? `
                *** BATCH CONSISTENCY ENFORCEMENT ***
                This is part of a company directory.
                1. IGNORE ORIGINAL CROP.
                2. ${framingStyle === 'close-up' ? FRAMING_PROMPTS['close-up'] : FRAMING_PROMPTS['chest-up']}
                3. UNIFY HEAD SIZE: Head must look proportionate to a standard 35mm sensor frame.
                ` : ''}

                ${userProfile?.gender ? `GENDER CALIBRATION: Ensure subject looks ${userProfile.gender}.` : ''}
                ${userProfile?.ageGroup ? `AGE CALIBRATION: Ensure subject looks ${userProfile.ageGroup}.` : ''}
                ${userProfile?.ethnicity ? `ETHNICITY CALIBRATION: Preserve ${userProfile.ethnicity} features.` : ''}

                *** ADVANCED STUDIO CONTROLS ***
                LIKENESS PROTOCOL: ${likenessInstruction}
                ${poseOption?.id !== 'default' ? poseOption?.prompt : ''}
                ${opticsInstruction}

                ${lightingOption?.id !== 'default' ? lightingOption?.prompt : ''}
                ${expressionOption?.id !== 'original' ? expressionOption?.prompt : ''}
                ${beautyOption?.id !== 'default' ? beautyOption?.prompt : ''}
                ${glassesOption?.prompt || ''}

                ${is4kMode && !usingFallbackModel ? 'QUALITY OVERRIDE: 8K Resolution, Ultra-High Texture Detail, Perfect Skin Shader.' : ''}

                GENERATE THE IMAGE NOW.
        `});
        
        let apiConfig: any = { systemInstruction };
        
        if (currentModel.includes('pro')) {
             apiConfig.imageConfig = {
                aspectRatio: aspectRatioOption?.id === 'portrait' ? '4:3' : 
                             aspectRatioOption?.id === 'story' ? '9:16' : 
                             aspectRatioOption?.id === 'landscape' ? '16:9' : 
                             '1:1',
                imageSize: (is4kMode && !usingFallbackModel) ? "2K" : undefined
            };
        }

        const response = await ai.models.generateContent({
            model: currentModel,
            contents: { parts },
            config: apiConfig
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        
        throw new Error("A IA não retornou nenhuma imagem. Tente novamente.");

    } catch (error: any) {
        lastError = error;
        
        const errorMsg = error.message || '';
        const isRateLimit = errorMsg.includes('429') || error.status === 429;
        const isOverloaded = errorMsg.includes('503') || error.status === 503;
        const isPermissionDenied = errorMsg.includes('403') || error.status === 403;
        const isNotFound = errorMsg.includes('404') || error.status === 404;
        const isResourceExhausted = errorMsg.includes('RESOURCE_EXHAUSTED');
        const isInvalidArgument = errorMsg.includes('400') || error.status === 400;
        
        if (errorMsg.includes('limit: 0')) {
             throw new Error("Erro de Faturamento: O plano gratuito da sua conta Google não permite gerar imagens com este modelo (Limit: 0).");
        }

        const shouldFallback = 
            (isPermissionDenied || isNotFound || isResourceExhausted) || 
            (isRateLimit && currentModel.includes('pro')) ||
            (isInvalidArgument && currentModel.includes('pro'));

        if (shouldFallback && !usingFallbackModel) {
             console.warn(`Error on Pro model (${error.status || 'Unknown'}). Switching to fallback model: gemini-2.5-flash-image`);
             currentModel = 'gemini-2.5-flash-image';
             usingFallbackModel = true;
             attempt--; 
             continue;
        }

        if (isRateLimit || isOverloaded) {
            const waitTime = API_KEYS.length > 1 ? 500 : 2000 * Math.pow(2, attempt);
            await delay(waitTime);
            continue;
        }

        if (attempt === MAX_RETRIES - 1 && !usingFallbackModel) {
            // Last ditch effort: Force Flash
            currentModel = 'gemini-2.5-flash-image';
            usingFallbackModel = true;
            attempt--;
            continue;
        }
    }
  }

  throw lastError || new Error("Falha ao gerar imagem após várias tentativas.");
}

// --- NEW FUNCTION: Generative Editing & Inpainting ---
export async function editGeneratedImage(
  base64Image: string,
  editPrompt: string,
  maskBase64?: string // Optional mask for inpainting
): Promise<string> {
    
    if (API_KEYS.length === 0) {
        throw new Error("API Key missing");
    }

    let systemInstruction = `
        You are an expert Photo Editor AI.
        Your task is to EDIT the provided image based on the user's text instruction.
        
        RULES:
        1. PRESERVE IDENTITY: Do not change the person's face structure unless explicitly asked.
        2. PRESERVE COMPOSITION: Keep the pose and camera angle unless asked to change.
        3. HIGH QUALITY: Output must be photorealistic and high resolution.
    `;

    if (maskBase64) {
        systemInstruction += `
        \n*** INPAINTING MODE ACTIVE ***
        The user has provided a MASK image (black and white).
        - WHITE areas represent the selection.
        - BLACK areas are protected.
        - YOU MUST ONLY CHANGE PIXELS inside the selection.
        - BLEND SEAMLESSLY with the surrounding protected area.
        `;
    }

    // Strategy: COST OPTIMIZATION
    // Use 'gemini-2.5-flash-image' by default as requested to reduce costs.
    let currentModel = 'gemini-2.5-flash-image';
    
    const MAX_RETRIES = 3;
    let lastError: any;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            // Key Rotation
            const currentKey = getKeyForAttempt(attempt);
            const ai = new GoogleGenAI({ apiKey: currentKey });
            
            console.log(`Editing attempt ${attempt + 1} with model ${currentModel}`);

            const parts: any[] = [
                { inlineData: { mimeType: 'image/png', data: base64Image } }
            ];

            // If mask exists, push it before the prompt
            if (maskBase64) {
                parts.push({ inlineData: { mimeType: 'image/png', data: maskBase64 } });
            }

            parts.push({ text: `Edit this image. Instruction: ${editPrompt}` });

            const response = await ai.models.generateContent({
                model: currentModel,
                contents: {
                    parts: parts
                },
                config: {
                    systemInstruction,
                }
            });

            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    return part.inlineData.data;
                }
            }
            throw new Error("No image returned from editing.");

        } catch (error: any) {
            console.error(`Edit failed on model ${currentModel}`, error);
            lastError = error;
            
            const errorMsg = error.message || '';
            const isPermissionDenied = errorMsg.includes('403') || error.status === 403 || errorMsg.includes('PERMISSION_DENIED');
            const isRateLimit = errorMsg.includes('429') || error.status === 429;
            const isOverloaded = errorMsg.includes('503') || error.status === 503;

            if (isRateLimit || isOverloaded) {
                await delay(1000 * Math.pow(2, attempt));
                continue;
            }

            if (isPermissionDenied) {
                 break; 
            }
        }
    }

    throw new Error(lastError?.message || "Falha na edição mágica. Tente novamente.");
}

export async function generateSuggestions(
  uploadedFile: UploadedFile,
  style: StyleOption
): Promise<string[]> {
    if (!process.env.API_KEY) return [];
    return [
        "Tente uma iluminação mais suave.",
        "Sorria com confiança!",
        "Use roupas contrastantes com o fundo."
    ];
}

// --- NEW FUNCTION: Image Consultant / Analyzer ---
export async function analyzeHeadshot(
  base64Image: string
): Promise<ImageAnalysisResult> {
    if (API_KEYS.length === 0) throw new Error("API Key missing");

    const ai = new GoogleGenAI({ apiKey: getKeyForAttempt(0) });

    const systemInstruction = `
    You are an Expert Image Consultant and Career Coach.
    Your job is to analyze professional headshots and provide psychological scoring and LinkedIn profile optimization.
    
    RESPONSE FORMAT: JSON ONLY.
    Structure:
    {
        "scores": {
            "professionalism": 0-100,
            "approachability": 0-100,
            "creativity": 0-100,
            "confidence": 0-100
        },
        "archetype": "string (e.g., 'The Visionary Executive')",
        "feedback": ["string", "string", "string"],
        "linkedinBio": "string (Professional summary based on the visual vibe)"
    }
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
            parts: [
                { inlineData: { mimeType: 'image/png', data: base64Image } },
                { text: "Analyze this headshot. Provide scores, an archetype name, 3 bullet points of feedback, and a LinkedIn 'About' section bio that matches this specific energy." }
            ]
        },
        config: {
            systemInstruction,
            responseMimeType: "application/json"
        }
    });
    
    const text = response.text || "{}";
    try {
        return JSON.parse(text) as ImageAnalysisResult;
    } catch (e) {
        throw new Error("Failed to parse analysis results");
    }
}
