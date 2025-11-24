
import type { LogoPosition, EditingSettings, TeamSettings, UploadedFile } from '../types';

/**
 * Pré-processa a imagem enviada para padronizar formato, tamanho e qualidade.
 * Simula o comportamento de "ImageKit" no client-side.
 * 1. Converte para JPEG (Formato padrão)
 * 2. Redimensiona para Max 1500px (Padronização de tamanho)
 * 3. Remove metadados (via Canvas)
 */
export async function preprocessImage(file: File): Promise<UploadedFile> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo original'));

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_DIMENSION = 1500; // Padronização de tamanho (ex: 4000px -> 1500px)
      
      let width = img.naturalWidth;
      let height = img.naturalHeight;

      // Lógica de Redimensionamento (Resize)
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height *= MAX_DIMENSION / width;
          width = MAX_DIMENSION;
        } else {
          width *= MAX_DIMENSION / height;
          height = MAX_DIMENSION;
        }
      }

      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Falha ao criar contexto de imagem'));
        return;
      }

      // Desenha imagem redimensionada (Crop/Resize Automático básico)
      ctx.drawImage(img, 0, 0, width, height);

      // Padronização de Formato: Sempre JPEG 95%
      const base64 = canvas.toDataURL('image/jpeg', 0.95).split(',')[1];
      
      // Padronização de Nome
      const safeName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";

      resolve({
        base64,
        mimeType: 'image/jpeg',
        name: safeName
      });
    };

    img.onerror = () => reject(new Error('Falha ao processar imagem (formato inválido)'));
    
    reader.readAsDataURL(file);
  });
}

/**
 * Aplica um logo sobre uma imagem base usando configurações de equipe.
 * @param baseImageBase64 Imagem gerada pela IA (base64 puro ou data URL)
 * @param logoBase64 Logo da empresa (base64 puro ou data URL)
 * @param settings Configurações da equipe contendo posição, escala e offsets
 * @returns Promise com a string Base64 da imagem final
 */
export async function overlayLogo(
  baseImageBase64: string,
  logoBase64: string,
  settings: TeamSettings
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    const baseImg = new Image();
    const logoImg = new Image();

    // Helper to handle standardizing base64 strings
    const cleanBase64 = (str: string, mime: string = 'image/png') => 
      str.startsWith('data:') ? str : `data:${mime};base64,${str}`;

    let loadedCount = 0;
    const onLoad = () => {
      loadedCount++;
      if (loadedCount === 2) {
        processOverlay();
      }
    };

    baseImg.onload = onLoad;
    baseImg.onerror = () => reject(new Error('Failed to load base image'));
    baseImg.src = cleanBase64(baseImageBase64);

    logoImg.onload = onLoad;
    logoImg.onerror = () => reject(new Error('Failed to load logo image'));
    logoImg.src = cleanBase64(logoBase64);

    function processOverlay() {
      // 1. Setup Canvas
      canvas.width = baseImg.naturalWidth;
      canvas.height = baseImg.naturalHeight;
      
      // 2. Draw Base Image
      ctx!.drawImage(baseImg, 0, 0);

      // 3. Calculate Logo Size & Position based on User Settings
      const aspectRatio = logoImg.naturalHeight / logoImg.naturalWidth;
      
      // Use User defined Scale (Default is ~12-15% range usually)
      const targetWidth = canvas.width * (settings.logoScale / 100);
      const targetHeight = targetWidth * aspectRatio;

      // Base Coordinates
      let x = 0;
      let y = 0;
      const position = settings.logoPosition;

      if (position === 'chest-left' || position === 'chest-right') {
        // UNIFORM/CHEST LOGIC
        // Base Anchor: 67% down (Pocket Height)
        const anchorY = canvas.height * 0.67; 
        
        let anchorX;
        if (position === 'chest-left') {
            // Subject's Left (Viewer's Right): ~72%
             anchorX = canvas.width * 0.72;
        } else {
            // Subject's Right (Viewer's Left): ~28%
             anchorX = canvas.width * 0.28;
        }
        
        // Center image on anchor
        x = anchorX - (targetWidth / 2);
        y = anchorY - (targetHeight / 2);

      } else {
         // WATERMARK/CORNER LOGIC
         const padding = canvas.width * 0.05; // 5% padding
         
         switch (position) {
            case 'bottom-right':
                x = canvas.width - targetWidth - padding;
                y = canvas.height - targetHeight - padding;
                break;
            case 'bottom-left':
                x = padding;
                y = canvas.height - targetHeight - padding;
                break;
            case 'top-right':
                x = canvas.width - targetWidth - padding;
                y = padding;
                break;
            case 'top-left':
                x = padding;
                y = padding;
                break;
         }
      }

      // 4. APPLY FINE TUNING OFFSETS
      // Offsets are percentage of CANVAS dimensions
      const offsetXPixels = canvas.width * (settings.logoOffsetX / 100);
      const offsetYPixels = canvas.height * (settings.logoOffsetY / 100); 
      
      x += offsetXPixels;
      y += offsetYPixels;

      // 5. Draw Logo
      // Opacity logic
      ctx!.globalAlpha = (position.includes('chest')) ? 0.90 : 0.95; 
      ctx!.drawImage(logoImg, x, y, targetWidth, targetHeight);
      
      // 6. Return Result
      const resultDataUrl = canvas.toDataURL('image/png');
      resolve(resultDataUrl.split(',')[1]);
    }
  });
}

/**
 * Applies technical post-processing edits (ImageKit-like features)
 * @param imageBase64 Source image
 * @param settings Editing settings (color, border, format)
 * @returns Processed Base64 string
 */
export async function applyPostProcessing(
  imageBase64: string,
  settings: EditingSettings
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    const img = new Image();
    const cleanBase64 = (str: string) => str.startsWith('data:') ? str : `data:image/png;base64,${str}`;

    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // 1. Filter Application (Color Grading)
      // Using CSS-style filter string on the context
      const filters = [
        `brightness(${settings.brightness})`,
        `contrast(${settings.contrast})`,
        `saturate(${settings.saturation})`,
        settings.grayscale ? 'grayscale(100%)' : 'grayscale(0%)'
      ];
      ctx.filter = filters.join(' ');

      // 2. Draw Image (with filters applied)
      // If rounded corners are needed, we need to clip path FIRST
      if (settings.borderRadius > 0) {
        const radius = (Math.min(canvas.width, canvas.height) * settings.borderRadius) / 100;
        
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(canvas.width - radius, 0);
        ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
        ctx.lineTo(canvas.width, canvas.height - radius);
        ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
        ctx.lineTo(radius, canvas.height);
        ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        
        // Clip the area so the image is drawn inside
        ctx.clip();
      }

      ctx.drawImage(img, 0, 0);
      ctx.filter = 'none'; // Reset filters for border drawing

      // 3. Apply Border (if requested)
      if (settings.borderWidth > 0) {
        const scaleFactor = Math.max(1, canvas.width / 800);
        const scaledBorderWidth = settings.borderWidth * scaleFactor;

        ctx.lineWidth = scaledBorderWidth;
        ctx.strokeStyle = settings.borderColor;
        
        ctx.beginPath();
        if (settings.borderRadius > 0) {
           const radius = (Math.min(canvas.width, canvas.height) * settings.borderRadius) / 100;
           ctx.moveTo(radius, 0);
           ctx.lineTo(canvas.width - radius, 0);
           ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
           ctx.lineTo(canvas.width, canvas.height - radius);
           ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
           ctx.lineTo(radius, canvas.height);
           ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
           ctx.lineTo(0, radius);
           ctx.quadraticCurveTo(0, 0, radius, 0);
        } else {
           ctx.rect(0, 0, canvas.width, canvas.height);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // 4. Format Conversion
      const mimeType = `image/${settings.format}`;
      const dataUrl = canvas.toDataURL(mimeType, settings.quality);
      
      resolve(dataUrl.split(',')[1]);
    };

    img.onerror = () => reject(new Error('Failed to load image for processing'));
    img.src = cleanBase64(imageBase64);
  });
}
