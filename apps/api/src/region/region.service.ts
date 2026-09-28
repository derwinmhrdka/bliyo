import { BadRequestException, Injectable } from '@nestjs/common';

type RegionItem = { id: string; name: string };

const BASE = 'https://emsifa.github.io/api-wilayah-indonesia/api';

@Injectable()
export class RegionService {
  private readonly cache = new Map<string, RegionItem[]>();

  provinces() {
    return this.load('provinces.json');
  }

  regencies(provinceId: string) {
    return this.load(`regencies/${this.id(provinceId)}.json`);
  }

  districts(regencyId: string) {
    return this.load(`districts/${this.id(regencyId)}.json`);
  }

  private id(value: string) {
    if (!/^\d{2,7}$/.test(value)) {
      throw new BadRequestException('Wilayah tidak valid.');
    }
    return value;
  }

  private async load(path: string) {
    const cached = this.cache.get(path);
    if (cached) return cached;
    const response = await fetch(`${BASE}/${path}`, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) return [];
    const data = (await response.json()) as { id: string; name: string }[];
    const items = data.map((item) => ({
      id: String(item.id),
      name: item.name.toLowerCase().replace(/(^|\s)\S/g, (char) => char.toUpperCase()),
    }));
    this.cache.set(path, items);
    return items;
  }
}
