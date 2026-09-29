import { Body, Controller, Get, NotFoundException, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthUser } from '../auth/auth.types';
import { AffiliateLinkService } from './affiliate-link.service';
import { CreateAffiliateLinkDto } from './dto/create-affiliate-link.dto';
import { UpdateLinkStatusDto } from './dto/update-link-status.dto';

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

  @Get()
  @Roles(Role.admin, Role.superadmin)
  review() {
    return this.affiliateLinks.listForReview();
  }

  @Patch(':id/status')
  @Roles(Role.admin, Role.superadmin)
  setStatus(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateLinkStatusDto) {
    return this.affiliateLinks.setStatus(id, body.status, body.note);
  }

  @Post(':id/withdraw')
  withdraw(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.affiliateLinks.withdraw(user.id, id);
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
