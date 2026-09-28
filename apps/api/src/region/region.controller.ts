import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { RegionService } from './region.service';

@Public()
@Controller('regions')
export class RegionController {
  constructor(private readonly regions: RegionService) {}

  @Get('provinces')
  provinces() {
    return this.regions.provinces();
  }

  @Get('regencies/:provinceId')
  regencies(@Param('provinceId') provinceId: string) {
    return this.regions.regencies(provinceId);
  }

  @Get('districts/:regencyId')
  districts(@Param('regencyId') regencyId: string) {
    return this.regions.districts(regencyId);
  }
}
