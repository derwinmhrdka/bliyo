import { Body, Controller, Get, NotFoundException, Param, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { AuthUser } from '../auth/auth.types';
import { AffiliateLinkService } from './affiliate-link.service';
import { CreateAffiliateLinkDto } from './dto/create-affiliate-link.dto';

@Controller('affiliate-links')
export class AffiliateLinkController {
  constructor(private readonly affiliateLinks: AffiliateLinkService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateAffiliateLinkDto) {
    return this.affiliateLinks.create(user.id, dto.originalUrl);
  }

  @Get('mine')
  mine(@CurrentUser() user: AuthUser) {
    return this.affiliateLinks.listMine(user.id);
  }

  @Public()
  @Get('preview')
  preview(@Query('url') url = '') {
    return this.affiliateLinks.preview(url);
  }

  @Public()
  @Get('code/:code')
  async resolve(@Param('code') code: string) {
    const link = await this.affiliateLinks.findActiveByCode(code);
    if (!link) {
      throw new NotFoundException('Link tidak ditemukan.');
    }
    return link;
  }
}
