import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { UpsertMerchantDto } from './dto/upsert-merchant.dto';
import { MerchantService } from './merchant.service';

@Controller('merchants')
export class MerchantController {
  constructor(private readonly merchants: MerchantService) {}

  @Get()
  @Roles(Role.admin, Role.superadmin)
  list() {
    return this.merchants.list();
  }

  @Post()
  @Roles(Role.admin, Role.superadmin)
  create(@Body() body: UpsertMerchantDto) {
    return this.merchants.create(body);
  }

  @Patch(':id')
  @Roles(Role.admin, Role.superadmin)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpsertMerchantDto) {
    return this.merchants.update(id, body);
  }
}
