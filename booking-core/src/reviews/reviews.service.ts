import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';
import { SupabaseService } from '../common/services/supabase.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createReviewDto: CreateReviewDto, userId: string): Promise<Review> {
    try {
      const reviewData = {
        ...createReviewDto,
        user_id: userId,
      };

      const { data, error } = await this.supabaseService.getClient()
        .from('reviews')
        .insert([reviewData])
        .select()
        .single();

      if (error) {
        throw new HttpException(
          `Failed to create review: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      // Cập nhật rating trung bình của phòng
      await this.updateRoomRating(createReviewDto.room_id);

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while creating review',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAll(): Promise<Review[]> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new HttpException(
          `Failed to fetch reviews: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while fetching reviews',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOne(id: string): Promise<Review> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('reviews')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new HttpException(
            'Review not found',
            HttpStatus.NOT_FOUND
          );
        }
        throw new HttpException(
          `Failed to fetch review: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while fetching review',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByRoom(roomId: string): Promise<Review[]> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('reviews')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new HttpException(
          `Failed to fetch reviews by room: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while fetching reviews by room',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findByUser(userId: string): Promise<Review[]> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('reviews')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new HttpException(
          `Failed to fetch reviews by user: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while fetching reviews by user',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async update(id: string, updateReviewDto: UpdateReviewDto): Promise<Review> {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .from('reviews')
        .update(updateReviewDto)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new HttpException(
            'Review not found',
            HttpStatus.NOT_FOUND
          );
        }
        throw new HttpException(
          `Failed to update review: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      // Cập nhật rating trung bình của phòng nếu rating thay đổi
      if (updateReviewDto.rating) {
        await this.updateRoomRating(data.room_id);
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while updating review',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const { error } = await this.supabaseService.getClient()
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) {
        throw new HttpException(
          `Failed to delete review: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while deleting review',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getRoomRatingStats(roomId: string) {
    try {
      const { data, error } = await this.supabaseService.getClient()
        .rpc('get_room_rating_stats', {
          room_uuid: roomId
        });

      if (error) {
        throw new HttpException(
          `Failed to get room rating stats: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return data[0];
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while getting room rating stats',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async updateRoomRating(roomId: string): Promise<void> {
    try {
      const { error } = await this.supabaseService.getClient()
        .rpc('update_room_rating', {
          room_uuid: roomId
        });

      if (error) {
        throw new HttpException(
          `Failed to update room rating: ${error.message}`,
          HttpStatus.BAD_REQUEST
        );
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while updating room rating',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
