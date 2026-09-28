import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { placeColumns } from '../common/place';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { AuthUser } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async validateLocal(email: string, password: string): Promise<AuthUser> {
    const normalized = email?.trim().toLowerCase();
    if (!normalized || !password) {
      throw new UnauthorizedException('Email atau kata sandi salah.');
    }

    const user = await this.prisma.user.findUnique({ where: { email: normalized } });
    if (!user?.passwordHash) {
      throw new UnauthorizedException(
        user ? 'Akun ini masuk lewat Google.' : 'Email atau kata sandi salah.',
      );
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedException('Email atau kata sandi salah.');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Akun ini dinonaktifkan.');
    }

    return this.toAuthUser(user);
  }

  async loginWithGoogle(input: { email: string; googleId: string; name: string }): Promise<AuthUser> {
    const email = input.email.trim().toLowerCase();
    const byGoogle = await this.prisma.user.findUnique({ where: { googleId: input.googleId } });
    if (byGoogle) {
      if (!byGoogle.isActive) {
        throw new UnauthorizedException('Akun ini dinonaktifkan.');
      }
      return this.toAuthUser(byGoogle);
    }

    const byEmail = await this.prisma.user.findUnique({ where: { email } });
    if (byEmail) {
      if (!byEmail.isActive) {
        throw new UnauthorizedException('Akun ini dinonaktifkan.');
      }
      if (byEmail.googleId && byEmail.googleId !== input.googleId) {
        throw new UnauthorizedException('Email ini terhubung ke akun Google lain.');
      }
      const updated = await this.prisma.user.update({
        where: { id: byEmail.id },
        data: { googleId: input.googleId },
      });
      return this.toAuthUser(updated);
    }

    const created = await this.prisma.user.create({
      data: {
        email,
        name: input.name.trim() || email,
        googleId: input.googleId,
        role: Role.member,
      },
    });
    return this.toAuthUser(created);
  }

  async usernameAvailable(username: string) {
    const normalized = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(normalized)) {
      return { available: false };
    }
    const existing = await this.prisma.user.findUnique({ where: { username: normalized } });
    return { available: !existing };
  }

  async register(input: RegisterDto) {
    const firstName = input.firstName.trim();
    const lastName = input.lastName?.trim() || '';
    const username = input.username.trim().toLowerCase();
    const email = input.email.trim().toLowerCase();
    const phone = input.phone.replace(/[\s-]/g, '');
    const referralCode = input.referralCode?.trim() || '';

    if (!firstName) {
      throw new BadRequestException('First name is required.');
    }
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      throw new BadRequestException('Username must be 3 to 20 letters, numbers, or underscores.');
    }
    if (!this.passwordAccepted(input.password)) {
      throw new BadRequestException('Password does not meet the rules.');
    }
    if (input.password !== input.confirmPassword) {
      throw new BadRequestException('Confirmation password does not match.');
    }
    if (!/^\+[0-9]{8,15}$/.test(phone)) {
      throw new BadRequestException('Phone number is not valid.');
    }

    const avatarData = this.cleanAvatar(input.avatarData);
    const [byUsername, byEmail] = await Promise.all([
      this.prisma.user.findUnique({ where: { username } }),
      this.prisma.user.findUnique({ where: { email } }),
    ]);
    if (byUsername) {
      throw new ConflictException('Username is already used.');
    }
    if (byEmail) {
      throw new ConflictException('Email is already used.');
    }

    const name = [firstName, lastName].filter(Boolean).join(' ');
    try {
      const created = await this.prisma.user.create({
        data: {
          email,
          name,
          firstName,
          lastName: lastName || null,
          username,
          phone,
          ...placeColumns(input),
          referralCode: referralCode || null,
          avatarData,
          passwordHash: await bcrypt.hash(input.password, 10),
          role: Role.member,
        },
      });
      return this.issueSession(this.toAuthUser(created));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const target = String(error.meta?.target ?? '');
        if (target.includes('email')) {
          throw new ConflictException('Email is already used.');
        }
        throw new ConflictException('Username is already used.');
      }
      throw error;
    }
  }

  issueSession(user: AuthUser) {
    const accessToken = this.jwt.sign({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    return { accessToken, user };
  }

  private passwordAccepted(password: string) {
    return password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password);
  }

  private cleanAvatar(value?: string) {
    if (!value) return null;
    const match = value.match(/^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/);
    if (!match || match[1].length > 160000) return null;
    return value;
  }

  private toAuthUser(user: { id: string; email: string; name: string; role: Role }): AuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
