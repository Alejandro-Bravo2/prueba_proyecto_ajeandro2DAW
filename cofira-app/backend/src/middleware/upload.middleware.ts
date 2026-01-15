import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import sharp from 'sharp';
import fs from 'fs/promises';

// Configure multer for memory storage (we'll process with sharp)
const storage = multer.memoryStorage();

// File filter for images
const imageFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WebP, HEIC) are allowed'));
  }
};

// Multer upload configuration
export const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 1
  }
});

// Process and save image
export async function processAndSaveImage(
  buffer: Buffer,
  filename: string,
  folder: string = 'meals'
): Promise<string> {
  const uploadsDir = path.join(process.cwd(), 'uploads', folder);

  // Ensure directory exists
  await fs.mkdir(uploadsDir, { recursive: true });

  // Generate unique filename
  const uniqueName = `${Date.now()}-${filename.replace(/\.[^/.]+$/, '')}.webp`;
  const filepath = path.join(uploadsDir, uniqueName);

  // Process image with sharp
  await sharp(buffer)
    .resize(1200, 1200, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ quality: 85 })
    .toFile(filepath);

  return `/uploads/${folder}/${uniqueName}`;
}

// Convert image to base64 for AI analysis
export async function imageToBase64(buffer: Buffer): Promise<string> {
  // Resize for AI processing (smaller = faster + cheaper)
  const processedBuffer = await sharp(buffer)
    .resize(800, 800, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({ quality: 80 })
    .toBuffer();

  return processedBuffer.toString('base64');
}

// Delete image file
export async function deleteImage(imagePath: string): Promise<void> {
  try {
    const fullPath = path.join(process.cwd(), imagePath);
    await fs.unlink(fullPath);
  } catch (error) {
    console.error('Failed to delete image:', error);
  }
}
