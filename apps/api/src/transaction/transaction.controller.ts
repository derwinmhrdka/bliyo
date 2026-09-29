import { Body, Controller, Get, Post } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthUser } from '../auth/auth.types';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionService } from './transaction.service';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactions: TransactionService) {}

  @Get()
  @Roles(Role.admin, Role.superadmin)
  listAll() {
    return this.transactions.listAll();
  }

  @Post()
  @Roles(Role.admin, Role.superadmin)
  create(@Body() body: CreateTransactionDto) {
    return this.transactions.create(body);
  }

  @Get('mine')
  mine(@CurrentUser() user: AuthUser) {
    return this.transactions.listMine(user.id);
  }
}
