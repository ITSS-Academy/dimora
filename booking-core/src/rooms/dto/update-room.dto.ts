import { PartialType } from '@nestjs/mapped-types';
import { CreateRoomDto } from './create-room-with-images.dto';

export class UpdateRoomDto extends PartialType(CreateRoomDto) {}
