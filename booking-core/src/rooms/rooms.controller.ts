import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room-with-images.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { CreateRoomLikeDto } from './dto/create-room-like.dto';
import { SearchRoomsDto } from './dto/search-rooms.dto';
import { GeocodeDto } from './dto/geocode.dto';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 10, {
    fileFilter: (req, file, cb) => {
      // Chỉ cho phép upload hình ảnh
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    }
  }))
  async create(
    @Body() createRoomDto: CreateRoomDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    try {
      // Bắt buộc phải có hình ảnh
      if (!files || files.length === 0) {
        throw new HttpException(
          'Images are required when creating a room',
          HttpStatus.BAD_REQUEST
        );
      }
      
      return await this.roomsService.create(createRoomDto, files);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to create room',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('geocode')
  async getCoordinatesFromAddress(@Body() body: GeocodeDto) {
    try {
      return await this.roomsService.getCoordinatesFromAddress(body.address);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to geocode address',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.roomsService.findAll();
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

  @Get('search')
  async searchRooms(@Query() searchParams: SearchRoomsDto) {
    try {
      return await this.roomsService.searchRooms(searchParams);
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

  @Get('host/:hostId')
  async findByHost(@Param('hostId') hostId: string) {
    try {
      return await this.roomsService.findByHost(hostId);
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

  @Get('host/:hostId/stats')
  async getHostStats(@Param('hostId') hostId: string) {
    try {
      return await this.roomsService.getHostStats(hostId);
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

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('userId') userId?: string
  ) {
    try {
      // Nếu có userId, trả về thông tin với like status
      if (userId) {
        return await this.roomsService.getRoomWithLikeInfo(id, userId);
      }
      // Nếu không có userId, trả về thông tin cơ bản
      return await this.roomsService.findOne(id);
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

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images', 10, {
    fileFilter: (req, file, cb) => {
      // Chỉ cho phép upload hình ảnh
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    }
  }))
  async update(
    @Param('id') id: string, 
    @Body() updateRoomDto: UpdateRoomDto,
    @UploadedFiles() files?: Express.Multer.File[]
  ) {
    try {
      // Cập nhật thông tin trước
      const updatedRoom = await this.roomsService.update(id, updateRoomDto);
      
      // Nếu có hình ảnh mới, thay thế hình ảnh cũ
      if (files && files.length > 0) {
        const hostId = updateRoomDto.host_id;
        if (!hostId) {
          throw new HttpException(
            'host_id is required when updating images',
            HttpStatus.BAD_REQUEST
          );
        }
        
        // Thay thế hình ảnh cũ bằng hình ảnh mới
        return await this.roomsService.updateRoomImages(id, hostId, files);
      }
      
      // Nếu không có hình ảnh mới, trả về room đã cập nhật thông tin
      return updatedRoom;
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

  @Delete()
  async remove(
    @Query('id') id: string,
    @Query('host_id') hostId?: string
  ) {
    try {
      return await this.roomsService.remove(id, hostId);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete room',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('like')
  async likeRoom(@Body() createRoomLikeDto: CreateRoomLikeDto) {
    try {
      return await this.roomsService.likeRoom(createRoomLikeDto);
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

  @Delete('like/:roomId/:userId')
  async unlikeRoom(
    @Param('roomId') roomId: string,
    @Param('userId') userId: string
  ) {
    try {
      await this.roomsService.unlikeRoom(userId, roomId);
      return { message: 'Room unliked successfully' };
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

  @Get('liked/:userId')
  async getUserLikedRooms(@Param('userId') userId: string) {
    try {
      return await this.roomsService.getUserLikedRooms(userId);
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

  @Get('like/count/:roomId')
  async getRoomLikeCount(@Param('roomId') roomId: string) {
    try {
      const count = await this.roomsService.getRoomLikeCount(roomId);
      return { room_id: roomId, like_count: count };
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
}
