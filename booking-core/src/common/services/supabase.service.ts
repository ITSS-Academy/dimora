import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables: SUPABASE_URL and SUPABASE_ANON_KEY are required');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Upload file vào Supabase Storage
   * @param bucket Tên bucket
   * @param path Đường dẫn file
   * @param file File cần upload
   * @returns Promise với thông tin file đã upload
   */
  async uploadFile(bucket: string, path: string, file: Express.Multer.File) {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(path, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      return data;
    } catch (error) {
      throw new Error(`File upload error: ${error.message}`);
    }
  }

  /**
   * Lấy public URL của file
   * @param bucket Tên bucket
   * @param path Đường dẫn file
   * @returns Public URL
   */
  getPublicUrl(bucket: string, path: string): string {
    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }

  /**
   * Xóa file từ Supabase Storage
   * @param bucket Tên bucket
   * @param path Đường dẫn file
   * @returns Promise với kết quả xóa
   */
  async deleteFile(bucket: string, path: string) {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        throw new Error(`Delete failed: ${error.message}`);
      }

      return data;
    } catch (error) {
      throw new Error(`File delete error: ${error.message}`);
    }
  }

  /**
   * Upload nhiều file cho room
   * @param hostId ID của host
   * @param roomId ID của room
   * @param files Danh sách file
   * @returns Promise với danh sách URL của các file đã upload
   */
  async uploadRoomImages(hostId: string, roomId: string, files: Express.Multer.File[]): Promise<string[]> {
    const uploadedUrls: string[] = [];
    const bucket = 'rooms';

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `${i + 1}.${fileExtension}`;
        const filePath = `${hostId}/${roomId}/${fileName}`;

        // Upload file
        await this.uploadFile(bucket, filePath, file);
        
        // Lấy public URL
        const publicUrl = this.getPublicUrl(bucket, filePath);
        uploadedUrls.push(publicUrl);
      }

      return uploadedUrls;
    } catch (error) {
      // Nếu có lỗi, xóa các file đã upload
      for (const url of uploadedUrls) {
        const path = url.split('/').slice(-3).join('/'); // Lấy path từ URL
        try {
          await this.deleteFile(bucket, path);
        } catch (deleteError) {
          console.error('Failed to delete file after upload error:', deleteError);
        }
      }
      throw error;
    }
  }

  /**
   * Xóa tất cả hình ảnh của room
   * @param hostId ID của host
   * @param roomId ID của room
   * @returns Promise với kết quả xóa
   */
  async deleteRoomImages(hostId: string, roomId: string): Promise<void> {
    const bucket = 'rooms';
    const folderPath = `${hostId}/${roomId}`;

    try {
      // Lấy danh sách file trong folder
      const { data: files, error: listError } = await this.supabase.storage
        .from(bucket)
        .list(folderPath);

      if (listError) {
        throw new Error(`Failed to list files: ${listError.message}`);
      }

      if (files && files.length > 0) {
        const filePaths = files.map(file => `${folderPath}/${file.name}`);
        
        // Xóa tất cả file
        const { error: deleteError } = await this.supabase.storage
          .from(bucket)
          .remove(filePaths);

        if (deleteError) {
          throw new Error(`Failed to delete files: ${deleteError.message}`);
        }
      }
    } catch (error) {
      throw new Error(`Delete room images error: ${error.message}`);
    }
  }
}
