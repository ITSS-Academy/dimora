import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room-with-images.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { CreateRoomLikeDto } from './dto/create-room-like.dto';
import { Room } from './entities/room.entity';
import { RoomLike } from './entities/room-like.entity';
import { Amenity } from './entities/amenity.entity';
import { SupabaseService } from '../common/services/supabase.service';

@Injectable()
export class RoomsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Helper method để xử lý amenities array
   */
  private processAmenities(amenities: any): string[] {
    if (Array.isArray(amenities)) {
      return amenities;
    }
    if (typeof amenities === 'string') {
      try {
        return JSON.parse(amenities);
      } catch {
        return [];
      }
    }
    return [];
  }

  /**
   * Lấy tọa độ từ địa chỉ sử dụng Google Geocoding API
   * @param address Địa chỉ cần geocode
   * @returns Promise<{latitude: number, longitude: number}>
   */
  async getCoordinatesFromAddress(address: string): Promise<{latitude: number, longitude: number}> {
    try {
      // Sử dụng Google Geocoding API
      const encodedAddress = encodeURIComponent(address);
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        throw new HttpException(
          'Google Maps API key not configured',
          HttpStatus.BAD_REQUEST
        );
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`
      );

      if (!response.ok) {
        throw new HttpException(
          'Failed to geocode address',
          HttpStatus.BAD_REQUEST
        );
      }

    

      const data = await response.json();
      data.results.forEach(result => {
        console.log('result', result.geometry.location);
      })

      if (data.status !== 'OK' || !data.results || data.results.length === 0) {
        throw new HttpException(
          'Address not found or invalid',
          HttpStatus.BAD_REQUEST
        );
      }

      const location = data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to get coordinates from address',
        HttpStatus.BAD_REQUEST
      );
    }
  }



  /**
   * Tạo phòng với upload hình ảnh (bắt buộc)
   */
  async create(createRoomDto: CreateRoomDto, files: Express.Multer.File[]): Promise<Room> {
    try {
      // Tạo room trước để lấy ID
      console.log('🔍 [ROOM SERVICE] Creating room with data:', createRoomDto);
      const roomData: CreateRoomDto = { 
        ...createRoomDto, 
        amenities: this.processAmenities(createRoomDto.amenities),
        images: [],
        latitude: createRoomDto.latitude || 0,
        longitude: createRoomDto.longitude || 0,
        postal_code: createRoomDto.postal_code ? Number(createRoomDto.postal_code) : 700000
      };
      
      // Nếu không có tọa độ, tự động lấy từ địa chỉ
      if (!roomData.latitude || !roomData.longitude) {
        const fullAddress = `${roomData.address}, ${roomData.city}, ${roomData.country}`;
        const coordinates = await this.getCoordinatesFromAddress(fullAddress);
        roomData.latitude = coordinates.latitude;
        roomData.longitude = coordinates.longitude;
      }
      console.log('🔍 [ROOM SERVICE] Room data with coordinates:', roomData);

      // Tạo room trực tiếp trong database
      const { data: createdRoom, error: createError } = await this.supabaseService.getClient()
        .from('rooms')
        .insert([roomData])
        .select()
        .single();

      if (createError) {
        throw new HttpException(
          `Failed to create room: ${createError.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      // Upload hình ảnh nếu có
      if (files && files.length > 0) {
        try {
          const imageUrls = await this.supabaseService.uploadRoomImages(
            createRoomDto.host_id,
            createdRoom.id,
            files
          );

          // Cập nhật room với danh sách hình ảnh
          const updatedRoom = await this.update(createdRoom.id, {
            images: imageUrls
          });

          return updatedRoom;
        } catch (uploadError) {
          // Nếu upload thất bại, xóa room đã tạo
          // await this.remove(createdRoom.id);
          throw new HttpException(
            `Failed to upload images: ${uploadError.message}`,
            HttpStatus.BAD_REQUEST
          );
        }
      }

      return createdRoom;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to create room with images',
        HttpStatus.BAD_REQUEST
      );
    }
  }



  async findAll(): Promise<Room[]> {
    try {
      // Sử dụng RPC để lấy rooms với amenities đã được join
      const { data, error } = await this.supabaseService.getClient()
        .rpc('get_all_rooms_with_amenities');

      if (error) {
        throw new HttpException(
          `Failed to fetch rooms: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data || [];
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch rooms',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async findOne(id: string): Promise<Room> {
    try {
      // Sử dụng RPC để lấy room với amenities đã được join
      const { data, error } = await this.supabaseService.getClient()
        .rpc('get_room_by_id_with_amenities', { room_id: id });

      if (error) {
        throw new HttpException(
          `Failed to fetch room: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      if (!data || data.length === 0) {
        throw new HttpException(
          'Room not found',
          HttpStatus.NOT_FOUND
        );
      }

      return data[0];
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch room',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Kiểm tra xem host có quyền update room không
   */
  async checkRoomOwnership(roomId: string, hostId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('rooms')
        .select('host_id')
        .eq('id', roomId)
        .single();

      if (error) {
        throw new HttpException(
          'Room not found',
          HttpStatus.NOT_FOUND
        );
      }

      return data.host_id === hostId;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to check room ownership',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async update(id: string, updateRoomDto: UpdateRoomDto): Promise<Room> {
    try {
      // Kiểm tra ownership nếu có host_id trong request
      if (updateRoomDto.host_id) {
        const isOwner = await this.checkRoomOwnership(id, updateRoomDto.host_id);
        if (!isOwner) {
          throw new HttpException(
            'You can only update your own rooms',
            HttpStatus.FORBIDDEN
          );
        }
      }

      // Xử lý amenities array trước khi gửi đến database
      let amenities = updateRoomDto.amenities;
      if (amenities && typeof amenities === 'string') {
        if ((amenities as string).trim() === '') {
          // Nếu amenities là string rỗng, bỏ qua field này
          amenities = undefined;
        } else if ((amenities as string).trim() === '[]') {
          // Nếu amenities là string "[]", bỏ qua field này (giữ nguyên amenities cũ)

          amenities = [];
        } else {
          try {
            amenities = JSON.parse(amenities as string);
            // Nếu parse thành mảng rỗng, bỏ qua field này
            if (Array.isArray(amenities) && amenities.length === 0) {
              amenities = [];
            }
          } catch {
            amenities = [];
          }
        }
      } else if (Array.isArray(amenities) && amenities.length === 0) {
        // Nếu amenities là mảng rỗng, bỏ qua field này (giữ nguyên amenities cũ)
        amenities = [];
      }

      // Lọc bỏ các trường rỗng để tránh lỗi database
      const filteredData = Object.fromEntries(
        Object.entries(updateRoomDto).filter(([key, value]) => {
          if (value === undefined || value === null) return false;
          if (typeof value === 'string' && value.trim() === '') return false;
          return true;
        })
      ) as Partial<UpdateRoomDto>;

      const roomData = {
        ...filteredData,
        ...(amenities !== undefined && { amenities: amenities as string[] })
      };

      // Kiểm tra xem có cần cập nhật tọa độ không
      const needsGeocoding = (
        (roomData.address && !roomData.latitude && !roomData.longitude) ||
        (roomData.city && !roomData.latitude && !roomData.longitude) ||
        (roomData.country && !roomData.latitude && !roomData.longitude)
      );

      // Nếu cần geocoding và có đủ thông tin địa chỉ
      if (needsGeocoding && roomData.address && roomData.city && roomData.country) {
        try {
          const fullAddress = `${roomData.address}, ${roomData.city}, ${roomData.country}`;
          const coordinates = await this.getCoordinatesFromAddress(fullAddress);
          roomData.latitude = coordinates.latitude;
          roomData.longitude = coordinates.longitude;
        } catch (geocodingError) {
          // Nếu geocoding thất bại, vẫn tiếp tục update thông tin khác
          console.warn('Geocoding failed during update:', geocodingError.message);
        }
      }

      const { data, error } = await this.supabaseService.getClient()
        .from('rooms')
        .update(roomData)
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
        'Failed to update room',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async remove(id: string, hostId: string): Promise<Room[]> {
    try {
      // Kiểm tra ownership nếu có hostId
      if (hostId) {
        const isOwner = await this.checkRoomOwnership(id, hostId);
        if (!isOwner) {
          throw new HttpException(
            'You can only delete your own rooms',
            HttpStatus.FORBIDDEN
          );
        }
      }

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
        'Failed to delete room',
        HttpStatus.BAD_REQUEST
      );
    }


    let data = this.findByHost(hostId)

    return data
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
        'Failed to fetch rooms by host',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async searchRooms(params: {
    location: string;
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    minPrice?: number;
    maxPrice?: number;
    radius?: number;
    amenities?: number[];
  }): Promise<Room[]> {
    try {
      // If location is provided, geocode it first then use RPC function
        // Geocode the location to get coordinates

        const coordinates = await this.getCoordinatesFromAddress(params.location);
        
        if (!coordinates) {
          throw new HttpException(
            'Could not find coordinates for the provided location',
            HttpStatus.BAD_REQUEST
          );
        }

        console.log('params', params);
   

        const { data, error } = await this.supabaseService.getClient()
          .rpc('search_rooms_nearby', {
            lat_param: coordinates.latitude,
            lng_param: coordinates.longitude,
            check_in_date_param: params.checkIn || null,
            check_out_date_param: params.checkOut || null,
            radius_km_param: params.radius || 50,
            max_guests_param: Number(params.guests) || null,
            min_price_param: Number(params.minPrice) || null,
            max_price_param: Number(params.maxPrice) || null,
            search_term: params.location,  // Thêm search term để xử lý tiếng Việt
            amenities_param: params.amenities || null
          });
          console.log('data', error);

        if (error) {
          throw new HttpException(
            `Failed to search rooms nearby: ${error.message}`,
            HttpStatus.BAD_REQUEST
          );
        }

        return data as Room[];
      

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to search rooms',
        HttpStatus.BAD_REQUEST
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
        'Failed to get host stats',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Cập nhật hình ảnh cho room
   * @param roomId ID của room
   * @param hostId ID của host
   * @param files Danh sách file mới
   * @returns Promise với room đã cập nhật
   */
  async updateRoomImages(roomId: string, hostId: string, files: Express.Multer.File[]): Promise<Room> {
    try {
      // Kiểm tra ownership trước khi update hình ảnh
      const isOwner = await this.checkRoomOwnership(roomId, hostId);
      if (!isOwner) {
        throw new HttpException(
          'You can only update images of your own rooms',
          HttpStatus.FORBIDDEN
        );
      }

      // Xóa hình ảnh cũ
      await this.supabaseService.deleteRoomImages(hostId, roomId);

      // Upload hình ảnh mới
      const imageUrls = await this.supabaseService.uploadRoomImages(hostId, roomId, files);

      // Cập nhật room với danh sách hình ảnh mới
      const updatedRoom = await this.update(roomId, {
        images: imageUrls
      });

      return updatedRoom;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update room images',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Like một phòng
   */
  async likeRoom(createRoomLikeDto: CreateRoomLikeDto): Promise<RoomLike> {
    try {
      // Kiểm tra xem phòng có tồn tại không
      const room = await this.findOne(createRoomLikeDto.room_id);
      if (!room) {
        throw new HttpException(
          'Room not found',
          HttpStatus.NOT_FOUND
        );
      }

      // Kiểm tra xem user đã like phòng này chưa
      const existingLike = await this.checkUserLikedRoom(
        createRoomLikeDto.user_id,
        createRoomLikeDto.room_id
      );

      if (existingLike) {
        throw new HttpException(
          'User already liked this room',
          HttpStatus.BAD_REQUEST
        );
      }

      // Tạo like mới
      const { data, error } = await this.supabaseService.getClient()
        .from('room_likes')
        .insert([createRoomLikeDto])
        .select()
        .single();

      if (error) {
        throw new HttpException(
          `Failed to like room: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to like room',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Unlike một phòng
   */
  async unlikeRoom(userId: string, roomId: string): Promise<void> {
    try {
      // Kiểm tra xem user đã like phòng này chưa
      const existingLike = await this.checkUserLikedRoom(userId, roomId);

      if (!existingLike) {
        throw new HttpException(
          'User has not liked this room',
          HttpStatus.BAD_REQUEST
        );
      }

      // Xóa like
      const { error } = await this.supabaseService.getClient()
        .from('room_likes')
        .delete()
        .eq('user_id', userId)
        .eq('room_id', roomId);

      if (error) {
        throw new HttpException(
          `Failed to unlike room: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to unlike room',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Kiểm tra user đã like phòng chưa
   */
  async checkUserLikedRoom(userId: string, roomId: string): Promise<RoomLike | null> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('room_likes')
        .select('*')
        .eq('user_id', userId)
        .eq('room_id', roomId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Không tìm thấy like
        }
        throw new HttpException(
          `Failed to check user like: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to check user like',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Lấy danh sách phòng đã like của user
   */
  async getUserLikedRooms(userId: string): Promise<Room[]> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('room_likes')
        .select(`
          room_id,
          rooms (
            *,
            room_types (
              id,
              name,
              description,
              icon
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new HttpException(
          `Failed to get user liked rooms: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      // Extract rooms từ join result
      const rooms = data
        .map(item => item.rooms)
        .filter(room => room !== null) as unknown as Room[];
      return rooms;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to get user liked rooms',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Lấy số lượng like của một phòng
   */
  async getRoomLikeCount(roomId: string): Promise<number> {
    try {
      const { count, error } = await this.supabaseService.getClient()
        .from('room_likes')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', roomId);

      if (error) {
        throw new HttpException(
          `Failed to get room like count: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return count || 0;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to get room like count',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * Lấy thông tin phòng với like count và user like status
   */
  async getRoomWithLikeInfo(roomId: string, userId?: string): Promise<any> {
    try {
      // Lấy thông tin phòng
      const room = await this.findOne(roomId);
      
      // Lấy số lượng like
      const likeCount = await this.getRoomLikeCount(roomId);
      
      // Kiểm tra user đã like chưa (nếu có userId)
      let userLiked = false;
      if (userId) {
        const userLike = await this.checkUserLikedRoom(userId, roomId);
        userLiked = !!userLike;
      }

      return {
        ...room,
        like_count: likeCount,
        user_liked: userLiked
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to get room with like info',
        HttpStatus.BAD_REQUEST
      );
    }
  }


 async findAllAmenities(): Promise<Amenity[]> {
  try {
    const { data, error } = await this.supabaseService.getClient()
      .from('amenities')
      .select('*');

    if (error) {
      throw new HttpException(
        `Failed to fetch amenities: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
    return data || [];
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }
    throw new HttpException(
      'Failed to fetch amenities',
      HttpStatus.BAD_REQUEST
    );
  }
}

async findOneAmenity(id: string): Promise<Amenity> {
  try {
    const { data, error } = await this.supabaseService.getClient()
      .from('amenities')
      .select('*')
      .eq('id', id)
      .single();

      if (error) {
        throw new HttpException(
          `Failed to fetch amenity: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }
      return data;
  }catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }
    throw new HttpException(
      'Failed to fetch amenity',
      HttpStatus.BAD_REQUEST
    );
  }
}
 

  
}
