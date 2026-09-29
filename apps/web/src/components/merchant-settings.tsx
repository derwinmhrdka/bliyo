'use client';

import { useEffect, useState, type FormEvent } from 'react';
import styles from './settings-form.module.css';

type Merchant = {
  id: string;
  name: string;
  domain: string | null;
  commissionRate: number;
  isActive: boolean;
};

const empty = { name: '', domain: '', commissionRate: '', isActive: true };

export function MerchantSettings() {
  const [rows, setRows] = useState<Merchant[]>([]);
  const [draft, setDraft] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/merchants', { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error('Gagal');
        setRows(data as Merchant[]);
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === 'AbortError') return;
        setError('Merchant gagal dimuat.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  async function create(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/merchants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: draft.name,
          domain: draft.domain,
          commissionRate: Number(draft.commissionRate || 0),
          isActive: draft.isActive,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const message = Array.isArray(data?.message) ? data.message[0] : data?.message;
        setError(message || 'Merchant gagal disimpan.');
        return;
      }
      setRows((current) => [...current, data as Merchant].sort((a, b) => a.name.localeCompare(b.name)));
      setDraft(empty);
    } catch {
      setError('Merchant gagal disimpan.');
    } finally {
      setPending(false);
    }
  }

  async function save(row: Merchant) {
    setPending(true);
    setError('');
    try {
      const response = await fetch(`/api/merchants/${row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: row.name,
          domain: row.domain || '',
          commissionRate: Number(row.commissionRate),
          isActive: row.isActive,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const message = Array.isArray(data?.message) ? data.message[0] : data?.message;
        setError(message || 'Merchant gagal disimpan.');
        return;
      }
      setRows((current) => current.map((item) => (item.id === row.id ? (data as Merchant) : item)));
    } catch {
      setError('Merchant gagal disimpan.');
    } finally {
      setPending(false);
    }
  }

  function patch(id: string, next: Partial<Merchant>) {
    setRows((current) => current.map((item) => (item.id === id ? { ...item, ...next } : item)));
  }

  return (
    <>
      <form className={styles.form} onSubmit={(event) => void create(event)}>
        <div className={styles.grid}>
          <label className={styles.field}>
            Nama toko
            <input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
          </label>
          <label className={styles.field}>
            Domain
            <input
              value={draft.domain}
              placeholder="tokopedia.com"
              onChange={(event) => setDraft({ ...draft, domain: event.target.value })}
            />
          </label>
          <label className={styles.field}>
            Komisi (%)
            <input
              required
              inputMode="decimal"
              value={draft.commissionRate}
              onChange={(event) => setDraft({ ...draft, commissionRate: event.target.value })}
            />
          </label>
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={draft.isActive}
              onChange={(event) => setDraft({ ...draft, isActive: event.target.checked })}
            />
            Aktif
          </label>
        </div>
        <div className={styles.actions}>
          <button type="submit" className={styles.save} disabled={pending}>
            Tambah
          </button>
        </div>
      </form>
      {error ? <p className={styles.error}>{error}</p> : null}
      {loading ? <p className={styles.muted}>Memuat merchant...</p> : null}
      {!loading && !rows.length ? <p className={styles.muted}>Belum ada merchant.</p> : null}
      <ul className={styles.list}>
        {rows.map((row) => (
          <li key={row.id} className={styles.card}>
            <div className={styles.grid}>
              <label className={styles.field}>
                Nama toko
                <input value={row.name} onChange={(event) => patch(row.id, { name: event.target.value })} />
              </label>
              <label className={styles.field}>
                Domain
                <input value={row.domain || ''} onChange={(event) => patch(row.id, { domain: event.target.value })} />
              </label>
              <label className={styles.field}>
                Komisi (%)
                <input
                  inputMode="decimal"
                  value={String(row.commissionRate)}
                  onChange={(event) => patch(row.id, { commissionRate: Number(event.target.value) })}
                />
              </label>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={row.isActive}
                  onChange={(event) => patch(row.id, { isActive: event.target.checked })}
                />
                Aktif
              </label>
            </div>
            <div className={styles.actions}>
              <button type="button" className={styles.save} disabled={pending} onClick={() => void save(row)}>
                Simpan
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
