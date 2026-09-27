import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { GoogleAuthGuard } from '../common/guards/google-auth.guard';
import { AuthService } from './auth.service';
import { AuthUser } from './auth.types';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Get('username-available')
  usernameAvailable(@Query('username') username = '') {
    return this.authService.usernameAvailable(username);
  }

  @Public()
  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Public()
  @Post('login')
  @UseGuards(AuthGuard('local'))
  login(@CurrentUser() user: AuthUser) {
    return this.authService.issueSession(user);
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  google() {
    return;
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleCallback(@CurrentUser() user: AuthUser, @Res() res: Response) {
    const token = this.authService.issueSession(user).accessToken;
    const web = (this.config.get<string>('WEB_ORIGIN') || 'http://localhost:13003').replace(/\/$/, '');
    res.redirect(`${web}/auth/callback?token=${encodeURIComponent(token)}`);
  }

  @Get('me')
  me(@Req() req: { user: AuthUser }) {
    return req.user;
  }
}
