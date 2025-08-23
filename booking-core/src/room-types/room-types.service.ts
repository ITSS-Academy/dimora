import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';
import { RoomType } from './entities/room-type.entity';
import { SupabaseService } from '../common/services/supabase.service';

@Injectable()
export class RoomTypesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createRoomTypeDto: CreateRoomTypeDto): Promise<RoomType> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('room_types')
        .insert([createRoomTypeDto])
        .select()
        .single();

      if (error) {
        throw new HttpException(
          `Failed to create room type: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while creating room type',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAll(): Promise<RoomType[]> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('room_types')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw new HttpException(
          `Failed to fetch room types: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while fetching room types',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOne(id: string): Promise<RoomType> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('room_types')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new HttpException(
            'Room type not found',
            HttpStatus.NOT_FOUND
          );
        }
        throw new HttpException(
          `Failed to fetch room type: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while fetching room type',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async update(id: string, updateRoomTypeDto: UpdateRoomTypeDto): Promise<RoomType> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('room_types')
        .update(updateRoomTypeDto)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new HttpException(
            'Room type not found',
            HttpStatus.NOT_FOUND
          );
        }
        throw new HttpException(
          `Failed to update room type: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while updating room type',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      // Kiểm tra xem có phòng nào đang sử dụng loại này không
      const { data: roomsUsingType, error: checkError } = await this.supabaseService.getClient()
        .from('rooms')
        .select('id')
        .eq('room_type_id', id)
        .limit(1);

      if (checkError) {
        throw new HttpException(
          `Failed to check room type usage: ${checkError.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      if (roomsUsingType && roomsUsingType.length > 0) {
        throw new HttpException(
          'Cannot delete room type that is being used by rooms',
          HttpStatus.BAD_REQUEST
        );
      }

      const { error } = await this.supabaseService.getClient()
        .from('room_types')
        .delete()
        .eq('id', id);

      if (error) {
        throw new HttpException(
          `Failed to delete room type: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while deleting room type',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
