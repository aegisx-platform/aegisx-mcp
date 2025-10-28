import { pipeline } from 'stream/promises';
import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { FastifyInstance } from 'fastify';
import { MultipartFile } from '@fastify/multipart';
import { AvatarUploadResult, AvatarFile } from '../user-profile.types';

export interface AvatarServiceDependencies {
  logger: FastifyInstance['log'];
}

export class AvatarService {
  private readonly uploadDir: string;
  private readonly baseUrl: string;
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly thumbnailSizes = {
    small: 64,
    medium: 128,
    large: 256,
  };

  constructor(
    private deps: AvatarServiceDependencies,
    uploadDir?: string,
    baseUrl?: string,
  ) {
    this.uploadDir =
      uploadDir || path.join(process.cwd(), 'uploads', 'avatars');
    this.baseUrl = baseUrl || process.env.API_BASE_URL || '';
  }

  async processAvatarUpload(
    file: MultipartFile,
    userId: string,
  ): Promise<AvatarUploadResult> {
    // Validate file
    this.validateFile(file);

    // Ensure upload directory exists
    await this.ensureUploadDirectory();

    // Generate unique filename
    const fileExtension = this.getFileExtension(file.mimetype);
    const baseFilename = `${userId}_${uuidv4()}`;

    // Process and save original image
    const originalPath = path.join(
      this.uploadDir,
      `${baseFilename}.${fileExtension}`,
    );
    const buffer = await file.toBuffer();

    // Optimize and save the main image
    const optimizedBuffer = await sharp(buffer)
      .resize(512, 512, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 90 })
      .toBuffer();

    await fs.writeFile(originalPath, optimizedBuffer);

    // Generate thumbnails
    const thumbnails = await this.generateThumbnails(
      buffer,
      baseFilename,
      fileExtension,
    );

    // Build URLs
    const avatar = this.buildUrl(`${baseFilename}.${fileExtension}`);
    const thumbnailUrls = {
      small: this.buildUrl(thumbnails.small),
      medium: this.buildUrl(thumbnails.medium),
      large: this.buildUrl(thumbnails.large),
    };

    this.deps.logger.info(
      {
        userId,
        originalFilename: file.filename,
        fileSize: buffer.length,
        mimeType: file.mimetype,
      },
      'Avatar uploaded and processed successfully',
    );

    return {
      avatar,
      thumbnails: thumbnailUrls,
    };
  }

  async deleteAvatarFiles(avatarFile: AvatarFile): Promise<void> {
    try {
      // Delete main file
      const mainFilePath = path.join(
        this.uploadDir,
        path.basename(avatarFile.storagePath),
      );
      await this.deleteFileIfExists(mainFilePath);

      // Delete thumbnails
      if (avatarFile.thumbnails) {
        for (const thumbnailUrl of Object.values(avatarFile.thumbnails)) {
          // Extract filename from URL (handle both relative and absolute URLs)
          let filename: string;
          if (thumbnailUrl.startsWith('http://') || thumbnailUrl.startsWith('https://')) {
            filename = path.basename(new URL(thumbnailUrl).pathname);
          } else {
            filename = path.basename(thumbnailUrl);
          }
          
          const thumbnailPath = path.join(this.uploadDir, filename);
          await this.deleteFileIfExists(thumbnailPath);
        }
      }

      this.deps.logger.info(
        {
          userId: avatarFile.userId,
          avatarId: avatarFile.id,
        },
        'Avatar files deleted successfully',
      );
    } catch (error) {
      this.deps.logger.error(
        {
          error,
          userId: avatarFile.userId,
          avatarId: avatarFile.id,
        },
        'Error deleting avatar files',
      );
      throw error;
    }
  }

  async cleanupOrphanedFiles(): Promise<void> {
    // This could be implemented as a background job
    // For now, we'll just log that cleanup is needed
    this.deps.logger.info(
      'Avatar cleanup requested - implement as background job',
    );
  }

  private validateFile(file: MultipartFile): void {
    // Check mime type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new Error('UNSUPPORTED_MEDIA_TYPE');
    }

    // Check file size (if available)
    if (
      file.file.readableLength &&
      file.file.readableLength > this.maxFileSize
    ) {
      throw new Error('FILE_TOO_LARGE');
    }
  }

  private async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
      this.deps.logger.info(
        { uploadDir: this.uploadDir },
        'Created avatar upload directory',
      );
    }
  }

  private async generateThumbnails(
    buffer: Buffer,
    baseFilename: string,
    extension: string,
  ): Promise<{ small: string; medium: string; large: string }> {
    const thumbnails: { small: string; medium: string; large: string } = {
      small: '',
      medium: '',
      large: '',
    };

    for (const [size, pixels] of Object.entries(this.thumbnailSizes)) {
      const thumbnailFilename = `${baseFilename}_${size}.${extension}`;
      const thumbnailPath = path.join(this.uploadDir, thumbnailFilename);

      const thumbnailBuffer = await sharp(buffer)
        .resize(pixels, pixels, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      await fs.writeFile(thumbnailPath, thumbnailBuffer);
      thumbnails[size as keyof typeof thumbnails] = thumbnailFilename;
    }

    return thumbnails;
  }

  private getFileExtension(mimeType: string): string {
    const extensions: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };

    return extensions[mimeType] || 'jpg';
  }

  private buildUrl(filename: string): string {
    // Use relative URL for Angular proxy compatibility
    if (this.baseUrl) {
      return `${this.baseUrl}/api/uploads/avatars/${filename}`;
    }
    return `/api/uploads/avatars/${filename}`;
  }

  private async deleteFileIfExists(filePath: string): Promise<void> {
    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
    } catch {
      // File doesn't exist, which is fine
    }
  }
}
