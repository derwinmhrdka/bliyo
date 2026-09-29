import { Controller, Get } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthUser } from '../auth/auth.types';
import { CommissionService } from './commission.service';

@Controller('commissions')
export class CommissionController {
  constructor(private readonly commissions: CommissionService) {}

  @Get('mine')
  mine(@CurrentUser() user: AuthUser) {
    return this.commissions.getMine(user.id);
  }

  @Get('dashboard')
  @Roles(Role.admin, Role.superadmin)
  dashboard() {
    return this.commissions.getDashboard();
  }
}
