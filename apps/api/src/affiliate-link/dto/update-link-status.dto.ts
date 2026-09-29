import { AffiliateLinkStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateLinkStatusDto {
  @IsEnum(AffiliateLinkStatus, { message: 'Status tidak dikenal.' })
  status!: AffiliateLinkStatus;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MaxLength(160)
  note?: string;
}
