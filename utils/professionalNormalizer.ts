/**
 * PROFESSIONAL BATCH NORMALIZER
 * Sistema completo de normalização profissional para headshots corporativos
 * Combina detecção multi-point + templates fixos + transformação geométrica
 */

import {
  detectBodyLandmarks,
  analyzePose,
  initializePoseDetector,
  validateShoulderDetection,
  type FullBodyLandmarks,
  type PoseAnalysis
} from './poseDetector';
import {
  PROFESSIONAL_TEMPLATE,
  LINKEDIN_TEMPLATE,
  CORPORATE_ID_TEMPLATE,
  validateAgainstTemplate,
  type CorporateTemplate,
  type ValidationResult
} from './corporateTemplate';
import { transformToTemplate, transformToTemplateWithFixedScale } from './geometricTransform';

/**
 * Resultado da normalização profissional
 */
export interface NormalizationResult {
  success: boolean;
  normalizedImage: string; // base64
  originalImage: string; // base64 original
  analysis: PoseAnalysis | null;
  validation: ValidationResult | null;
  metrics: {
    eyesY: number;
    shouldersY: number;
    headSize: number;
    rotationAngle: number;
    shoulderRotation: number;
  };
  warnings: string[];
  processingTime: number;
  shoulderDetectionValid: boolean; // Se a detecção de ombros foi confiável
}

/**
 * Configuração para normalização em lote
 */
export interface BatchNormalizationConfig {
  template: CorporateTemplate;
  backgroundColor: string;
  strictMode: boolean; // Se true, rejeita imagens que não passam na validação
  showWarnings: boolean;
}

/**
 * Normaliza uma única imagem com análise completa
 */
export async function normalizeHeadshotProfessional(
  imageBase64: string,
  config: BatchNormalizationConfig,
  referenceMetrics?: {
    eyesY: number;
    shouldersY: number;
    headSize: number;
    fixedScale?: number;
  }
): Promise<NormalizationResult> {
  const startTime = performance.now();

  return new Promise((resolve) => {
    const img = new Image();
    const cleanBase64 = imageBase64.startsWith('data:')
      ? imageBase64
      : `data:image/png;base64,${imageBase64}`;

    img.onload = async () => {
      try {
        // PASSO 1: Analisar pose
        const analysis = await analyzePose(img);

        if (!analysis) {
          console.error('❌ Falha ao detectar pose na imagem');
          resolve({
            success: false,
            normalizedImage: imageBase64,
            originalImage: imageBase64,
            analysis: null,
            validation: null,
            metrics: { eyesY: 0, shouldersY: 0, headSize: 0, rotationAngle: 0, shoulderRotation: 0 },
            warnings: ['Falha ao detectar face na imagem'],
            processingTime: performance.now() - startTime,
            shoulderDetectionValid: false
          });
          return;
        }

        // PASSO 2: Validar qualidade da detecção de ombros
        const shoulderDetectionValid = validateShoulderDetection(analysis.landmarks);

        console.log('📊 Detecção:', {
          eyesY: analysis.landmarks.eyesCenter.y.toFixed(1),
          shouldersY: analysis.landmarks.shouldersCenter.y.toFixed(1),
          eyeToShoulderDist: analysis.landmarks.eyeToShoulderDistance.toFixed(1),
          shoulderWidth: analysis.landmarks.shoulderWidth.toFixed(1),
          shoulderValid: shoulderDetectionValid
        });

        // PASSO 3: Extrair métricas (com ajuste se detecção falhar)
        let metrics = {
          eyesY: analysis.landmarks.eyesCenter.y,
          shouldersY: analysis.landmarks.shouldersCenter.y,
          headSize: analysis.landmarks.headSize,
          rotationAngle: analysis.landmarks.headRotation,
          shoulderRotation: analysis.landmarks.shoulderRotation
        };

        // Se detecção de ombros falhou E temos referência, usar referência
        if (!shoulderDetectionValid && referenceMetrics) {
          console.warn('⚠️ Ombros inválidos - usando métricas de referência');
          const refEyeToShoulder = referenceMetrics.shouldersY - referenceMetrics.eyesY;
          metrics.shouldersY = metrics.eyesY + refEyeToShoulder;
          metrics.headSize = referenceMetrics.headSize;
          console.log('🔧 Ajustado para shouldersY:', metrics.shouldersY.toFixed(1));
        } else if (!shoulderDetectionValid) {
          console.warn('⚠️ Ombros inválidos - usando estimativa anatômica');
          const estimatedDist = analysis.landmarks.eyeDistance * 4.5;
          metrics.shouldersY = metrics.eyesY + estimatedDist;
          metrics.headSize = analysis.landmarks.eyeDistance * 3.0;
        }

        // PASSO 3: Validar contra template
        const validation = validateAgainstTemplate(
          metrics,
          config.template,
          referenceMetrics
        );

        // PASSO 4: Verificar se deve prosseguir
        const warnings = [...analysis.issues, ...validation.warnings, ...validation.errors];

        if (config.strictMode && !validation.valid) {
          resolve({
            success: false,
            normalizedImage: imageBase64,
            originalImage: imageBase64,
            analysis,
            validation,
            metrics,
            warnings,
            processingTime: performance.now() - startTime,
            shoulderDetectionValid
          });
          return;
        }

        // PASSO 5: Aplicar transformação geométrica
        let normalizedImage: string;

        if (referenceMetrics?.fixedScale) {
          // Usar escala FIXA para garantir padronização absoluta
          console.log('🔒 Usando escala fixa:', referenceMetrics.fixedScale.toFixed(4));
          normalizedImage = await transformToTemplateWithFixedScale(
            img,
            analysis.landmarks,
            config.template,
            referenceMetrics.fixedScale,
            config.backgroundColor
          );
        } else {
          // Calcular transformação individual
          normalizedImage = await transformToTemplate(
            img,
            analysis.landmarks,
            config.template,
            config.backgroundColor
          );
        }

        resolve({
          success: true,
          normalizedImage,
          originalImage: imageBase64,
          analysis,
          validation,
          metrics,
          warnings: config.showWarnings ? warnings : [],
          processingTime: performance.now() - startTime,
          shoulderDetectionValid
        });
      } catch (error) {
        console.error('Erro na normalização:', error);
        resolve({
          success: false,
          normalizedImage: imageBase64,
          originalImage: imageBase64,
          analysis: null,
          validation: null,
          metrics: { eyesY: 0, shouldersY: 0, headSize: 0, rotationAngle: 0, shoulderRotation: 0 },
          warnings: [`Erro no processamento: ${error}`],
          processingTime: performance.now() - startTime,
          shoulderDetectionValid: false
        });
      }
    };

    img.onerror = () => {
      resolve({
        success: false,
        normalizedImage: imageBase64,
        originalImage: imageBase64,
        analysis: null,
        validation: null,
        metrics: { eyesY: 0, shouldersY: 0, headSize: 0, rotationAngle: 0, shoulderRotation: 0 },
        warnings: ['Falha ao carregar imagem'],
        processingTime: performance.now() - startTime,
        shoulderDetectionValid: false
      });
    };

    img.src = cleanBase64;
  });
}

/**
 * Normaliza um lote completo de imagens com padronização rigorosa
 */
export async function normalizeBatchProfessional(
  images: string[],
  config?: Partial<BatchNormalizationConfig>
): Promise<NormalizationResult[]> {
  if (images.length === 0) return [];

  // Configuração padrão
  const fullConfig: BatchNormalizationConfig = {
    template: PROFESSIONAL_TEMPLATE,
    backgroundColor: '#F5F5F5',
    strictMode: false,
    showWarnings: true,
    ...config
  };

  // Inicializar detector
  await initializePoseDetector();

  console.log('🎯 Iniciando normalização profissional de', images.length, 'imagens...');

  // ESTRATÉGIA PROFISSIONAL:
  // 1. Processar todas as imagens e coletar métricas
  // 2. Calcular métricas medianas como referência
  // 3. Re-processar todas usando a referência

  // FASE 1: Análise inicial
  const initialResults: NormalizationResult[] = [];

  for (let i = 0; i < images.length; i++) {
    console.log(`  Analisando imagem ${i + 1}/${images.length}...`);
    const result = await normalizeHeadshotProfessional(images[i], fullConfig);
    initialResults.push(result);
  }

  // FASE 2: Calcular métricas de referência (mediana)
  // CRUCIAL: Usar apenas imagens com detecção de ombros VÁLIDA
  const validResults = initialResults.filter((r) => r.success && r.shoulderDetectionValid);

  console.log(`📊 ${validResults.length}/${initialResults.length} imagens com detecção de ombros válida`);

  if (validResults.length === 0) {
    console.warn('⚠️ Nenhuma imagem tem detecção de ombros válida - usando todas');
    // Fallback: usar todas as imagens bem-sucedidas
    const successfulResults = initialResults.filter((r) => r.success);
    if (successfulResults.length === 0) {
      console.error('❌ Nenhuma imagem processada com sucesso');
      return initialResults;
    }

    const eyesYValues = successfulResults.map((r) => r.metrics.eyesY).sort((a, b) => a - b);
    const shouldersYValues = successfulResults.map((r) => r.metrics.shouldersY).sort((a, b) => a - b);
    const headSizeValues = successfulResults.map((r) => r.metrics.headSize).sort((a, b) => a - b);

    // Calcular escala fixa do fallback
    const eyeDistances = successfulResults
      .map((r) => r.analysis?.landmarks.eyeDistance)
      .filter((d): d is number => d !== undefined)
      .sort((a, b) => a - b);

    const medianEyeDistance = eyeDistances[Math.floor(eyeDistances.length / 2)];
    const targetEyeDistance = fullConfig.template.width * 0.25;
    const fixedScale = targetEyeDistance / medianEyeDistance;

    const referenceMetrics = {
      eyesY: eyesYValues[Math.floor(eyesYValues.length / 2)],
      shouldersY: shouldersYValues[Math.floor(shouldersYValues.length / 2)],
      headSize: headSizeValues[Math.floor(headSizeValues.length / 2)],
      fixedScale
    };

    console.log('📊 Métricas de referência (fallback):', referenceMetrics);

    // Continuar com normalização final
    console.log('🔄 Aplicando normalização final com referência...');
    const finalResults: NormalizationResult[] = [];

    for (let i = 0; i < images.length; i++) {
      console.log(`  Normalizando imagem ${i + 1}/${images.length}...`);
      const result = await normalizeHeadshotProfessional(images[i], fullConfig, referenceMetrics);
      finalResults.push(result);
    }

    return finalResults;
  }

  // Calcular mediana apenas das imagens COM ombros válidos
  const eyesYValues = validResults.map((r) => r.metrics.eyesY).sort((a, b) => a - b);
  const shouldersYValues = validResults.map((r) => r.metrics.shouldersY).sort((a, b) => a - b);
  const headSizeValues = validResults.map((r) => r.metrics.headSize).sort((a, b) => a - b);

  // Calcular ESCALA FIXA baseada na distância entre olhos das imagens válidas
  const eyeDistances = validResults
    .map((r) => r.analysis?.landmarks.eyeDistance)
    .filter((d): d is number => d !== undefined)
    .sort((a, b) => a - b);

  const medianEyeDistance = eyeDistances[Math.floor(eyeDistances.length / 2)];

  // Distância ideal entre olhos no template (25% da largura)
  const targetEyeDistance = fullConfig.template.width * 0.25;

  // Calcular escala fixa
  const fixedScale = targetEyeDistance / medianEyeDistance;

  const referenceMetrics = {
    eyesY: eyesYValues[Math.floor(eyesYValues.length / 2)],
    shouldersY: shouldersYValues[Math.floor(shouldersYValues.length / 2)],
    headSize: headSizeValues[Math.floor(headSizeValues.length / 2)],
    fixedScale
  };

  console.log('✅ Métricas de referência (de imagens válidas):', {
    ...referenceMetrics,
    medianEyeDistance: medianEyeDistance.toFixed(1),
    targetEyeDistance: targetEyeDistance.toFixed(1)
  });

  // FASE 3: Normalizar novamente usando referência
  console.log('🔄 Aplicando normalização final com referência...');
  const finalResults: NormalizationResult[] = [];

  for (let i = 0; i < images.length; i++) {
    console.log(`  Normalizando imagem ${i + 1}/${images.length}...`);
    const result = await normalizeHeadshotProfessional(images[i], fullConfig, referenceMetrics);
    finalResults.push(result);
  }

  // Estatísticas finais
  const successful = finalResults.filter((r) => r.success).length;
  const withWarnings = finalResults.filter((r) => r.warnings.length > 0).length;

  console.log(`✅ Normalização concluída: ${successful}/${images.length} sucesso`);
  if (withWarnings > 0) {
    console.log(`⚠️ ${withWarnings} imagens com avisos`);
  }

  return finalResults;
}

/**
 * Exporta templates disponíveis
 */
export const TEMPLATES = {
  PROFESSIONAL: PROFESSIONAL_TEMPLATE,
  LINKEDIN: LINKEDIN_TEMPLATE,
  CORPORATE_ID: CORPORATE_ID_TEMPLATE
};

/**
 * Gera relatório de qualidade do lote
 */
export interface BatchQualityReport {
  totalImages: number;
  successful: number;
  failed: number;
  withWarnings: number;
  averageProcessingTime: number;
  qualityDistribution: {
    excellent: number;
    good: number;
    acceptable: number;
    poor: number;
  };
  commonIssues: Array<{ issue: string; count: number }>;
}

export function generateQualityReport(results: NormalizationResult[]): BatchQualityReport {
  const issueMap = new Map<string, number>();

  const qualityDistribution = {
    excellent: 0,
    good: 0,
    acceptable: 0,
    poor: 0
  };

  let totalTime = 0;

  results.forEach((result) => {
    totalTime += result.processingTime;

    if (result.analysis) {
      qualityDistribution[result.analysis.quality]++;
    }

    result.warnings.forEach((warning) => {
      issueMap.set(warning, (issueMap.get(warning) || 0) + 1);
    });
  });

  const commonIssues = Array.from(issueMap.entries())
    .map(([issue, count]) => ({ issue, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalImages: results.length,
    successful: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    withWarnings: results.filter((r) => r.warnings.length > 0).length,
    averageProcessingTime: totalTime / results.length,
    qualityDistribution,
    commonIssues
  };
}
