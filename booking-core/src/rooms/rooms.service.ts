import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Room } from './entities/room.entity';
import { SupabaseService } from '../common/services/supabase.service';

@Injectable()
export class RoomsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('rooms')
        .insert([createRoomDto])
        .select()
        .single();

      if (error) {
        throw new HttpException(
          `Failed to create room: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while creating room',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAll(): Promise<Room[]> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('rooms')
        .select(`
          *,
          room_types (
            id,
            name,
            description,
            icon
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new HttpException(
          `Failed to fetch rooms: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while fetching rooms',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOne(id: string): Promise<Room> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('rooms')
        .select(`
          *,
          room_types (
            id,
            name,
            description,
            icon
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new HttpException(
            'Room not found',
            HttpStatus.NOT_FOUND
          );
        }
        throw new HttpException(
          `Failed to fetch room: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while fetching room',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async update(id: string, updateRoomDto: UpdateRoomDto): Promise<Room> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('rooms')
        .update(updateRoomDto)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new HttpException(
            'Room not found',
            HttpStatus.NOT_FOUND
          );
        }
        throw new HttpException(
          `Failed to update room: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while updating room',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const { error } = await this.supabaseService.getClient()
        .from('rooms')
        .delete()
        .eq('id', id);

      if (error) {
        throw new HttpException(
          `Failed to delete room: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while deleting room',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByHost(hostId: string): Promise<Room[]> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('rooms')
        .select('*')
        .eq('host_id', hostId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new HttpException(
          `Failed to fetch rooms by host: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while fetching rooms by host',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async searchRooms(params: {
    city?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    minPrice?: number;
    maxPrice?: number;
    lat?: number;
    lng?: number;
    radius?: number;
  }): Promise<Room[]> {
    try {
      // If coordinates are provided, use the RPC function
      if (params.lat && params.lng) {
        const { data, error } = await this.supabaseService.getClient()
          .rpc('search_rooms_nearby', {
            lat: params.lat,
            lng: params.lng,
            radius_km: params.radius || 10,
            max_guests: params.guests,
            min_price: params.minPrice,
            max_price: params.maxPrice
          });

        if (error) {
          throw new HttpException(
            `Failed to search rooms nearby: ${error.message}`,
            HttpStatus.BAD_REQUEST
          );
        }

        return data;
      }

      // Otherwise use regular query
      let query = this.supabaseService.getClient()
        .from('rooms')
        .select('*')
        .eq('is_available', true);

      if (params.city) {
        query = query.ilike('city', `%${params.city}%`);
      }

      if (params.guests) {
        query = query.gte('max_guests', params.guests);
      }

      if (params.minPrice) {
        query = query.gte('price_per_night', params.minPrice);
      }

      if (params.maxPrice) {
        query = query.lte('price_per_night', params.maxPrice);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw new HttpException(
          `Failed to search rooms: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while searching rooms',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getHostStats(hostId: string) {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .rpc('get_host_stats', {
          host_uuid: hostId
        });

      if (error) {
        throw new HttpException(
          `Failed to get host stats: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data[0];
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while getting host stats',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
