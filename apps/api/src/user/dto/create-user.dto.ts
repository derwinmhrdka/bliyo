import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  firstName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  lastName?: string;

  @IsString()
  @Matches(/^[a-z0-9_]{3,20}$/)
  username!: string;

  @IsEmail()
  @MaxLength(160)
  email!: string;

  @IsString()
  @Matches(/^\+[0-9]{8,15}$/)
  phone!: string;

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

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
