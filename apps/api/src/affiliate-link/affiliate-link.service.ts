import { randomBytes } from 'crypto';
import { lookup } from 'dns/promises';
import { isIP } from 'net';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AffiliateLinkStatus, Prisma } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../prisma/prisma.service';

const STATUS_EVENT: Record<AffiliateLinkStatus, string> = {
  processing: 'Sedang diproses',
  note: 'Catatan',
  done: 'Selesai',
  rejected: 'Ditolak',
};

const STATUS_NOTICE: Record<AffiliateLinkStatus, { title: string; body: string }> = {
  processing: { title: 'Link diproses', body: 'Status linkmu menjadi sedang diproses.' },
  note: { title: 'Catatan link', body: '' },
  done: { title: 'Link selesai', body: 'Status linkmu menjadi selesai.' },
  rejected: { title: 'Link ditolak', body: 'Status linkmu menjadi ditolak.' },
};

const reviewSelect = {
  id: true,
  originalUrl: true,
  shortCode: true,
  status: true,
  createdAt: true,
  user: { select: { id: true, name: true, firstName: true } },
  merchant: { select: { name: true } },
  events: {
    orderBy: { createdAt: 'asc' as const },
    select: { id: true, title: true, createdAt: true },
  },
} satisfies Prisma.AffiliateLinkSelect;

function presentReview(link: Prisma.AffiliateLinkGetPayload<{ select: typeof reviewSelect }>) {
  const noteEvent = [...link.events].reverse().find((event) => event.title !== 'Link didaftarkan' && event.title !== 'Withdraw diajukan' && !Object.values(STATUS_EVENT).includes(event.title));
  return {
    id: link.id,
    originalUrl: link.originalUrl,
    shortCode: link.shortCode,
    status: link.status,
    createdAt: link.createdAt,
    userId: link.user.id,
    memberName: link.user.firstName || link.user.name,
    merchantName: link.merchant?.name ?? null,
    note: link.status === AffiliateLinkStatus.note ? noteEvent?.title || '' : '',
    events: link.events,
  };
}

@Injectable()
export class AffiliateLinkService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
  ) {}

  async create(userId: string, originalUrl: string) {
    const host = new URL(originalUrl).hostname.toLowerCase().replace(/^www\./, '');
    const merchants = await this.prisma.merchant.findMany({
      where: { isActive: true, domain: { not: null } },
      select: { id: true, domain: true },
    });
    const merchant = merchants.find((item) => {
      const domain = item.domain?.toLowerCase();
      if (!domain) return false;
      return host === domain || host.endsWith(`.${domain}`);
    });

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const link = await this.prisma.affiliateLink.create({
          data: {
            userId,
            merchantId: merchant?.id,
            originalUrl,
            shortCode: randomBytes(6).toString('base64url'),
            events: { create: { title: 'Link didaftarkan' } },
          },
          include: { merchant: { select: { name: true } } },
        });
        const merchantName = link.merchant?.name ?? null;
        await this.notifications.add(
          userId,
          'Link terdaftar',
          merchantName ? `Link di ${merchantName} sudah didaftarkan.` : 'Link produkmu sudah didaftarkan.',
        );
        return {
          id: link.id,
          shortCode: link.shortCode,
          originalUrl: link.originalUrl,
          merchantName,
        };
      } catch (error) {
        const duplicate =
          error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
        if (!duplicate || attempt === 2) {
          throw error;
        }
      }
    }

    throw new Error('Gagal membuat kode link.');
  }

  listMine(userId: string) {
    return this.prisma.affiliateLink.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        originalUrl: true,
        shortCode: true,
        status: true,
        isActive: true,
        createdAt: true,
        merchant: { select: { id: true, name: true } },
        events: {
          orderBy: { createdAt: 'asc' },
          select: { id: true, title: true, createdAt: true },
        },
      },
    });
  }

  async withdraw(userId: string, id: string) {
    const link = await this.prisma.affiliateLink.findFirst({
      where: { id, userId },
      select: {
        id: true,
        status: true,
        events: { select: { title: true } },
      },
    });
    if (!link) {
      throw new NotFoundException('Link tidak ditemukan.');
    }
    if (link.status === AffiliateLinkStatus.done || link.status === AffiliateLinkStatus.rejected) {
      throw new BadRequestException('Withdraw tidak tersedia untuk link ini.');
    }
    if (link.events.some((event) => event.title === 'Withdraw diajukan')) {
      throw new BadRequestException('Withdraw sudah diajukan.');
    }
    await this.prisma.linkEvent.create({
      data: { affiliateLinkId: id, title: 'Withdraw diajukan' },
    });
    return { ok: true };
  }

  listForReview() {
    return this.prisma.affiliateLink
      .findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: reviewSelect,
      })
      .then((links) => links.map(presentReview));
  }

  async setStatus(id: string, status: AffiliateLinkStatus, note?: string) {
    const link = await this.prisma.affiliateLink.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        status: true,
        events: { orderBy: { createdAt: 'desc' }, take: 8, select: { title: true } },
      },
    });
    if (!link) {
      throw new NotFoundException('Link tidak ditemukan.');
    }

    const trimmed = (note || '').trim();
    if (status === AffiliateLinkStatus.note && trimmed.length < 2) {
      throw new BadRequestException('Isi catatan.');
    }

    const title = status === AffiliateLinkStatus.note ? trimmed : STATUS_EVENT[status];
    const sameNote = status === AffiliateLinkStatus.note && link.events.some((event) => event.title === title);
    if (link.status === status && (status !== AffiliateLinkStatus.note || sameNote)) {
      const current = await this.prisma.affiliateLink.findUnique({ where: { id }, select: reviewSelect });
      if (!current) throw new NotFoundException('Link tidak ditemukan.');
      return presentReview(current);
    }

    await this.prisma.affiliateLink.update({
      where: { id },
      data: { status, events: { create: { title } } },
    });
    const notice = STATUS_NOTICE[status];
    await this.notifications.add(link.userId, notice.title, status === AffiliateLinkStatus.note ? trimmed : notice.body);

    const updated = await this.prisma.affiliateLink.findUnique({ where: { id }, select: reviewSelect });
    if (!updated) throw new NotFoundException('Link tidak ditemukan.');
    return presentReview(updated);
  }

  async preview(rawUrl: string) {
    const empty = { image: '', description: '' };
    let current: URL;
    try {
      current = new URL(rawUrl.trim());
    } catch {
      return empty;
    }
    if (current.protocol !== 'http:' && current.protocol !== 'https:') return empty;

    try {
      for (let hop = 0; hop < 3; hop += 1) {
        if (await this.isBlockedHost(current.hostname)) return empty;
        const response = await fetch(current, {
          redirect: 'manual',
          signal: AbortSignal.timeout(5000),
          headers: { Accept: 'text/html', 'User-Agent': 'BliyoPreview/1.0' },
        });
        if (response.status >= 300 && response.status < 400) {
          const location = response.headers.get('location');
          if (!location) return empty;
          current = new URL(location, current);
          continue;
        }
        if (!response.ok) return empty;
        const type = response.headers.get('content-type') || '';
        if (!type.includes('text/html')) return empty;
        const html = (await response.text()).slice(0, 350000);
        const description = this.metaContent(html, 'og:description') || this.metaContent(html, 'description');
        const image = this.absoluteUrl(this.metaContent(html, 'og:image'), current);
        return { image, description };
      }
    } catch {
      return empty;
    }
    return empty;
  }

  findActiveByCode(shortCode: string) {
    return this.prisma.affiliateLink.findFirst({
      where: { shortCode, isActive: true },
      select: { originalUrl: true },
    });
  }

  private metaContent(html: string, key: string) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const patterns = [
      new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["']`, 'i'),
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) {
        return match[1]
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .trim();
      }
    }
    return '';
  }

  private absoluteUrl(value: string, base: URL) {
    if (!value) return '';
    try {
      const url = new URL(value, base);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
      return url.href;
    } catch {
      return '';
    }
  }

  private async isBlockedHost(hostname: string) {
    const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');
    if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) return true;
    const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
    return addresses.some((item) => this.isPrivateIp(item.address));
  }

  private isPrivateIp(ip: string) {
    const normalized = ip.toLowerCase();
    if (normalized === '::1' || normalized.startsWith('fc') || normalized.startsWith('fd') || normalized.startsWith('fe80:')) {
      return true;
    }
    const mapped = normalized.startsWith('::ffff:') ? normalized.slice(7) : normalized;
    const parts = mapped.split('.').map((part) => Number(part));
    if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return false;
    const [a, b] = parts;
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
  }
}
