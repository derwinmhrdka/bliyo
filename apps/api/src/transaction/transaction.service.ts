import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CommissionStatus, Prisma, TransactionStatus } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

const transactionSelect = {
  id: true,
  amount: true,
  status: true,
  occurredAt: true,
  user: { select: { name: true, firstName: true } },
  merchant: { select: { name: true } },
  affiliateLink: { select: { shortCode: true } },
  commissions: { select: { amount: true } },
} satisfies Prisma.TransactionSelect;

function present(row: Prisma.TransactionGetPayload<{ select: typeof transactionSelect }>) {
  const commission = row.commissions.reduce((sum, item) => sum + Number(item.amount), 0);
  return {
    id: row.id,
    amount: Number(row.amount),
    commission,
    status: row.status,
    occurredAt: row.occurredAt,
    memberName: row.user.firstName || row.user.name,
    merchantName: row.merchant?.name ?? null,
    shortCode: row.affiliateLink?.shortCode ?? null,
  };
}

function rupiah(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}

@Injectable()
export class TransactionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
  ) {}

  async listAll() {
    const rows = await this.prisma.transaction.findMany({
      orderBy: { occurredAt: 'desc' },
      take: 100,
      select: transactionSelect,
    });
    return rows.map(present);
  }

  async listMine(userId: string) {
    const rows = await this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { occurredAt: 'desc' },
      take: 100,
      select: transactionSelect,
    });
    return rows.map(present);
  }

  async create(input: CreateTransactionDto) {
    if (input.commissionAmount > input.amount) {
      throw new BadRequestException('Komisi tidak boleh lebih besar dari nominal transaksi.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: input.userId },
      select: { id: true, isActive: true },
    });
    if (!user || !user.isActive) {
      throw new NotFoundException('Member tidak ditemukan.');
    }

    let merchantId: string | null = null;
    if (input.affiliateLinkId) {
      const link = await this.prisma.affiliateLink.findUnique({
        where: { id: input.affiliateLinkId },
        select: { userId: true, merchantId: true },
      });
      if (!link || link.userId !== input.userId) {
        throw new BadRequestException('Link ini bukan milik member tersebut.');
      }
      merchantId = link.merchantId;
    }

    const status = input.status ?? TransactionStatus.pending;
    const commissionStatus = status === TransactionStatus.confirmed ? CommissionStatus.approved : CommissionStatus.pending;

    const created = await this.prisma.transaction.create({
      data: {
        userId: input.userId,
        affiliateLinkId: input.affiliateLinkId,
        merchantId,
        amount: new Prisma.Decimal(input.amount),
        status,
        commissions:
          input.commissionAmount > 0 && status !== TransactionStatus.cancelled
            ? {
                create: {
                  userId: input.userId,
                  amount: new Prisma.Decimal(input.commissionAmount),
                  status: commissionStatus,
                },
              }
            : undefined,
      },
      select: transactionSelect,
    });

    const recorded = input.commissionAmount > 0 && status !== TransactionStatus.cancelled;
    const body = recorded
      ? `Transaksi ${rupiah(input.amount)} tercatat. Komisi ${rupiah(input.commissionAmount)}.`
      : `Transaksi ${rupiah(input.amount)} tercatat.`;
    await this.notifications.add(input.userId, 'Transaksi tercatat', body);
    return present(created);
  }
}
