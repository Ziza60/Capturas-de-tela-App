
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
  const isUtilitiesMode = style.category === 'utilities'; // Novo modo detectado
  
  // New Helper: Is this professional style actually environmental?
  // office-modern, tech-startup, real-estate, etc.
  const isEnvironmentalProfessional = [
      'office-modern', 
      'tech-startup', 
      'real-estate', 
      'conference-speaker', 
      'outdoor-park', 
      'urban-street',
      'coffee-shop'
  ].includes(style.id);

  // Detect Batch/Corporate intent based on framing style presence
  const isCorporateBatch = !!framingStyle && !isTravelMode && !isHalloween && !isCreativeMode && !isTimeTravel && !isUtilitiesMode;

  // --- CLOTHING REFERENCE DETECTION (NEW) ---
  const hasClothingReference = clothingOption?.id === 'custom-ref-image' && !!clothingOption.referenceImage;

  // --- DYNAMIC CAMERA ANGLE LOGIC ---
  let angleProtocol = "";
  let opticsInstruction = "";

  if (cameraSettings) {
      if (cameraSettings.angle === 'low-angle') {
          angleProtocol = `
          [CRITICAL CAMERA ANGLE: LOW ANGLE / HERO SHOT]
          - POSITION: Place the camera BELOW the subject's eye line, looking UP.
          - EFFECT: The subject should look powerful and dominant.
          - ANCHOR: Camera at chest height, tilted up 30 degrees.
          `;
      } else if (cameraSettings.angle === 'high-angle') {
          angleProtocol = `
          [CRITICAL CAMERA ANGLE: HIGH ANGLE / SELFIE STYLE]
          - POSITION: Place the camera ABOVE the subject's eye line, looking DOWN.
          - EFFECT: The subject should look approachable and friendly.
          - ANCHOR: Camera at hairline height, tilted down 30 degrees.
          `;
      } else {
          angleProtocol = `
          [CRITICAL: VERTICAL ANCHORING - EYE LEVEL]
          - POSITION: The subject's EYES must be positioned at the **35% to 38% height line** of the image.
          - ANGLE: Strictly 0 degrees tilt. Parallel to the face.
          `;
      }

      let blurDesc = "";
      if (cameraSettings.depthOfField < 30) blurDesc = "f/1.2 Aperture. EXTREME BOKEH. Background must be completely creamy and unrecognizable.";
      else if (cameraSettings.depthOfField > 70) blurDesc = "f/11 Aperture. Deep depth of field. Background details are visible and sharp.";
      else blurDesc = "f/5.6 Aperture. Standard professional portrait separation.";

      opticsInstruction = `
      *** LENS OPTICS SETTINGS ***
      APERTURE: ${blurDesc}
      `;
  }

  // -------------------------------------------------------------------------
  // PROTOCOL 0: STRICT IDENTITY PRESERVATION (NEW)
  // -------------------------------------------------------------------------
  const STRICT_IDENTITY_PROTOCOL = `
  *** STRICT IDENTITY PRESERVATION PROTOCOL (PRIORITY ZERO) ***
  1. **PHYSIOGNOMY LOCK:** You MUST preserve the exact bone structure, nose shape, eye distance, and jawline of the source image.
  2. **MICRO-FEATURES:** Do NOT remove moles, scars, birthmarks, or facial asymmetry. These are critical for recognition.
  3. **NO "AI FACE":** Do not generate a generic "perfect" face. If the subject has a crooked nose or asymmetric eyes, KEEP THEM.
  4. **RECOGNITION TEST:** The output must be immediately recognizable to the subject's family.
  5. **MAPPING:** Map the source face pixels onto the new lighting/body context without distorting the geometry.
  6. **FIDELITY OVERRIDE:** If the style conflicts with the face shape, the face shape WINS.
  `;

  // -------------------------------------------------------------------------
  // PROTOCOL 1: PROFESSIONAL PORTRAIT PROTOCOL (RENAMED FROM ISO)
  // -------------------------------------------------------------------------
  const PROFESSIONAL_PORTRAIT_PROTOCOL = `
**PHASE 1: PROFESSIONAL PORTRAIT PROTOCOL**
You are an AI Photographer creating premium corporate portraits.

${STRICT_IDENTITY_PROTOCOL}
${angleProtocol} 

[BODY & COMPOSITION WORKFLOW]
1. **FACE ANCHOR:** Start with the source face geometry. Do not warp it.
2. **BODY GENERATION:** Generate a professional body (suit/blazer) that fits the head's scale and angle.
3. **SKIN MATCHING:** Ensure the neck and chest skin tone matches the face perfectly.
4. **FRAMING:** Adhere to the requested aspect ratio and framing.

[BACKGROUND LOGIC]
1. ANALYZE THE TARGET STYLE.
2. DOES IT SPECIFY A LOCATION (Office, City, Park)? -> GENERATE REALISTIC DEPTH-OF-FIELD BACKGROUND.
3. DOES IT SPECIFY A COLOR (Grey, White, Black)? -> GENERATE SOLID STUDIO BACKGROUND.
4. DEFAULT: If unspecified, use a soft, neutral, expensive-looking gradient.

[SCALE ENFORCEMENT]
- **WIDTH RULE:** The subject's shoulders MUST fill ~85% of the image width (for chest-up).
- **HEAD SIZE:** Ensure the head is proportional to the body.
`;

  const CORPORATE_SAFETY_BLOCKS = `
**PHASE 2: COMMERCIAL UNIFORMITY & SAFETY**
[NEGATIVE PROMPT]
- **DO NOT** deform hands or eyes.
- **DO NOT** add text or watermarks.
- **DO NOT** change the subject's ethnicity or age (unless calibration requested).
`;

  // -------------------------------------------------------------------------
  // PROTOCOL 2: TRAVEL & SCENERY
  // -------------------------------------------------------------------------
  const TRAVEL_SCENERY_PROTOCOL = `
**TRAVEL PHOTOGRAPHY PROTOCOL**
${STRICT_IDENTITY_PROTOCOL}
The goal is to show the subject VISITING a famous location.

[GEOMETRY & SCALING]
- **SUBJECT SCALE:** Subject occupies max 30-40% of frame width.
- **HIERARCHY:** Balanced focus between Subject and Landmark.
- **DEPTH:** Background is visible but may have slight depth of field.
`;

  // -------------------------------------------------------------------------
  // PROTOCOL 3: HALLOWEEN & COSPLAY
  // -------------------------------------------------------------------------
  const HALLOWEEN_COSPLAY_PROTOCOL = `
**HALLOWEEN IDENTITY PROTOCOL**
${STRICT_IDENTITY_PROTOCOL}
1. DO NOT GENERATE A CELEBRITY.
2. The goal is to show the *USER* wearing a costume/makeup.
3. PRESERVE FACIAL STRUCTURE: Apply makeup/masks *over* the face, do not replace the face.
`;

  // -------------------------------------------------------------------------
  // PROTOCOL 4: TIME TRAVEL
  // -------------------------------------------------------------------------
  const TIME_TRAVEL_PROTOCOL = `
**TIME TRAVEL PHOTO BOOTH PROTOCOL**
${STRICT_IDENTITY_PROTOCOL}
1. **HISTORICAL ACCURACY:** Clothing/Environment must be accurate.
2. **MEDIUM EMULATION:** Use period-correct film grain/texture (Sepia, B&W, Technicolor).
3. **ADAPTATION:** Adapt hairstyle/makeup to the era, but keep the FACE GEOMETRY intact.
  `;

  // -------------------------------------------------------------------------
  // PROTOCOL 5: CREATIVE (RELAXED IDENTITY)
  // -------------------------------------------------------------------------
  const CREATIVE_STYLIZATION_PROTOCOL = `
**CREATIVE DIGITAL ART PROTOCOL**
You are a Digital Artist (3D Modeler / Anime Illustrator).
TARGET: TRANSFORM the image into the requested art style.

[IDENTITY ADAPTATION]
- **RELAXED GEOMETRY:** You are allowed to change facial proportions (eyes, head shape) to fit the art style (e.g. Big Anime Eyes).
- **RECOGNIZABLE FEATURES:** Keep hair color, glasses, and general "vibe", but priority is the STYLE.
  `;
  
  // -------------------------------------------------------------------------
  // PROTOCOL 6: BIOMETRIC ID / PASSPORT
  // -------------------------------------------------------------------------
  const UTILITIES_ID_PROTOCOL = `
**BIOMETRIC ID DOCUMENT PROTOCOL (ISO/IEC 19794-5)**
${STRICT_IDENTITY_PROTOCOL}
Your goal is to generate a valid ID photo.

[GEOMETRY & FRAMING RULES]
1. **FACE COVERAGE:** Head occupies 70-80% of image height.
2. **EXPRESSION:** Neutral. Mouth closed. Eyes open.
3. **LIGHTING:** Flat, shadowless visibility.
`;

  // --- SELECT PROTOCOL BASED ON STYLE ---
  let selectedProtocol = PROFESSIONAL_PORTRAIT_PROTOCOL + CORPORATE_SAFETY_BLOCKS;
  
  if (isTravelMode) selectedProtocol = TRAVEL_SCENERY_PROTOCOL;
  if (isHalloween) selectedProtocol = HALLOWEEN_COSPLAY_PROTOCOL;
  if (isTimeTravel) selectedProtocol = TIME_TRAVEL_PROTOCOL;
  if (isCreativeMode) selectedProtocol = CREATIVE_STYLIZATION_PROTOCOL;
  if (isUtilitiesMode) selectedProtocol = UTILITIES_ID_PROTOCOL;

  // --- MULTI-SHOT INSTRUCTION ---
  let multiShotContext = "";
  if (files.length > 1) {
      multiShotContext = `
      [MULTI-SHOT REFERENCE ACTIVE]
      The user has provided ${files.length} reference photos of the SAME person.
      1. SYNTHESIZE: Combine features from all angles to build an accurate 3D mental model.
      2. CONSISTENCY: Use the most flattering features common to all photos.
      3. LIKENESS BOOST: This helps you understand the true shape of the nose and jaw. Use it.
      `;
  }
  
  // --- BACKGROUND INSTRUCTION ---
  // If it's an environmental pro style, force it.
  let backgroundInstruction = "";
  if (isEnvironmentalProfessional) {
      backgroundInstruction = `
      *** FORCE ENVIRONMENTAL BACKGROUND ***
      - DO NOT generate a solid studio background.
      - GENERATE A REAL SCENE with depth (Bokeh).
      - Context: ${style.label}
      `;
  } else if (backgroundColor) {
      backgroundInstruction = `
      *** BACKGROUND OVERRIDE ***
      TARGET COLOR HEX: ${backgroundColor}
      Finish: Matte, Flat, Uniform.
      `;
  }

  let systemInstruction = `
    You are a world-class AI Photographer.
    Your PRIMARY OBJECTIVE is to generate a high-quality image of the provided subject.
    
    ${multiShotContext}
    ${selectedProtocol}
    ${backgroundInstruction}

    GENERAL RULES:
    1. HIGH QUALITY: 8k resolution, perfect skin texture.
    2. REMOVE ARTIFACTS: No distorted hands or hair.
  `;

  // --- RETRY LOGIC & MODEL FALLBACK ---
  const MAX_RETRIES = 5;
  let lastError: any;
  
  let currentModel = is4kMode ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  let usingFallbackModel = false;

  // LIKENESS INSTRUCTION LOGIC
  const likenessScore = userProfile?.likenessThreshold || 85; // Default strictness high
  let likenessInstruction = "";
  let identityEnforcementPrompt = "";

  if (isCreativeMode) {
       likenessInstruction = "CREATIVE FREEDOM: Prioritize the artistic style (Anime/3D) over exact anatomical match.";
       identityEnforcementPrompt = `
       *** CREATIVE STYLIZATION ACTIVE ***
       - PRIORITY: STYLE > EXACT IDENTITY.
       - Transform faces to match the art style.
       `;
  } else {
      // STRICT DEFAULT
      likenessInstruction = `
      *** EXTREME FIDELITY MODE (Likeness: ${likenessScore}%) ***
      - DO NOT BEAUTIFY OR GENERALIZE THE FACE.
      - PRESERVE: Asymmetry, Nose Shape, Eye Distance, Lip Thickness.
      - The output must look exactly like the person in the input photo, just better lit/dressed.
      - IF THE INPUT FACE IS NOT PERFECT, THE OUTPUT FACE MUST NOT BE PERFECT.
      `;
      identityEnforcementPrompt = "*** CRITICAL: OUTPUT FACE MUST BE A PERFECT MATCH TO THE SOURCE. ***";
  }

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
        const currentKey = getKeyForAttempt(attempt);
        const ai = new GoogleGenAI({ apiKey: currentKey });
        
        const parts: any[] = [];
        
        // 1. Add Subject Images
        files.forEach(file => {
             parts.push({ inlineData: { mimeType: file.mimeType, data: file.base64 } });
        });

        // 2. Add Clothing Reference
        let clothingInstructionBlock = '';
        if (hasClothingReference && clothingOption?.referenceImage) {
            parts.push({ inlineData: { mimeType: 'image/jpeg', data: clothingOption.referenceImage } });
            clothingInstructionBlock = `
            *** CLOTHING REFERENCE OVERRIDE ***
            [INSTRUCTION]: The LAST image provided is the CLOTHING REFERENCE.
            Generate the Subject (First Image) wearing the Clothing (Last Image).
            Adapt fit to subject's body.
            `;
        } else if (clothingOption) {
            clothingInstructionBlock = `CLOTHING INSTRUCTION: ${clothingOption.prompt}`;
        }

        parts.push({ text: `
                TARGET STYLE: ${style.prompt}
                
                ${identityEnforcementPrompt}
                ${likenessInstruction}
                
                ${clothingInstructionBlock}
                
                ${aspectRatioOption ? `ASPECT RATIO: ${aspectRatioOption.prompt}` : ''}
                
                ${isCorporateBatch ? `
                *** BATCH CONSISTENCY ENFORCEMENT ***
                1. IGNORE ORIGINAL CROP.
                2. ${framingStyle === 'close-up' ? FRAMING_PROMPTS['close-up'] : FRAMING_PROMPTS['chest-up']}
                ` : ''}

                ${userProfile?.gender ? `GENDER CALIBRATION: Ensure subject looks ${userProfile.gender}.` : ''}
                ${userProfile?.ageGroup ? `AGE CALIBRATION: Ensure subject looks ${userProfile.ageGroup}.` : ''}
                ${userProfile?.ethnicity ? `ETHNICITY CALIBRATION: Preserve ${userProfile.ethnicity} features.` : ''}

                *** STUDIO CONTROLS ***
                ${poseOption?.id !== 'default' ? poseOption?.prompt : ''}
                ${opticsInstruction}
                ${lightingOption?.id !== 'default' ? lightingOption?.prompt : ''}
                ${expressionOption?.id !== 'original' ? expressionOption?.prompt : ''}
                ${beautyOption?.id !== 'default' ? beautyOption?.prompt : ''}
                ${glassesOption?.prompt || ''}

                ${is4kMode && !usingFallbackModel ? 'QUALITY: 8K Resolution, Ultra-High Texture Detail.' : ''}

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
            currentModel = 'gemini-2.5-flash-image';
            usingFallbackModel = true;
            attempt--;
            continue;
        }
    }
  }

  throw lastError || new Error("Falha ao gerar imagem após várias tentativas.");
}

export async function editGeneratedImage(
  base64Image: string,
  editPrompt: string,
  maskBase64?: string
): Promise<string> {
    if (API_KEYS.length === 0) throw new Error("API Key missing");

    let systemInstruction = `
        You are an expert Photo Editor AI.
        Task: EDIT the image based on user instruction.
        RULES:
        1. PRESERVE IDENTITY: Do NOT change facial features unless asked.
        2. REALISM: Keep lighting and texture consistent.
    `;

    if (maskBase64) {
        systemInstruction += `
        \n*** INPAINTING MODE ***
        Use the provided mask (White=Edit, Black=Protect).
        Only change pixels in the white area.
        `;
    }

    let currentModel = 'gemini-2.5-flash-image';
    const MAX_RETRIES = 3;
    let lastError: any;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const currentKey = getKeyForAttempt(attempt);
            const ai = new GoogleGenAI({ apiKey: currentKey });
            
            const parts: any[] = [
                { inlineData: { mimeType: 'image/png', data: base64Image } }
            ];

            if (maskBase64) {
                parts.push({ inlineData: { mimeType: 'image/png', data: maskBase64 } });
            }

            parts.push({ text: `Edit instruction: ${editPrompt}` });

            const response = await ai.models.generateContent({
                model: currentModel,
                contents: { parts },
                config: { systemInstruction }
            });

            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) return part.inlineData.data;
            }
            throw new Error("No image returned from editing.");

        } catch (error: any) {
            lastError = error;
            const errorMsg = error.message || '';
            const isRateLimit = errorMsg.includes('429') || error.status === 429;
            const isOverloaded = errorMsg.includes('503') || error.status === 503;

            if (isRateLimit || isOverloaded) {
                await delay(1000 * Math.pow(2, attempt));
                continue;
            }
            break; 
        }
    }

    throw new Error(lastError?.message || "Falha na edição.");
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

export async function analyzeHeadshot(
  base64Image: string
): Promise<ImageAnalysisResult> {
    if (API_KEYS.length === 0) throw new Error("API Key missing");

    const ai = new GoogleGenAI({ apiKey: getKeyForAttempt(0) });

    const systemInstruction = `
    You are an Expert Image Consultant.
    Analyze professional headshots.
    RESPONSE: JSON ONLY.
    {
        "scores": { "professionalism": 0-100, "approachability": 0-100, "creativity": 0-100, "confidence": 0-100 },
        "archetype": "string",
        "feedback": ["string", "string", "string"],
        "linkedinBio": "string"
    }
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
            parts: [
                { inlineData: { mimeType: 'image/png', data: base64Image } },
                { text: "Analyze this headshot." }
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
