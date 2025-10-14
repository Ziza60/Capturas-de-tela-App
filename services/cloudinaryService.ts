import { CloudinaryConfig } from '../types';

export const uploadToCloudinary = async (
  imageData: string | File, // Aceita tanto base64 quanto objeto File
  config: CloudinaryConfig
): Promise<string> => {
  const { cloudName, uploadPreset } = config;

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  
  const formData = new FormData();
  // FormData.append lida com ambos os tipos (string base64 ou File)
  formData.append('file', imageData);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error.message || `Falha no upload com status ${response.status}`);
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Erro no upload para o Cloudinary:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro de rede ou resposta inválida.';
    throw new Error(`Falha no upload para o Cloudinary: ${errorMessage}`);
  }
};