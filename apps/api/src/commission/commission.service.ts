import { Injectable } from '@nestjs/common';
import { CommissionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommissionService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    const start = startOfMonthJakarta();
    const [totalUsers, totalActiveLinks, rows] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.affiliateLink.count({ where: { isActive: true } }),
      this.prisma.commission.findMany({
        where: { createdAt: { gte: start } },
        select: {
          amount: true,
          status: true,
          transaction: { select: { merchant: { select: { name: true } } } },
        },
      }),
    ]);

    const buckets = new Map<string, number>();
    let commissionThisMonth = 0;
    let selesai = 0;
    let menunggu = 0;

    for (const row of rows) {
      const amount = Number(row.amount);
      commissionThisMonth += amount;
      const merchantName = row.transaction.merchant?.name || 'Lainnya';
      buckets.set(merchantName, (buckets.get(merchantName) || 0) + amount);
      if (row.status === CommissionStatus.paid) {
        selesai += amount;
      } else {
        menunggu += amount;
      }
    }

    return {
      totalUsers,
      totalActiveLinks,
      commissionThisMonth,
      commissionByMerchant: topSlices(buckets),
      payoutStatus: [
        { label: 'Selesai', value: selesai },
        { label: 'Menunggu', value: menunggu },
      ],
    };
  }

  async getMine(userId: string) {
    const start = startOfMonthJakarta();
    const [linkCount, rows] = await Promise.all([
      this.prisma.affiliateLink.count({ where: { userId } }),
      this.prisma.commission.findMany({
        where: { userId, createdAt: { gte: start } },
        select: {
          amount: true,
          status: true,
          transaction: { select: { merchant: { select: { name: true } } } },
        },
      }),
    ]);

    const buckets = new Map<string, number>();
    let commissionThisMonth = 0;
    let selesai = 0;
    let menunggu = 0;

    for (const row of rows) {
      const amount = Number(row.amount);
      commissionThisMonth += amount;
      const merchantName = row.transaction.merchant?.name || 'Lainnya';
      buckets.set(merchantName, (buckets.get(merchantName) || 0) + amount);
      if (row.status === CommissionStatus.paid) {
        selesai += amount;
      } else {
        menunggu += amount;
      }
    }

    return {
      linkCount,
      commissionThisMonth,
      commissionByMerchant: topSlices(buckets),
      payoutStatus: [
        { label: 'Selesai', value: selesai },
        { label: 'Menunggu', value: menunggu },
      ],
    };
  }
}

function topSlices(buckets: Map<string, number>) {
  const sorted = [...buckets.entries()].sort((a, b) => b[1] - a[1]);
  if (sorted.length <= 3) {
    return sorted.map(([label, value]) => ({ label, value }));
  }
  const rest = sorted.slice(2).reduce((sum, [, value]) => sum + value, 0);
  return [
    { label: sorted[0][0], value: sorted[0][1] },
    { label: sorted[1][0], value: sorted[1][1] },
    { label: 'Lainnya', value: rest },
  ];
}

function startOfMonthJakarta() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
  }).format(new Date());
  const [year, month] = parts.split('-');
  return new Date(`${year}-${month}-01T00:00:00+07:00`);
}
