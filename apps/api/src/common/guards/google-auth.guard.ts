import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor(private readonly config: ConfigService) {
    super();
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const web = (this.config.get<string>('WEB_ORIGIN') || 'http://localhost:13003').replace(/\/$/, '');
    const request = context.switchToHttp().getRequest<Request>();
    const isCallback = request.path.includes('callback');
    return {
      session: false,
      failureRedirect: isCallback ? `${web}/login?error=google` : undefined,
    };
  }

  canActivate(context: ExecutionContext) {
    const response = context.switchToHttp().getResponse<Response>();
    const web = (this.config.get<string>('WEB_ORIGIN') || 'http://localhost:13003').replace(/\/$/, '');
    if (!this.config.get('GOOGLE_CLIENT_ID') || !this.config.get('GOOGLE_CLIENT_SECRET')) {
      response.redirect(`${web}/login?error=google`);
      return false;
    }
    return super.canActivate(context);
  }
}
