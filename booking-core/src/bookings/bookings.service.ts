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
        console.log('❌ [BOOKING SERVICE] Room ID requested:', createBookingDto.room_id);
        throw new HttpException(
          'Room not found',
          HttpStatus.NOT_FOUND
        );
      }
      
      console.log('✅ [BOOKING SERVICE] Room found:', {
        host_id: room.host_id,
        price_per_night: room.price_per_night,
        max_guests: room.max_guests
      });

      // Kiểm tra số khách
      console.log('🔍 [BOOKING SERVICE] Checking guest count...');
      if (createBookingDto.guest_count > room.max_guests) {
        console.log('❌ [BOOKING SERVICE] Guest count exceeds limit:', createBookingDto.guest_count, '>', room.max_guests);
        throw new HttpException(
          `Guest count exceeds room capacity (max: ${room.max_guests})`,
          HttpStatus.BAD_REQUEST
        );
      }
      console.log('✅ [BOOKING SERVICE] Guest count OK:', createBookingDto.guest_count);

      // Tính toán số ngày và tổng tiền
      console.log('🔍 [BOOKING SERVICE] Calculating dates and amount...');
      const checkIn = new Date(createBookingDto.check_in_date);
      const checkOut = new Date(createBookingDto.check_out_date);
      const daysDiff = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log('📅 [BOOKING SERVICE] Date calculation:', {
        check_in: checkIn.toISOString(),
        check_out: checkOut.toISOString(),
        days_diff: daysDiff
      });
      
      if (daysDiff <= 0) {
        console.log('❌ [BOOKING SERVICE] Invalid date range');
        throw new HttpException(
          'Check-out date must be after check-in date',
          HttpStatus.BAD_REQUEST
        );
      }

      const totalAmount = room.price_per_night * daysDiff;
      console.log('💰 [BOOKING SERVICE] Total amount calculated:', totalAmount);

      const bookingData = {
        guest_count: createBookingDto.guest_count,
        guest_notes: createBookingDto.guest_notes,
        room_id: createBookingDto.room_id,
        user_id: userId,
        host_id: room.host_id,
        total_amount: totalAmount,
        status: createBookingDto.status || 'pending',
        check_in_date: createBookingDto.check_in_date,
        check_out_date: createBookingDto.check_out_date,
      };
      
      console.log('📝 [BOOKING SERVICE] Final booking data:', JSON.stringify(bookingData, null, 2));

      console.log('🚀 [BOOKING SERVICE] Inserting booking into database...');
      const { data, error } = await this.supabaseService.getClient()
        .from('bookings')
        .insert([bookingData])
        .select()
        .single();

      if (error) {
        console.log('❌ [BOOKING SERVICE] Database error:', error.message);
        console.log('❌ [BOOKING SERVICE] Error details:', JSON.stringify(error, null, 2));
        throw new HttpException(
          `Failed to create booking: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      console.log('✅ [BOOKING SERVICE] Booking created successfully:', data.id);
      return data;
    } catch (error) {
      console.log('💥 [BOOKING SERVICE] Exception caught:', error);
      console.log('💥 [BOOKING SERVICE] Error type:', typeof error);
      console.log('💥 [BOOKING SERVICE] Error message:', error.message);
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
        'Failed to fetch booking',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Lấy tất cả booking của host
   */
  async getHostBookings(hostId: string): Promise<any[]> {
    try {
      // Lấy bookings của host
      const { data: bookings, error: bookingsError } = await this.supabaseService.getClient()
        .from('bookings')
        .select('*')
        .eq('host_id', hostId)
        .order('created_at', { ascending: false });

      if (bookingsError) {
        throw new HttpException(
          `Failed to fetch host bookings: ${bookingsError.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      if (!bookings || bookings.length === 0) {
        return [];
      }

      // Lấy thông tin rooms
      const roomIds = [...new Set(bookings.map(booking => booking.room_id))];
      const { data: rooms, error: roomsError } = await this.supabaseService.getClient()
        .from('rooms')
        .select('id, title, address, city, country')
        .in('id', roomIds);

      if (roomsError) {
        throw new HttpException(
          `Failed to fetch rooms: ${roomsError.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      // Lấy thông tin users
      const userIds = [...new Set(bookings.map(booking => booking.user_id))];
      const { data: users, error: usersError } = await this.supabaseService.getClient()
        .from('users')
        .select('id, email, full_name, phone')
        .in('id', userIds);

      if (usersError) {
        throw new HttpException(
          `Failed to fetch users: ${usersError.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      // Tạo maps để join data
      const roomsMap = new Map(rooms?.map(room => [room.id, room]) || []);
      const usersMap = new Map(users?.map(user => [user.id, user]) || []);

      // Join data
      const result = bookings.map(booking => ({
        ...booking,
        rooms: roomsMap.get(booking.room_id) || null,
        users: usersMap.get(booking.user_id) || null
      }));

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch host bookings',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Lấy booking của một phòng cụ thể
   */
  async getRoomBookings(roomId: string, hostId: string): Promise<any[]> {
    try {
      // Kiểm tra xem phòng có thuộc về host không
      const { data: room, error: roomError } = await this.supabaseService.getClient()
        .from('rooms')
        .select('host_id')
        .eq('id', roomId)
        .single();

      if (roomError || !room) {
        throw new HttpException(
          'Room not found',
          HttpStatus.NOT_FOUND
        );
      }

      if (room.host_id !== hostId) {
        throw new HttpException(
          'Access denied: Room does not belong to this host',
          HttpStatus.FORBIDDEN
        );
      }

      // Lấy bookings của phòng
      const { data: bookings, error: bookingsError } = await this.supabaseService.getClient()
        .from('bookings')
        .select('*')
        .eq('room_id', roomId)
        .order('check_in_date', { ascending: true });

      if (bookingsError) {
        throw new HttpException(
          `Failed to fetch room bookings: ${bookingsError.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      if (!bookings || bookings.length === 0) {
        return [];
      }

      // Lấy thông tin users
      const userIds = [...new Set(bookings.map(booking => booking.user_id))];
      const { data: users, error: usersError } = await this.supabaseService.getClient()
        .from('users')
        .select('id, email, full_name, phone')
        .in('id', userIds);

      if (usersError) {
        throw new HttpException(
          `Failed to fetch users: ${usersError.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      // Tạo map để join data
      const usersMap = new Map(users?.map(user => [user.id, user]) || []);

      // Join data
      const result = bookings.map(booking => ({
        ...booking,
        users: usersMap.get(booking.user_id) || null
      }));

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch room bookings',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Lấy booking theo khoảng thời gian (sử dụng RPC)
   */
  async getHostBookingsByDateRange(
    hostId: string, 
    startDate: string, 
    endDate: string
  ): Promise<any[]> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .rpc('get_host_bookings_by_date_range', { 
          host_uuid: hostId,
          start_date: startDate,
          end_date: endDate
        });

      if (error) {
        throw new HttpException(
          `Failed to fetch host bookings by date range: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data || [];
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch host bookings by date range',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Lấy thống kê booking của host (sử dụng RPC)
   */
  async getHostBookingStats(hostId: string): Promise<any> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .rpc('get_host_booking_stats', { host_uuid: hostId });

      if (error) {
        throw new HttpException(
          `Failed to get host booking stats: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data || {};
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to get host booking stats',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Lấy lịch availability của phòng (sử dụng RPC)
   */
  async getRoomAvailability(
    roomId: string, 
    hostId: string, 
    startDate: string, 
    endDate: string
  ): Promise<any> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .rpc('get_room_availability_calendar', { 
          room_uuid: roomId,
          host_uuid: hostId,
          start_date: startDate,
          end_date: endDate
        });

      if (error) {
        throw new HttpException(
          `Failed to get room availability: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data || {};
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to get room availability',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Lấy availability của tất cả phòng của host
   */
  async getHostRoomsAvailability(
    hostId: string, 
    startDate: string, 
    endDate: string
  ): Promise<any> {
    try {
      // Lấy tất cả phòng của host
      const { data: rooms, error: roomsError } = await this.supabaseService.getClient()
        .from('rooms')
        .select('id, title, address, city')
        .eq('host_id', hostId);

      if (roomsError) {
        throw new HttpException(
          `Failed to fetch host rooms: ${roomsError.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      // Lấy availability cho từng phòng
      const roomsAvailability = await Promise.all(
        rooms.map(async (room) => {
          try {
            return await this.getRoomAvailability(room.id, hostId, startDate, endDate);
          } catch (error) {
            return {
              room_id: room.id,
              room_title: room.title,
              error: error.message
            };
          }
        })
      );

      return {
        host_id: hostId,
        start_date: startDate,
        end_date: endDate,
        rooms: roomsAvailability
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to get host rooms availability',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Kiểm tra xem phòng có available trong khoảng thời gian không (sử dụng RPC)
   */
  async checkRoomAvailability(
    roomId: string,
    checkInDate: string,
    checkOutDate: string
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .rpc('check_room_availability_api', { 
          room_uuid: roomId,
          check_in_date_param: checkInDate,
          check_out_date_param: checkOutDate
        });

      if (error) {
        throw new HttpException(
          `Failed to check room availability: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data?.is_available || false;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to check room availability',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async findByUser(userId: string): Promise<Booking[]> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .rpc('get_user_bookings', { user_uuid: userId });

      if (error) {
        console.log('❌ [BOOKING SERVICE] Database error:', error.message);
        throw new HttpException(
          `Failed to fetch user bookings: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data || [];
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
        .rpc('get_host_bookings', { host_uuid: hostId });

      if (error) {
        throw new HttpException(
          `Failed to fetch host bookings: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data || [];
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
