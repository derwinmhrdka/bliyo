'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { formatRupiah } from '@/lib/format';
import styles from './transaction-list.module.css';

type Status = 'pending' | 'confirmed' | 'cancelled';

type Row = {
  id: string;
  amount: number;
  commission: number;
  status: Status;
  occurredAt: string;
  memberName: string;
  merchantName: string | null;
  shortCode: string | null;
};

type Member = { id: string; name: string };
type LinkOption = { id: string; userId: string; shortCode: string; originalUrl: string };

const STATUS_LABEL: Record<Status, string> = {
  pending: 'Menunggu',
  confirmed: 'Selesai',
  cancelled: 'Dibatalkan',
};

function formatDay(value: string) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value));
}

export function TransactionList({ mode }: { mode: 'admin' | 'member' }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [links, setLinks] = useState<LinkOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [userId, setUserId] = useState('');
  const [linkId, setLinkId] = useState('');
  const [amount, setAmount] = useState('');
  const [commission, setCommission] = useState('');
  const [status, setStatus] = useState<Status>('pending');

  useEffect(() => {
    const controller = new AbortController();
    const path = mode === 'admin' ? '/api/transactions' : '/api/transactions/mine';
    fetch(path, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error('Gagal');
        setRows(data as Row[]);
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === 'AbortError') return;
        setError('Transaksi gagal dimuat.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [mode]);

  useEffect(() => {
    if (mode !== 'admin') return;
    const controller = new AbortController();
    Promise.all([
      fetch('/api/users', { signal: controller.signal }).then((response) => response.json()),
      fetch('/api/affiliate-links', { signal: controller.signal }).then((response) => response.json()),
    ])
      .then(([users, linkRows]) => {
        const people = (users as { id: string; name: string; firstName?: string | null; isActive: boolean }[])
          .filter((user) => user.isActive)
          .map((user) => ({ id: user.id, name: user.firstName || user.name }));
        setMembers(people);
        setLinks(
          (linkRows as LinkOption[]).map((link) => ({
            id: link.id,
            userId: link.userId,
            shortCode: link.shortCode,
            originalUrl: link.originalUrl,
          })),
        );
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [mode]);

  const memberLinks = useMemo(() => links.filter((link) => link.userId === userId), [links, userId]);

  async function save(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          affiliateLinkId: linkId || undefined,
          amount: Number(amount),
          commissionAmount: Number(commission || 0),
          status,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const message = Array.isArray(data?.message) ? data.message[0] : data?.message;
        setError(message || 'Transaksi gagal dicatat.');
        return;
      }
      setRows((current) => [data as Row, ...current]);
      setAmount('');
      setCommission('');
      setLinkId('');
      setStatus('pending');
    } catch {
      setError('Transaksi gagal dicatat.');
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {mode === 'admin' ? (
        <form className={styles.form} onSubmit={(event) => void save(event)}>
          <div className={styles.fields}>
            <label className={styles.field}>
              Member
              <select
                required
                value={userId}
                onChange={(event) => {
                  setUserId(event.target.value);
                  setLinkId('');
                }}
              >
                <option value="">Pilih member</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              Link
              <select value={linkId} onChange={(event) => setLinkId(event.target.value)} disabled={!userId}>
                <option value="">Tanpa link</option>
                {memberLinks.map((link) => (
                  <option key={link.id} value={link.id}>
                    {link.shortCode}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              Nominal
              <input inputMode="numeric" required value={amount} onChange={(event) => setAmount(event.target.value)} />
            </label>
            <label className={styles.field}>
              Komisi
              <input inputMode="numeric" required value={commission} onChange={(event) => setCommission(event.target.value)} />
            </label>
            <label className={styles.field}>
              Status
              <select value={status} onChange={(event) => setStatus(event.target.value as Status)}>
                <option value="pending">Menunggu</option>
                <option value="confirmed">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </label>
          </div>
          <div className={styles.actions}>
            <button type="submit" className={styles.save} disabled={pending}>
              Catat
            </button>
          </div>
        </form>
      ) : null}
      {error ? <p className={styles.error}>{error}</p> : null}
      {loading ? <p className={styles.muted}>Memuat transaksi...</p> : null}
      {!loading && !rows.length ? <p className={styles.muted}>Belum ada transaksi.</p> : null}
      <ul className={styles.list}>
        {rows.map((row) => (
          <li key={row.id} className={styles.card}>
            <div className={styles.head}>
              <div>
                <p className={styles.title}>{row.merchantName || 'Transaksi'}</p>
                <p className={styles.meta}>
                  {mode === 'admin' ? `${row.memberName} · ` : ''}
                  {formatDay(row.occurredAt)}
                  {row.shortCode ? ` · ${row.shortCode}` : ''}
                </p>
              </div>
              <span className={styles.status}>
                <span className={styles.led} data-status={row.status} aria-hidden="true" />
                {STATUS_LABEL[row.status]}
              </span>
            </div>
            <div className={styles.amounts}>
              <p>
                Nominal
                <strong>{formatRupiah(row.amount)}</strong>
              </p>
              <p>
                Komisi
                <strong>{formatRupiah(row.commission)}</strong>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
