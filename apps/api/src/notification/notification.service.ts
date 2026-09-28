import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const UNREAD_LIMIT = 5;
const READ_LIMIT = 5;

const itemSelect = {
  id: true,
  title: true,
  body: true,
  createdAt: true,
} as const;

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  add(userId: string, title: string, body: string) {
    return this.prisma.notification.create({
      data: { userId, title, body },
      select: { id: true },
    });
  }

  async list(userId: string) {
    const [unread, read] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId, readAt: null },
        orderBy: { createdAt: 'desc' },
        take: UNREAD_LIMIT,
        select: itemSelect,
      }),
      this.prisma.notification.findMany({
        where: { userId, readAt: { not: null } },
        orderBy: { createdAt: 'desc' },
        take: READ_LIMIT,
        select: itemSelect,
      }),
    ]);
    return { unread, read };
  }

  markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }
}
