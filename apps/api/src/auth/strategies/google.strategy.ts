import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { AuthUser } from '../auth.types';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    config: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID') || 'unset',
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET') || 'unset',
      callbackURL:
        config.get<string>('GOOGLE_CALLBACK_URL') ||
        'http://localhost:13003/api/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile): Promise<AuthUser> {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new UnauthorizedException('Akun Google tidak memiliki email.');
    }
    return this.authService.loginWithGoogle({
      email,
      googleId: profile.id,
      name: profile.displayName || email,
    });
  }
}
