import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateUserDto {
  /** UUID của user */
  @IsString()
  id: string;

  /** Email đăng nhập (unique) */
  @IsEmail()
  email: string;

  /** Họ tên đầy đủ */
  @IsString()
  full_name: string;

  /** Số điện thoại */
  @IsOptional()
  @IsString()
  phone?: string;

  /** URL ảnh đại diện */
  @IsOptional()
  @IsString()
  avatar_url?: string;

  /** Google ID */
  @IsString()
  google_id: string;
}
