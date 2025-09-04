import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseService } from '../common/services/supabase.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {

      let newUser:User = {
        id: uuidv4(),
        email: createUserDto.email,
        full_name: createUserDto.full_name,
        created_at: new Date(),
        updated_at: new Date(),
        google_id: createUserDto.google_id,
        phone: createUserDto.phone,
        avatar_url: createUserDto.avatar_url
      }

      const { data, error } = await this.supabaseService.getClient()
        .from('users')
        .insert(newUser)
        .select()
        .single();

      if (error) {
        throw new HttpException(
          `Failed to create user: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to create user',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new HttpException(
          `Failed to fetch users: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data || [];
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch users',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async findOne(id: string): Promise<User> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        throw new HttpException(
          'User not found',
          HttpStatus.NOT_FOUND
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch user',
        HttpStatus.BAD_REQUEST
      );
    }
  }



  async findOneByGoogleId(googleId: string): Promise<User> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('users')
        .select('*')
        .eq('google_id', googleId)
        .single();

      if (error || !data) {
        throw new HttpException(
          'User not found',
          HttpStatus.NOT_FOUND
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch user',
        HttpStatus.BAD_REQUEST
      );
    }
  }



  

  async update(id: string, updateUserDto: UpdateUserDto, avatar?: Express.Multer.File): Promise<User> {
    try {
      let avatarUrl = updateUserDto.avatar_url;

      // Nếu có upload avatar mới
      if (avatar) {
        // Kiểm tra file size (5MB limit)
        if (avatar.size > 5 * 1024 * 1024) {
          throw new HttpException(
            'Avatar file size must not exceed 5MB',
            HttpStatus.BAD_REQUEST
          );
        }

        // Kiểm tra file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(avatar.mimetype)) {
          throw new HttpException(
            'Only image files (jpg, jpeg, png, gif, webp) are allowed',
            HttpStatus.BAD_REQUEST
          );
        }
        // Lấy thông tin user hiện tại để xóa avatar cũ
        const currentUser = await this.findOne(id);
        
        // Xóa avatar cũ nếu có
        if (currentUser.avatar_url) {
          try {
            const oldAvatarPath = this.extractPathFromUrl(currentUser.avatar_url);
            if (oldAvatarPath) {
              await this.supabaseService.getClient()
                .storage
                .from('avatars')
                .remove([oldAvatarPath]);
            }
          } catch (error) {
            console.log('Failed to delete old avatar:', error);
          }
        }

        // Upload avatar mới
        const fileName = `${id}-${Date.now()}`;
        const filePath = `users/${id}/${fileName}`;

        const { error: uploadError } = await this.supabaseService.getClient()
          .storage
          .from('avatars')
          .upload(filePath, avatar.buffer, {
            contentType: avatar.mimetype,
            upsert: true
          });

        if (uploadError) {
          throw new HttpException(
            `Failed to upload avatar: ${uploadError.message}`,
            HttpStatus.BAD_REQUEST
          );
        }

        // Lấy public URL của avatar
        const { data: urlData } = this.supabaseService.getClient()
          .storage
          .from('avatars')
          .getPublicUrl(filePath);

        avatarUrl = urlData.publicUrl;
      }

      // Cập nhật thông tin user
      const updateData = {
        ...updateUserDto,
        ...(avatarUrl && { avatar_url: avatarUrl })
      };

      const { data, error } = await this.supabaseService.getClient()
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error || !data) {
        throw new HttpException(
          'User not found or update failed',
          HttpStatus.NOT_FOUND
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update user',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Helper method để extract path từ Supabase URL
   */
  private extractPathFromUrl(url: string): string | null {
    try {
      const urlParts = url.split('/storage/v1/object/public/avatars/');
      return urlParts[1] || null;
    } catch (error) {
      return null;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const { error } = await this.supabaseService.getClient()
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        throw new HttpException(
          `Failed to delete user: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete user',
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
