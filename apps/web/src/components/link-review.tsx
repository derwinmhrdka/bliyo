'use client';

import { useEffect, useState } from 'react';
import styles from '@/app/admin/links/links.module.css';

type Status = 'processing' | 'note' | 'done' | 'rejected';

type ReviewLink = {
  id: string;
  originalUrl: string;
  shortCode: string;
  status: Status;
  createdAt: string;
  memberName: string;
  merchantName: string | null;
  note: string;
  events: { id: string; title: string; createdAt: string }[];
};

const STATUS_LABEL: Record<Status, string> = {
  done: 'Selesai',
  note: 'Catatan',
  processing: 'Sedang diproses',
  rejected: 'Ditolak',
};

function formatDay(value: string) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value));
}

export function LinkReview() {
  const [links, setLinks] = useState<ReviewLink[]>([]);
  const [drafts, setDrafts] = useState<Record<string, { status: Status; note: string }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/affiliate-links', { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error('Gagal');
        const rows = data as ReviewLink[];
        setLinks(rows);
        setDrafts(
          Object.fromEntries(rows.map((link) => [link.id, { status: link.status, note: link.note }])),
        );
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === 'AbortError') return;
        setError('Link gagal dimuat.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  async function save(id: string) {
    const draft = drafts[id];
    if (!draft) return;
    setPendingId(id);
    setError('');
    try {
      const response = await fetch(`/api/affiliate-links/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: draft.status, note: draft.note }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.message || 'Status gagal disimpan.');
        return;
      }
      const next = data as ReviewLink;
      setLinks((current) => current.map((link) => (link.id === id ? next : link)));
      setDrafts((current) => ({ ...current, [id]: { status: next.status, note: next.note } }));
    } catch {
      setError('Status gagal disimpan.');
    } finally {
      setPendingId(null);
    }
  }

  if (loading) return <p className={styles.muted}>Memuat link...</p>;
  if (!links.length && !error) return <p className={styles.muted}>Belum ada link.</p>;

  return (
    <>
      {error ? <p className={styles.error}>{error}</p> : null}
      <ul className={styles.list}>
        {links.map((link) => {
          const draft = drafts[link.id] || { status: link.status, note: link.note };
          return (
            <li key={link.id} className={styles.card}>
              <div className={styles.head}>
                <div className={styles.url}>{link.originalUrl}</div>
                <span className={styles.status}>
                  <span className={styles.led} data-status={link.status} aria-hidden="true" />
                  {STATUS_LABEL[link.status]}
                </span>
              </div>
              <p className={styles.meta}>
                {link.memberName}
                {link.merchantName ? ` · ${link.merchantName}` : ''} · {formatDay(link.createdAt)}
              </p>
              <div className={styles.form}>
                <label className={styles.field}>
                  Status
                  <select
                    value={draft.status}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [link.id]: { ...draft, status: event.target.value as Status },
                      }))
                    }
                  >
                    <option value="processing">Sedang diproses</option>
                    <option value="note">Catatan</option>
                    <option value="done">Selesai</option>
                    <option value="rejected">Ditolak</option>
                  </select>
                </label>
                {draft.status === 'note' ? (
                  <label className={styles.field}>
                    Catatan
                    <textarea
                      value={draft.note}
                      maxLength={160}
                      placeholder="Tulis catatan untuk member"
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [link.id]: { ...draft, note: event.target.value },
                        }))
                      }
                    />
                  </label>
                ) : null}
                <button type="button" className={styles.save} disabled={pendingId === link.id} onClick={() => void save(link.id)}>
                  Simpan
                </button>
              </div>
              {link.events.length ? (
                <div className={styles.history}>
                  {link.events.map((event) => (
                    <p key={event.id}>
                      {formatDay(event.createdAt)} · {event.title}
                    </p>
                  ))}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </>
  );
}
