/**
 * CORPORATE TEMPLATE SYSTEM
 * Sistema de templates fixos usado por empresas profissionais de headshots
 * Garante padronização absoluta independente da foto original
 */

export interface CorporateTemplate {
  name: string;
  width: number;
  height: number;
  anchorPoints: {
    eyesY: number;
    noseY: number;
    chinY: number;
    shouldersY: number;
    shouldersWidth: number;
    neckCenterY: number;
  };
  tolerances: {
    eyeHeightVariation: number;
    shoulderHeightVariation: number;
    headSizeVariation: number;
    rotationAngle: number;
  };
}

/**
 * Template Corporativo Padrão - Baseado em análise de HeadshotPro e StudioShot
 * Todas as medidas são PERCENTUAIS da altura/largura final
 */
export const PROFESSIONAL_TEMPLATE: CorporateTemplate = {
  name: 'Professional Corporate Headshot',
  width: 1024,
  height: 1024,

  // Pontos de ancoragem fixos (valores percentuais)
  anchorPoints: {
    // Olhos devem estar exatamente a 30% da altura
    eyesY: 0.30,

    // Nariz a 38% (8% abaixo dos olhos)
    noseY: 0.38,

    // Queixo a 48% (18% abaixo dos olhos)
    chinY: 0.48,

    // Centro do pescoço a 50%
    neckCenterY: 0.50,

    // Ombros a 60% da altura (10% abaixo do pescoço)
    shouldersY: 0.60,

    // Largura dos ombros: 70% da largura total
    shouldersWidth: 0.70
  },

  // Tolerâncias máximas aceitas (se ultrapassar, imagem é rejeitada)
  tolerances: {
    // Variação máxima na altura dos olhos entre imagens: ±2px
    eyeHeightVariation: 2,

    // Variação máxima na altura dos ombros: ±3px
    shoulderHeightVariation: 3,

    // Variação no tamanho da cabeça: ±5%
    headSizeVariation: 0.05,

    // Ângulo máximo de rotação aceito: ±3 graus
    rotationAngle: 3
  }
};

/**
 * Template para Headshots de LinkedIn (mais fechado, foco na face)
 */
export const LINKEDIN_TEMPLATE: CorporateTemplate = {
  name: 'LinkedIn Profile Headshot',
  width: 1024,
  height: 1024,

  anchorPoints: {
    eyesY: 0.33,
    noseY: 0.42,
    chinY: 0.52,
    neckCenterY: 0.56,
    shouldersY: 0.68,
    shouldersWidth: 0.75
  },

  tolerances: {
    eyeHeightVariation: 2,
    shoulderHeightVariation: 3,
    headSizeVariation: 0.05,
    rotationAngle: 3
  }
};

/**
 * Template para ID Corporativo (mais aberto, mostra mais dos ombros)
 */
export const CORPORATE_ID_TEMPLATE: CorporateTemplate = {
  name: 'Corporate ID Badge',
  width: 800,
  height: 1000,

  anchorPoints: {
    eyesY: 0.28,
    noseY: 0.36,
    chinY: 0.44,
    neckCenterY: 0.48,
    shouldersY: 0.58,
    shouldersWidth: 0.65
  },

  tolerances: {
    eyeHeightVariation: 2,
    shoulderHeightVariation: 3,
    headSizeVariation: 0.05,
    rotationAngle: 3
  }
};

/**
 * Calcula coordenadas em pixels baseado no template
 */
export function getAbsoluteAnchorPoints(template: CorporateTemplate) {
  return {
    eyesY: template.height * template.anchorPoints.eyesY,
    noseY: template.height * template.anchorPoints.noseY,
    chinY: template.height * template.anchorPoints.chinY,
    neckCenterY: template.height * template.anchorPoints.neckCenterY,
    shouldersY: template.height * template.anchorPoints.shouldersY,
    shouldersWidth: template.width * template.anchorPoints.shouldersWidth,
    centerX: template.width / 2
  };
}

/**
 * Valida se uma imagem está dentro das tolerâncias do template
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateAgainstTemplate(
  detectedPoints: {
    eyesY: number;
    shouldersY: number;
    headSize: number;
    rotationAngle: number;
  },
  template: CorporateTemplate,
  referencePoints?: {
    eyesY: number;
    shouldersY: number;
    headSize: number;
  }
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const anchors = getAbsoluteAnchorPoints(template);

  // Validação 1: Altura dos olhos
  const eyeDeviation = Math.abs(detectedPoints.eyesY - anchors.eyesY);
  if (eyeDeviation > template.tolerances.eyeHeightVariation) {
    errors.push(
      `Olhos fora da posição padrão: ${eyeDeviation.toFixed(1)}px de desvio (máx: ${template.tolerances.eyeHeightVariation}px)`
    );
  }

  // Validação 2: Variação entre imagens (se houver referência)
  if (referencePoints) {
    const eyeVariation = Math.abs(detectedPoints.eyesY - referencePoints.eyesY);
    if (eyeVariation > template.tolerances.eyeHeightVariation) {
      warnings.push(
        `Inconsistência entre imagens: ${eyeVariation.toFixed(1)}px de diferença nos olhos`
      );
    }

    const headSizeVariation = Math.abs(
      (detectedPoints.headSize - referencePoints.headSize) / referencePoints.headSize
    );
    if (headSizeVariation > template.tolerances.headSizeVariation) {
      warnings.push(
        `Tamanho de cabeça inconsistente: ${(headSizeVariation * 100).toFixed(1)}% de variação`
      );
    }
  }

  // Validação 3: Rotação
  if (Math.abs(detectedPoints.rotationAngle) > template.tolerances.rotationAngle) {
    errors.push(
      `Cabeça inclinada: ${detectedPoints.rotationAngle.toFixed(1)}° (máx: ±${template.tolerances.rotationAngle}°)`
    );
  }

  // Validação 4: Ombros
  const shoulderDeviation = Math.abs(detectedPoints.shouldersY - anchors.shouldersY);
  if (shoulderDeviation > template.tolerances.shoulderHeightVariation) {
    warnings.push(
      `Ombros fora da posição padrão: ${shoulderDeviation.toFixed(1)}px de desvio`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
