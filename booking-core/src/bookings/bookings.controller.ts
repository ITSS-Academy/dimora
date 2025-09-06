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
  Request,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async create(@Body() createBookingDto: CreateBookingDto) {
    try {
      
      // Validate DTO
      // Use user_id from DTO if provided, otherwise use default
      const userId = createBookingDto.user_id || '';
      console.log('👤 [BOOKING CONTROLLER] Using user ID:', userId);
      
      return await this.bookingsService.create(createBookingDto, userId);
    } catch (error) {
      console.log('💥 [BOOKING CONTROLLER] Exception caught:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error while creating booking',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.bookingsService.findAll();
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

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    try {
      return await this.bookingsService.findByUser(userId);
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

  @Get('host/:hostId')
  async findByHost(@Param('hostId') hostId: string) {
    try {
      return await this.bookingsService.getHostBookings(hostId);
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

  @Post(':id/cancel')
  async cancelBooking(@Param('id') id: string, @Request() req) {
    try {
      // TODO: Lấy userId từ JWT token
      const userId = req.user?.id || 'temp-user-id';
      return await this.bookingsService.cancelBooking(id, userId);
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

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.bookingsService.findOne(id);
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

  @Get('host/:hostId/room/:roomId')
  async getRoomBookings(
    @Param('hostId') hostId: string,
    @Param('roomId') roomId: string
  ) {
    try {
      return await this.bookingsService.getRoomBookings(roomId, hostId);
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

  @Get('host/:hostId/date-range')
  async getHostBookingsByDateRange(
    @Param('hostId') hostId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    try {
      if (!startDate || !endDate) {
        throw new HttpException(
          'startDate and endDate are required',
          HttpStatus.BAD_REQUEST
        );
      }
      return await this.bookingsService.getHostBookingsByDateRange(hostId, startDate, endDate);
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

  @Get('host/:hostId/stats')
  async getHostBookingStats(@Param('hostId') hostId: string) {
    try {
      return await this.bookingsService.getHostBookingStats(hostId);
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

  @Get('host/:hostId/room/:roomId/availability')
  async getRoomAvailability(
    @Param('hostId') hostId: string,
    @Param('roomId') roomId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    try {
      if (!startDate || !endDate) {
        throw new HttpException(
          'startDate and endDate are required',
          HttpStatus.BAD_REQUEST
        );
      }
      return await this.bookingsService.getRoomAvailability(roomId, hostId, startDate, endDate);
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

  @Get('host/:hostId/availability')
  async getHostRoomsAvailability(
    @Param('hostId') hostId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    try {
      if (!startDate || !endDate) {
        throw new HttpException(
          'startDate and endDate are required',
          HttpStatus.BAD_REQUEST
        );
      }
      return await this.bookingsService.getHostRoomsAvailability(hostId, startDate, endDate);
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

  @Get('room/:roomId/check-availability')
  async checkRoomAvailability(
    @Param('roomId') roomId: string,
    @Query('checkInDate') checkInDate: string,
    @Query('checkOutDate') checkOutDate: string
  ) {
    try {
      if (!checkInDate || !checkOutDate) {
        throw new HttpException(
          'checkInDate and checkOutDate are required',
          HttpStatus.BAD_REQUEST
        );
      }
      const isAvailable = await this.bookingsService.checkRoomAvailability(roomId, checkInDate, checkOutDate);
      return { 
        room_id: roomId, 
        check_in_date: checkInDate, 
        check_out_date: checkOutDate, 
        is_available: isAvailable 
      };
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

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    try {
      return await this.bookingsService.update(id, updateBookingDto);
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

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.bookingsService.remove(id);
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
}
