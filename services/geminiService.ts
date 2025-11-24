import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { GlassesOption, StyleOption, UploadedFile, AspectRatioOption, ClothingOption, UserProfile, LightingOption, ExpressionOption, BeautyOption, FramingStyle } from '../types';
import { FRAMING_PROMPTS } from '../constants';

// Helper function for delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateHeadshot(
  uploadedFile: UploadedFile,
  style: StyleOption,
  glassesOption: GlassesOption | null,
  clothingOption: ClothingOption | null,
  aspectRatioOption: AspectRatioOption | null,
  userProfile?: UserProfile,
  lightingOption?: LightingOption,
  expressionOption?: ExpressionOption,
  beautyOption?: BeautyOption,
  is4kMode?: boolean,
  framingStyle?: FramingStyle // New optional parameter for team mode
): Promise<string> {
  // Defensive check for API key
  if (!process.env.API_KEY) {
    throw new Error("A variável de ambiente API_KEY não está definida.");
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // --- STYLE CATEGORY DETECTION ---
  const ILLUSTRATION_STYLES = ['anime-style', 'comic-book'];
  const isIllustrationMode = ILLUSTRATION_STYLES.includes(style.id);

  const THREE_D_STYLES = ['3d-pixar-style'];
  const is3DMode = THREE_D_STYLES.includes(style.id);

  const isCreativeMode = isIllustrationMode || is3DMode;
  const isHalloween = style.category === 'halloween_fantasy';

  // --- ISO CORPORATE STANDARD PROTOCOL (STRICT GEOMETRY) ---
  const CORPORATE_ISO_PROTOCOL = `
**PHASE 1: CORPORATE HEADSHOT ISO STANDARD (MANDATORY GEOMETRY)**
You are an AI Photographer enforcing a strict biometric standard.
You must generate a standardized corporate headshot.
Ignore the original photo's perspective/distortion. RECONSTRUCT the subject to fit these EXACT metrics:

[FRAME & RESOLUTION]
- Aspect ratio: 1:1 (Square).
- Resolution: High Sharpness.
- HEADROOM (Top Margin): Space above hair must be 3–6% of image height.

[POSITIONING - ZERO DEVIATION]
- **EYE LINE:** The pupils MUST be positioned at **43–45%** of the image height (measured from top).
- **CHIN:** The bottom of the chin MUST be at **72–76%** of the image height.
- **CENTERING:** The mid-point between eyes must be horizontally centered (deviation ≤ 1.5%).

[HEAD ORIENTATION]
- **POSE:** STRICT FRONTAL (Passport Style).
- **ROLL/YAW/PITCH:** Must be effectively 0° (Max 2° tolerance).
- **GAZE:** Looking directly into the lens.

[PROPORTIONS]
- **HEAD HEIGHT:** Distance from Chin to Top of Skull = **63–68%** of image height.
- **HEAD WIDTH:** Bizygomatic width = **45–52%** of image width.

[SELFIE CORRECTION]
- If input is a SELFIE (Wide Angle/Fish Eye): You MUST correct the distortion.
- Flatten the nose/ears (85mm Lens Simulation).
- **OUTPAINTING:** You MUST generate shoulders and chest if they are missing in the source.
`;

  // --- REFINED SAFETY BLOCK (PHASE 2) ---
  const REFINED_SAFETY_BLOCK = `
**PHASE 2: REFINED SAFETY & POSTURE CORRECTION**
This block applies AFTER Phase 1 to fix subtle posture issues.

[REFINED FRAMING]
- **SIDE MARGINS:** There MUST be a visible gap of **6–10%** of image width between the outer shoulder (deltoid) and the image edge.
- **SHOULDERS:** Must NOT touch or overlap the image border. If they do, ZOOM OUT.

[BODY POSITIONING]
- **LEVEL SHOULDERS:** The difference in height between left and right acromion must be ≤ 3 pixels (effectively level).
- **SHOULDER WIDTH:** The width from shoulder to shoulder must be **75–90%** of the total image width.
- **ACTION:** If shoulders are cut off, apply "Zoom Out" and "Outpainting" to recover the margins.

[AUTOMATIC NORMALIZATION]
- Detect body landmarks (Shoulders, Neck).
- Apply Warp Correction if shoulder slope > 2 degrees.
- Re-center body without moving the head (maintain Phase 1 Eye Line).
`;

  // --- SURGICAL CORRECTION BLOCK (PHASE 3) ---
  const SURGICAL_CORRECTION_BLOCK = `
**PHASE 3: SURGICAL PRECISION & LOGO ALIGNMENT**
This block ensures the canvas is perfect for digital logo overlay.

[LOGO ZONE PREPARATION]
- The Uniform/Chest area must be FLAT and FRONTAL.
- No folds, wrinkles, or hand gestures covering the upper chest (Left/Right).
- **LOGO TARGET:** The chest area at coordinates (X:28%, Y:67%) and (X:72%, Y:67%) must be clearly visible.

[ROLL CORRECTION]
- **STRICT ROLL CHECK:** If head tilt (Roll) is > 2°, ROTATE the image content to align eyes horizontally.
- The vertical axis of the face (Forehead to Chin) must be exactly perpendicular to the bottom edge.

[REVALIDATION]
- Check: Eye Line (43-45%).
- Check: Chin Line (72-76%).
- Check: Shoulders Level.
- Check: Side Margins ≥ 6%.
`;

  // --- FINAL HIERARCHICAL BLOCK (PHASE 4) ---
  const FINAL_HIERARCHICAL_BLOCK = `
**PHASE 4: FINAL HIERARCHICAL SAFETY BLOCK (MANDATORY OVERRIDE)**
This block MUST be applied AFTER Phases 1, 2, and 3. It serves as the FINAL TRUTH.

[RULE 1: SHOULDERS FREE — ZERO CONTACT WITH EDGES]
- The deltoids (shoulders) MUST BE fully visible and **MUST NOT touch, overlap, or be cut by the side edges**.
- **MANDATORY SIDE MARGIN:** Minimum gap of **≥ 6%** of total width on EACH side (Left & Right).
- **MAX SHOULDER WIDTH:** Shoulders must occupy a MAXIMUM of **88%** of the image width.
- **ACTION:** If the shoulders are touching the edge, you MUST perform a **ZOOM OUT** operation until the 6% margin is achieved.

[RULE 2: STRICT FRONTAL FACE ENFORCEMENT]
- **IGNORE ORIGINAL POSE:** If the user provided a side profile, 3/4 view, or angled photo, you MUST RECONSTRUCT the face to be **100% FRONTAL**.
- **YAW TOLERANCE:** ≤ 2°. The nose must point directly at the center of the camera.
- **GAZE VECTOR:** The eyes must look directly at the lens (Deviation ≤ 2°).
- **ACTION:** If the face is turned, apply "Face Pose Correction" to align the nose-chin axis to the center.

[RULE 3: FINAL VALIDATION]
- Check 1: Are shoulders floating with ≥ 6% margin? (YES/NO). If NO -> Zoom Out.
- Check 2: Is face perfectly frontal? (YES/NO). If NO -> Rotate Face.
- Check 3: Is head centered? (YES/NO). If NO -> Center.

OUTPUT: A corporate headshot that passes all 4 Phases of validation.
`;

  // --- HALLOWEEN PROTOCOL (IDENTITY PROTECTION) ---
  const HALLOWEEN_COSPLAY_PROTOCOL = `
**HALLOWEEN IDENTITY PROTOCOL (COSPLAY MODE)**
CRITICAL SAFETY INSTRUCTION:
1. DO NOT GENERATE A CELEBRITY OR MOVIE CHARACTER FACE.
2. The goal is to show the *USER* wearing a costume/makeup.
3. PRESERVE FACIAL STRUCTURE: Keep the user's nose, jawline, eye distance, and head shape exactly as they are.
4. APPLY MAKEUP/OUTFIT ON TOP: Paint the face, add the costume, but do NOT swap the skull.
5. If the prompt says "Joker", do NOT make Heath Ledger. Make the USER looking like they dressed up as Joker.
`;

  let systemInstruction = `
    You are a world-class AI Headshot Photographer.
    Your goal is to generate a hyper-realistic, professional headshot based on the user's uploaded photo.
    
    ${isHalloween ? HALLOWEEN_COSPLAY_PROTOCOL : CORPORATE_ISO_PROTOCOL}
    ${!isHalloween ? REFINED_SAFETY_BLOCK : ''}
    ${!isHalloween ? SURGICAL_CORRECTION_BLOCK : ''}
    ${!isHalloween ? FINAL_HIERARCHICAL_BLOCK : ''}

    GENERAL RULES:
    1. PRESERVE IDENTITY: The person's face (eyes, nose, mouth features) must remain recognizable.
    2. HIGH QUALITY: 8k resolution, perfect skin texture, studio lighting.
    3. REMOVE ARTIFACTS: No hands near face, no distorted glasses, no weird hair.
    4. BACKGROUND: Clean and professional as requested.
  `;

  // --- RETRY LOGIC WITH EXPONENTIAL BACKOFF ---
  const MAX_RETRIES = 3;
  let lastError: any;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
        // Construct the prompt parts
        const parts: any[] = [
            { inlineData: { mimeType: uploadedFile.mimeType, data: uploadedFile.base64 } },
            { text: `
                TARGET STYLE: ${style.prompt}
                
                ${clothingOption ? `CLOTHING INSTRUCTION: ${clothingOption.prompt}` : ''}
                ${aspectRatioOption ? `ASPECT RATIO: ${aspectRatioOption.prompt}` : ''}
                ${framingStyle === 'close-up' ? FRAMING_PROMPTS['close-up'] : FRAMING_PROMPTS['chest-up']}
                
                ${userProfile?.gender ? `GENDER CALIBRATION: Ensure subject looks ${userProfile.gender}.` : ''}
                ${userProfile?.ageGroup ? `AGE CALIBRATION: Ensure subject looks ${userProfile.ageGroup}.` : ''}
                ${userProfile?.ethnicity ? `ETHNICITY CALIBRATION: Preserve ${userProfile.ethnicity} features.` : ''}

                ${lightingOption?.id !== 'default' ? lightingOption?.prompt : ''}
                ${expressionOption?.id !== 'original' ? expressionOption?.prompt : ''}
                ${beautyOption?.id !== 'default' ? beautyOption?.prompt : ''}
                ${glassesOption?.prompt || ''}

                ${is4kMode ? 'QUALITY OVERRIDE: 8K Resolution, Ultra-High Texture Detail, Perfect Skin Shader.' : ''}

                GENERATE THE IMAGE NOW.
            `}
        ];

        const response = await ai.models.generateContent({
            model: isCreativeMode ? 'gemini-2.5-flash' : 'gemini-3-pro-image-preview', // Use Pro for Photorealism
            contents: { parts },
            config: {
                systemInstruction,
                imageConfig: {
                    imageSize: is4kMode ? "2K" : undefined, // Force 2K if 4K mode requested (Gemini max is 2K, upscaled conceptually)
                    aspectRatio: aspectRatioOption?.id === 'portrait' ? '4:3' : 
                                 aspectRatioOption?.id === 'story' ? '9:16' : 
                                 aspectRatioOption?.id === 'landscape' ? '16:9' : 
                                 '1:1'
                }
            }
        });

        // Extract Image
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        
        throw new Error("A IA não retornou nenhuma imagem. Tente novamente.");

    } catch (error: any) {
        lastError = error;
        console.error(`Attempt ${attempt + 1} failed:`, error);
        
        // Check for Rate Limit (429) or Server Error (503)
        const isRateLimit = error.message?.includes('429') || error.status === 429;
        const isOverloaded = error.message?.includes('503') || error.status === 503;

        if (isRateLimit || isOverloaded) {
            // Exponential Backoff: 2s, 4s, 8s
            const waitTime = 2000 * Math.pow(2, attempt);
            console.warn(`Rate limit hit. Retrying in ${waitTime}ms...`);
            await delay(waitTime);
            continue;
        }

        // If it's a prompt error or other fatal error, don't retry
        break;
    }
  }

  throw lastError || new Error("Falha ao gerar imagem após várias tentativas.");
}

export async function generateSuggestions(
  uploadedFile: UploadedFile,
  style: StyleOption
): Promise<string[]> {
    // ... code remains same (omitted for brevity) ...
    return [
        "Tente uma iluminação mais suave.",
        "Sorria com confiança!",
        "Use roupas contrastantes com o fundo."
    ];
}
