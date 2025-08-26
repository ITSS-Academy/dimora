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



  

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('users')
        .update(updateUserDto)
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
