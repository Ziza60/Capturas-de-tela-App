
export type StyleCategory = 'professional' | 'casual_natural' | 'creative_artistic' | 'travel_scenery' | 'halloween_fantasy' | 'time_travel' | 'others';

export interface StyleOption {
  id: string;
  label: string;
  prompt: string;
  category: StyleCategory;
}

export interface UploadedFile {
  base64: string;
  mimeType: string;
  name: string;
}

export interface GlassesOption {
  id: 'none' | 'remove' | 'add-sunglasses';
  label: string;
  prompt: string;
}

export interface ClothingOption {
  id: string;
  label: string;
  prompt: string;
}

export interface AspectRatioOption {
  id: string;
  label: string;
  prompt: string;
  className: string;
}

export interface LightingOption {
  id: string;
  label: string;
  prompt: string;
}

export interface ExpressionOption {
  id: string;
  label: string;
  prompt: string;
}

export interface PoseOption {
    id: string;
    label: string;
    prompt: string;
    icon?: string;
}

export interface BeautyOption {
  id: string;
  label: string;
  prompt: string;
}

export interface CameraSettings {
    depthOfField: number; // 0 (Blurry/Bokeh) to 100 (Sharp)
    angle: 'eye-level' | 'low-angle' | 'high-angle';
}

export interface UserProfile {
  ageGroup: string;
  gender: string;
  ethnicity: string;
  likenessThreshold: number; // 0 to 100 (Creative vs Strict)
}

export interface CustomizationOption {
    id: string;
    label: string;
    type: 'slider';
    min: number;
    max: number;
    defaultValue: number;
    step: number;
}

export type BatchStatus = 'pending' | 'processing' | 'completed' | 'error';

export interface ImageAnalysisResult {
    scores: {
        professionalism: number; // 0-100
        approachability: number; // 0-100
        creativity: number; // 0-100
        confidence: number; // 0-100
    };
    archetype: string; // e.g., "The Visionary Leader", "The Friendly Expert"
    feedback: string[];
    linkedinBio: string;
}

export interface BatchItem {
  id: string;
  file: UploadedFile;
  status: BatchStatus;
  resultImage: string | null;
  rawImage: string | null; // Cópia limpa sem logo para reedição
  error?: string;
  finalFileName?: string;
  analysis?: ImageAnalysisResult; // New: Stores AI analysis per item
}

export type LogoPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'chest-left' | 'chest-right';

export type FramingStyle = 'chest-up' | 'close-up';

export interface TeamSettings {
  logo: UploadedFile | null;
  logoPosition: LogoPosition;
  uniformId: string | null;
  framingStyle: FramingStyle;
  filenamePrefix: string;
  // Background
  backgroundType: 'default' | 'solid';
  backgroundColor: string; // Hex code
  // Fine Tuning
  logoScale: number;   // Percentage of image width (default ~12)
  logoOffsetX: number; // Percentage offset X (-20 to 20)
  logoOffsetY: number; // Percentage offset Y (-20 to 20)
}

export interface EditingSettings {
  brightness: number; // 0.5 to 1.5 (1 is default)
  contrast: number;   // 0.5 to 1.5 (1 is default)
  saturation: number; // 0 to 2 (1 is default)
  grayscale: boolean;
  
  // Geometry
  borderRadius: number; // 0 to 50 (%)
  borderWidth: number;  // 0 to 20 (px)
  borderColor: string;  // Hex
  
  // Format
  format: 'png' | 'jpeg' | 'webp';
  quality: number; // 0.1 to 1.0
}
