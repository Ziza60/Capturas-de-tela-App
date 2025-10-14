// This service uses the Microlink API to generate a screenshot and then
// converts it to a data URL. This two-step process is more reliable
// because Microlink's image CDN provides the necessary CORS headers
// to allow the image to be processed by a canvas in the browser.

export const fetchScreenshot = (url: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    // Step 1: Use Microlink API to get a URL for the screenshot.
    // We remove `&embed=screenshot.url` to get the full JSON response, which is more reliable.
    const microlinkApiUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false`;
    let screenshotUrl = '';

    try {
      const response = await fetch(microlinkApiUrl);
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Microlink API error for ${url}:`, errorBody);
        throw new Error(`A requisição para a API falhou com o status ${response.status}`);
      }
      const data = await response.json();
      // The screenshot URL is nested inside the 'data' object in the standard response.
      if (data.status === 'success' && data.data.screenshot?.url) {
        screenshotUrl = data.data.screenshot.url;
      } else {
        throw new Error(data.message || 'A API Microlink não retornou uma URL de captura de tela válida.');
      }
    } catch (error) {
      console.error(`Microlink API fetch failed for ${url}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Erro de API desconhecido';
      reject(new Error(`Não foi possível capturar ${url}. Motivo: Falha ao obter o link da captura de tela. (${errorMessage})`));
      return;
    }

    if (!screenshotUrl) {
      reject(new Error(`Não foi possível capturar ${url}. Motivo: Nenhuma URL de captura de tela foi retornada pela API.`));
      return;
    }

    // Step 2: Load the screenshot image from the URL and convert it to a data URL via canvas.
    const img = new Image();
    // This is crucial for enabling the canvas to read pixel data from a cross-origin image.
    img.crossOrigin = 'anonymous'; 

    const timeoutId = setTimeout(() => {
      // Clean up event listeners to prevent memory leaks if the image load times out.
      img.onload = null;
      img.onerror = null;
      reject(new Error(`Não foi possível capturar ${url}. Motivo: A requisição expirou ao carregar a imagem.`));
    }, 20000); // 20-second timeout.

    img.onload = () => {
      clearTimeout(timeoutId);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // This should realistically not happen in any modern browser.
          reject(new Error('Falha ao obter o contexto 2D do canvas.'));
          return;
        }

        ctx.drawImage(img, 0, 0);
        
        // Convert the canvas content to a base64 data URL in JPEG format.
        const dataUrl = canvas.toDataURL('image/jpeg');
        resolve(dataUrl);
      } catch (e) {
        console.error(`Canvas operation failed for ${url}:`, e);
        // This catch block will be hit if the canvas is "tainted" due to CORS issues that crossOrigin="anonymous" could not resolve.
        reject(new Error(`Não foi possível processar a imagem para ${url}. Isso pode ser um problema de segurança de origem cruzada.`));
      }
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      // This error can occur if the API endpoint is down, the requested URL is invalid, or the image is corrupt.
      reject(new Error(`Não foi possível capturar ${url}. Motivo: Falha ao carregar a imagem da captura de tela.`));
    };
    
    // Setting the src attribute begins the image loading process.
    img.src = screenshotUrl;
  });
};