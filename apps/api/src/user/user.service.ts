import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AuthUser } from '../auth/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const userSelect = {
  id: true,
  email: true,
  name: true,
  firstName: true,
  lastName: true,
  username: true,
  phone: true,
  address: true,
  avatarData: true,
  referralCode: true,
  role: true,
  isActive: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  list(query?: string) {
    const term = query?.trim();
    return this.prisma.user.findMany({
      where: term
        ? {
            OR: [
              { name: { contains: term, mode: 'insensitive' } },
              { firstName: { contains: term, mode: 'insensitive' } },
              { lastName: { contains: term, mode: 'insensitive' } },
              { username: { contains: term, mode: 'insensitive' } },
              { email: { contains: term, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: userSelect,
    });
  }

  async create(actor: AuthUser, input: CreateUserDto) {
    const firstName = input.firstName.trim();
    const lastName = input.lastName?.trim() || '';
    const username = input.username.trim().toLowerCase();
    const email = input.email.trim().toLowerCase();
    const phone = input.phone?.replace(/[\s-]/g, '') || '';
    const role = input.role ?? Role.member;

    if (role === Role.superadmin || (role === Role.admin && actor.role !== Role.superadmin)) {
      throw new ForbiddenException('Peran ini tidak bisa dibuat dari sini.');
    }
    if (!this.passwordAccepted(input.password)) {
      throw new BadRequestException('Password tidak memenuhi aturan.');
    }

    try {
      return await this.prisma.user.create({
        data: {
          email,
          name: [firstName, lastName].filter(Boolean).join(' '),
          firstName,
          lastName: lastName || null,
          username,
          phone: phone || null,
          address: input.address?.trim() || null,
          referralCode: input.referralCode?.trim() || null,
          avatarData: this.cleanAvatar(input.avatarData),
          passwordHash: await bcrypt.hash(input.password, 10),
          role,
        },
        select: userSelect,
      });
    } catch (error) {
      this.rethrowUnique(error);
    }
  }

  async update(actor: AuthUser, id: string, input: UpdateUserDto) {
    const current = await this.findOrThrow(id);
    this.assertCanEdit(actor, current);
    if (input.role && input.role !== current.role) {
      if (actor.id === current.id) {
        throw new ForbiddenException('Peran akun sendiri tidak bisa diubah dari sini.');
      }
      if (input.role === Role.superadmin || current.role === Role.superadmin) {
        throw new ForbiddenException('Peran superadmin tidak bisa diubah dari sini.');
      }
      if (actor.role !== Role.superadmin) {
        throw new ForbiddenException('Hanya superadmin yang bisa mengubah peran.');
      }
    }

    const firstName = input.firstName?.trim() || current.firstName || current.name;
    const lastName = input.lastName !== undefined ? input.lastName.trim() : current.lastName || '';
    const username = input.username?.trim().toLowerCase();
    const email = input.email?.trim().toLowerCase();
    const phone = input.phone?.replace(/[\s-]/g, '');
    const password = input.password?.trim();
    if (password && !this.passwordAccepted(password)) {
      throw new BadRequestException('Password tidak memenuhi aturan.');
    }
    if (typeof input.isActive === 'boolean' && input.isActive !== current.isActive) {
      if (actor.id === current.id) {
        throw new ForbiddenException('Akun sendiri tidak bisa dinonaktifkan dari sini.');
      }
      if (current.role === Role.superadmin) {
        throw new ForbiddenException('Superadmin tidak bisa dinonaktifkan dari sini.');
      }
      if (actor.role !== Role.superadmin && current.role === Role.admin) {
        throw new ForbiddenException('Hanya superadmin yang bisa menonaktifkan admin.');
      }
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          firstName,
          lastName: lastName || null,
          name: [firstName, lastName].filter(Boolean).join(' '),
          username,
          email,
          phone: phone === undefined ? undefined : phone || null,
          address: input.address !== undefined ? input.address.trim() || null : undefined,
          referralCode: input.referralCode !== undefined ? input.referralCode.trim() || null : undefined,
          avatarData: input.avatarData !== undefined ? this.cleanAvatar(input.avatarData) : undefined,
          isActive: input.isActive,
          role: input.role,
          passwordHash: password ? await bcrypt.hash(password, 10) : undefined,
        },
        select: userSelect,
      });
    } catch (error) {
      this.rethrowUnique(error);
    }
  }

  async setActive(actor: AuthUser, id: string, isActive: boolean) {
    const current = await this.findOrThrow(id);
    if (actor.id === current.id) {
      throw new ForbiddenException('Akun sendiri tidak bisa dinonaktifkan dari sini.');
    }
    if (current.role === Role.superadmin) {
      throw new ForbiddenException('Superadmin tidak bisa dinonaktifkan dari sini.');
    }
    if (actor.role !== Role.superadmin && current.role === Role.admin) {
      throw new ForbiddenException('Hanya superadmin yang bisa menonaktifkan admin.');
    }
    return this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: userSelect,
    });
  }

  async remove(actor: AuthUser, id: string) {
    const current = await this.findOrThrow(id);
    if (actor.id === current.id) {
      throw new ForbiddenException('Akun sendiri tidak bisa dihapus.');
    }
    if (current.role === Role.superadmin) {
      throw new ForbiddenException('Superadmin tidak bisa dihapus dari sini.');
    }
    if (actor.role !== Role.superadmin && current.role === Role.admin) {
      throw new ForbiddenException('Hanya superadmin yang bisa menghapus admin.');
    }

    await this.prisma.$transaction(async (tx) => {
      const links = await tx.affiliateLink.findMany({ where: { userId: id }, select: { id: true } });
      const linkIds = links.map((link) => link.id);
      if (linkIds.length) {
        await tx.transaction.updateMany({
          where: { affiliateLinkId: { in: linkIds } },
          data: { affiliateLinkId: null },
        });
      }
      await tx.commission.deleteMany({ where: { userId: id } });
      await tx.transaction.deleteMany({ where: { userId: id } });
      await tx.affiliateLink.deleteMany({ where: { userId: id } });
      await tx.user.delete({ where: { id } });
    });
    return { ok: true };
  }

  private async findOrThrow(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, firstName: true, lastName: true, name: true, isActive: true },
    });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan.');
    }
    return user;
  }

  private assertCanEdit(actor: AuthUser, target: { id: string; role: Role }) {
    if (target.role === Role.superadmin && actor.id !== target.id) {
      throw new ForbiddenException('Superadmin tidak bisa diubah dari sini.');
    }
    if (actor.role !== Role.superadmin && target.role === Role.admin && actor.id !== target.id) {
      throw new ForbiddenException('Hanya superadmin yang bisa mengubah admin.');
    }
  }

  private cleanAvatar(value?: string) {
    if (!value) return null;
    const match = value.match(/^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/);
    if (!match || match[1].length > 160000) return null;
    return value;
  }

  private passwordAccepted(password: string) {
    return password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password);
  }

  private rethrowUnique(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = String(error.meta?.target ?? '');
      if (target.includes('email')) throw new ConflictException('Email sudah dipakai.');
      throw new ConflictException('Username sudah dipakai.');
    }
    throw error;
  }
}
