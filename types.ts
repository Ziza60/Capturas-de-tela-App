export enum ScreenshotStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export enum UploadStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface Screenshot {
  id: string;
  url: string;
  status: ScreenshotStatus;
  imageData?: string;
  error?: string;
  uploadStatus: UploadStatus;
  cloudinaryUrl?: string;
  uploadError?: string;
}

export interface LocalFile {
  id: string;
  file: File;
  previewUrl: string;
  uploadStatus: UploadStatus;
  cloudinaryUrl?: string;
  uploadError?: string;
}


export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
}