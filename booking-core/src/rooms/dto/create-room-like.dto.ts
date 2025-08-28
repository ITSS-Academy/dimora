import { IsString, IsNotEmpty } from 'class-validator';

export class CreateRoomLikeDto {
  @IsString()
  @IsNotEmpty()
  room_id: string;

  @IsString()
  @IsNotEmpty()
  user_id: string;
}
