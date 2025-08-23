import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Booking } from './entities/booking.entity';
import { SupabaseService } from '../common/services/supabase.service';

@Injectable()
export class BookingsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createBookingDto: CreateBookingDto, userId: string): Promise<Booking> {
    try {
      // Lấy thông tin phòng để tính toán
      const { data: room, error: roomError } = await this.supabaseService.getClient()
        .from('rooms')
        .select('price_per_night, host_id, max_guests')
        .eq('id', createBookingDto.room_id)
        .single();

      if (roomError) {
        throw new HttpException(
          'Room not found',
          HttpStatus.NOT_FOUND
        );
      }

      // Kiểm tra số khách
      if (createBookingDto.guest_count > room.max_guests) {
        throw new HttpException(
          `Guest count exceeds room capacity (max: ${room.max_guests})`,
          HttpStatus.BAD_REQUEST
        );
      }

      // Tính toán số ngày và tổng tiền
      const checkIn = new Date(createBookingDto.check_in_date);
      const checkOut = new Date(createBookingDto.check_out_date);
      const daysDiff = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 0) {
        throw new HttpException(
          'Check-out date must be after check-in date',
          HttpStatus.BAD_REQUEST
        );
      }

      const totalAmount = room.price_per_night * daysDiff;

      const bookingData = {
        ...createBookingDto,
        user_id: userId,
        host_id: room.host_id,
        total_amount: totalAmount,
        status: createBookingDto.status || 'pending',
        check_in_date: createBookingDto.check_in_date,
        check_out_date: createBookingDto.check_out_date,
      };

      const { data, error } = await this.supabaseService.getClient()
        .from('bookings')
        .insert([bookingData])
        .select()
        .single();

      if (error) {
        throw new HttpException(
          `Failed to create booking: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while creating booking',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAll(): Promise<Booking[]> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new HttpException(
          `Failed to fetch bookings: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while fetching bookings',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOne(id: string): Promise<Booking> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new HttpException(
            'Booking not found',
            HttpStatus.NOT_FOUND
          );
        }
        throw new HttpException(
          `Failed to fetch booking: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while fetching booking',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByUser(userId: string): Promise<Booking[]> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('bookings')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new HttpException(
          `Failed to fetch user bookings: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while fetching user bookings',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByHost(hostId: string): Promise<Booking[]> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('bookings')
        .select('*')
        .eq('host_id', hostId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new HttpException(
          `Failed to fetch host bookings: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while fetching host bookings',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async update(id: string, updateBookingDto: UpdateBookingDto): Promise<Booking> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('bookings')
        .update(updateBookingDto)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new HttpException(
            'Booking not found',
            HttpStatus.NOT_FOUND
          );
        }
        throw new HttpException(
          `Failed to update booking: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while updating booking',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const { error } = await this.supabaseService.getClient()
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) {
        throw new HttpException(
          `Failed to delete booking: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while deleting booking',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async cancelBooking(id: string, userId: string): Promise<Booking> {
    try {
      // Kiểm tra booking có thuộc về user không
      const { data: booking, error: fetchError } = await this.supabaseService.getClient()
        .from('bookings')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        throw new HttpException(
          'Booking not found or not authorized',
          HttpStatus.NOT_FOUND
        );
      }

      if (booking.status === 'cancelled') {
        throw new HttpException(
          'Booking is already cancelled',
          HttpStatus.BAD_REQUEST
        );
      }

      if (booking.status === 'completed') {
        throw new HttpException(
          'Cannot cancel completed booking',
          HttpStatus.BAD_REQUEST
        );
      }

      const { data, error } = await this.supabaseService.getClient()
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new HttpException(
          `Failed to cancel booking: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while cancelling booking',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
