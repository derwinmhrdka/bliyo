import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const transactionSelect = {
  id: true,
  amount: true,
  status: true,
  externalRef: true,
  occurredAt: true,
  user: { select: { id: true, name: true, email: true } },
  merchant: { select: { id: true, name: true } },
  affiliateLink: { select: { id: true, shortCode: true } },
} satisfies Prisma.TransactionSelect;

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async listAll() {
    const rows = await this.prisma.transaction.findMany({
      orderBy: { occurredAt: 'desc' },
      take: 100,
      select: transactionSelect,
    });
    return rows.map((row) => ({ ...row, amount: Number(row.amount) }));
  }

  async listMine(userId: string) {
    const rows = await this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { occurredAt: 'desc' },
      take: 100,
      select: transactionSelect,
    });
    return rows.map((row) => ({ ...row, amount: Number(row.amount) }));
  }
}
