import { Transform } from 'class-transformer';
import { IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateAffiliateLinkDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsUrl(
    { require_protocol: true, protocols: ['http', 'https'] },
    { message: 'Link produk harus diawali http atau https.' },
  )
  @MaxLength(2000)
  originalUrl!: string;
}
