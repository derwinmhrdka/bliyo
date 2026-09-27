import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthUser } from '../auth/auth.types';
import { CreateUserDto } from './dto/create-user.dto';
import { SetActiveDto } from './dto/set-active.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly users: UserService) {}

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return user;
  }

  @Get()
  @Roles(Role.admin, Role.superadmin)
  list(@Query('q') query?: string) {
    return this.users.list(query);
  }

  @Post()
  @Roles(Role.admin, Role.superadmin)
  create(@CurrentUser() actor: AuthUser, @Body() body: CreateUserDto) {
    return this.users.create(actor, body);
  }

  @Patch(':id')
  @Roles(Role.admin, Role.superadmin)
  update(@CurrentUser() actor: AuthUser, @Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateUserDto) {
    return this.users.update(actor, id, body);
  }

  @Patch(':id/active')
  @Roles(Role.admin, Role.superadmin)
  setActive(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: SetActiveDto,
  ) {
    return this.users.setActive(actor, id, body.isActive);
  }

  @Delete(':id')
  @Roles(Role.admin, Role.superadmin)
  remove(@CurrentUser() actor: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.users.remove(actor, id);
  }
}
