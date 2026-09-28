'use client';

import { useEffect, useState } from 'react';
import styles from '@/app/register/register.module.css';

export type PlaceValue = {
  provinceId: string;
  provinceName: string;
  regencyId: string;
  regencyName: string;
  districtId: string;
  districtName: string;
  address: string;
};

type Option = { id: string; name: string };

const emptyPlace: PlaceValue = {
  provinceId: '',
  provinceName: '',
  regencyId: '',
  regencyName: '',
  districtId: '',
  districtName: '',
  address: '',
};

export function RegionFields({
  value,
  onChange,
  readOnly = false,
}: {
  value: PlaceValue;
  onChange: (next: PlaceValue) => void;
  readOnly?: boolean;
}) {
  const [provinces, setProvinces] = useState<Option[]>([]);
  const [regencies, setRegencies] = useState<Option[]>([]);
  const [districts, setDistricts] = useState<Option[]>([]);

  useEffect(() => {
    if (readOnly) return;
    const controller = new AbortController();
    fetch('/api/regions/provinces', { signal: controller.signal })
      .then((response) => response.json())
      .then((data: Option[]) => setProvinces(Array.isArray(data) ? data : []))
      .catch(() => undefined);
    return () => controller.abort();
  }, [readOnly]);

  useEffect(() => {
    if (readOnly || !value.provinceId) {
      setRegencies([]);
      return;
    }
    const controller = new AbortController();
    fetch(`/api/regions/regencies/${value.provinceId}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((data: Option[]) => setRegencies(Array.isArray(data) ? data : []))
      .catch(() => undefined);
    return () => controller.abort();
  }, [readOnly, value.provinceId]);

  useEffect(() => {
    if (readOnly || !value.regencyId) {
      setDistricts([]);
      return;
    }
    const controller = new AbortController();
    fetch(`/api/regions/districts/${value.regencyId}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((data: Option[]) => setDistricts(Array.isArray(data) ? data : []))
      .catch(() => undefined);
    return () => controller.abort();
  }, [readOnly, value.regencyId]);

  if (readOnly) {
    return (
      <>
        <label className={styles.field}>
          <span>Provinsi</span>
          <input value={value.provinceName} readOnly />
        </label>
        <label className={styles.field}>
          <span>Kabupaten/Kota</span>
          <input value={value.regencyName} readOnly />
        </label>
        <label className={styles.field}>
          <span>Kecamatan</span>
          <input value={value.districtName} readOnly />
        </label>
        <label className={styles.field}>
          <span>Alamat</span>
          <textarea value={value.address} readOnly rows={3} />
        </label>
      </>
    );
  }

  return (
    <>
      <label className={styles.field}>
        <span>Provinsi</span>
        <select
          value={value.provinceId}
          onChange={(event) => {
            const province = provinces.find((item) => item.id === event.target.value);
            onChange({
              ...value,
              provinceId: province?.id || '',
              provinceName: province?.name || '',
              regencyId: '',
              regencyName: '',
              districtId: '',
              districtName: '',
            });
          }}
        >
          <option value="">Pilih provinsi</option>
          {provinces.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.field}>
        <span>Kabupaten/Kota</span>
        <select
          value={value.regencyId}
          disabled={!value.provinceId}
          onChange={(event) => {
            const regency = regencies.find((item) => item.id === event.target.value);
            onChange({
              ...value,
              regencyId: regency?.id || '',
              regencyName: regency?.name || '',
              districtId: '',
              districtName: '',
            });
          }}
        >
          <option value="">Pilih kabupaten/kota</option>
          {regencies.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.field}>
        <span>Kecamatan</span>
        <select
          value={value.districtId}
          disabled={!value.regencyId}
          onChange={(event) => {
            const district = districts.find((item) => item.id === event.target.value);
            onChange({
              ...value,
              districtId: district?.id || '',
              districtName: district?.name || '',
            });
          }}
        >
          <option value="">Pilih kecamatan</option>
          {districts.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.field}>
        <span>Alamat</span>
        <textarea value={value.address} onChange={(event) => onChange({ ...value, address: event.target.value })} rows={3} />
      </label>
    </>
  );
}

export { emptyPlace };
