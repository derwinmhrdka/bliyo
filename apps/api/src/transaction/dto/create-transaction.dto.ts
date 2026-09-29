import { TransactionStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateTransactionDto {
  @IsUUID()
  userId!: string;

  @IsOptional()
  @IsUUID()
  affiliateLinkId?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  amount!: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  commissionAmount!: number;

  @IsOptional()
  @IsEnum(TransactionStatus, { message: 'Status tidak dikenal.' })
  status?: TransactionStatus;
}
