import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async create(@Body() createReviewDto: CreateReviewDto) {
    try {
      // TODO: Lấy userId từ JWT token
      if (!createReviewDto.user_id) {
        throw new HttpException(
          'User ID is required to create a review',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.reviewsService.create(
        createReviewDto,
        createReviewDto.user_id,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while creating review',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.reviewsService.findAll();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while fetching reviews',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('room/:roomId')
  async findByRoom(@Param('roomId') roomId: string) {
    try {
      return await this.reviewsService.findByRoom(roomId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while fetching reviews by room',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    try {
      return await this.reviewsService.findByUser(userId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while fetching reviews by user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('room/:roomId/stats')
  async getRoomRatingStats(@Param('roomId') roomId: string) {
    try {
      return await this.reviewsService.getRoomRatingStats(roomId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while getting room rating stats',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.reviewsService.findOne(id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while fetching review',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    try {
      return await this.reviewsService.update(id, updateReviewDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while updating review',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.reviewsService.remove(id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while deleting review',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
