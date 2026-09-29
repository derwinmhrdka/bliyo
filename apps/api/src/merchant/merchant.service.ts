import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertMerchantDto } from './dto/upsert-merchant.dto';

const merchantSelect = {
  id: true,
  name: true,
  domain: true,
  commissionRate: true,
  isActive: true,
} satisfies Prisma.MerchantSelect;

function present(row: Prisma.MerchantGetPayload<{ select: typeof merchantSelect }>) {
  return { ...row, commissionRate: Number(row.commissionRate) };
}

function slugify(name: string) {
  const base = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return base || 'toko';
}

function cleanDomain(value?: string) {
  const raw = (value || '').trim().toLowerCase();
  if (!raw) return null;
  const host = raw.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
  if (!/^([a-z0-9-]+\.)+[a-z]{2,}$/.test(host)) {
    throw new BadRequestException('Domain tidak valid.');
  }
  return host;
}

@Injectable()
export class MerchantService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const rows = await this.prisma.merchant.findMany({
      orderBy: { name: 'asc' },
      take: 100,
      select: merchantSelect,
    });
    return rows.map(present);
  }

  async create(input: UpsertMerchantDto) {
    const slug = await this.uniqueSlug(slugify(input.name));
    const row = await this.prisma.merchant.create({
      data: {
        name: input.name.trim(),
        slug,
        domain: cleanDomain(input.domain),
        commissionRate: new Prisma.Decimal(input.commissionRate),
        isActive: input.isActive ?? true,
      },
      select: merchantSelect,
    });
    return present(row);
  }

  async update(id: string, input: UpsertMerchantDto) {
    const current = await this.prisma.merchant.findUnique({ where: { id }, select: { id: true } });
    if (!current) throw new NotFoundException('Merchant tidak ditemukan.');
    const row = await this.prisma.merchant.update({
      where: { id },
      data: {
        name: input.name.trim(),
        domain: cleanDomain(input.domain),
        commissionRate: new Prisma.Decimal(input.commissionRate),
        isActive: input.isActive ?? true,
      },
      select: merchantSelect,
    });
    return present(row);
  }

  private async uniqueSlug(base: string) {
    let slug = base;
    for (let index = 2; index < 20; index += 1) {
      const taken = await this.prisma.merchant.findUnique({ where: { slug }, select: { id: true } });
      if (!taken) return slug;
      slug = `${base}-${index}`;
    }
    return `${base}-${Date.now().toString(36)}`;
  }
}
