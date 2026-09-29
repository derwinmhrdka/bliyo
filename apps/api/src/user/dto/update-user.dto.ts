import { Role } from '@prisma/client';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  lastName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9_]{3,20}$/)
  username?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(160)
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^$|^\+[0-9]{8,15}$/)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  provinceId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  provinceName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  regencyId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  regencyName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  districtId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  districtName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  referralCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180000)
  avatarData?: string;

  @IsOptional()
  @IsBoolean()
  notifyEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(72)
  password?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
