import { Controller, Get } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { CommissionService } from './commission.service';

@Controller('commissions')
export class CommissionController {
  constructor(private readonly commissions: CommissionService) {}

  @Get('dashboard')
  @Roles(Role.admin, Role.superadmin)
  dashboard() {
    return this.commissions.getDashboard();
  }
}
