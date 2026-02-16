// Cherokee Bank - Storage Configuration
export const storageConfig = {
  bucket: process.env.STORAGE_BUCKET || 'cherokee-bank-assets',
  region: process.env.STORAGE_REGION || 'us-east-1',
  
  // Upload limits
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
  ],
  
  // Directory structure
  paths: {
    kycDocuments: 'kyc-documents',
    profilePhotos: 'profile-photos',
    merchantLogos: 'merchant-logos',
    receipts: 'receipts',
  },
  
  // For local development, store in public/uploads
  localUploadDir: 'public/uploads',
};
