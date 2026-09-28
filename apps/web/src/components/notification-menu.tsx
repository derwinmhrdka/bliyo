'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './notification-menu.module.css';

type Item = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  unread: boolean;
};

function BellIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.2 16.5h11.6l-1.1-1.6V10a4.7 4.7 0 0 0-9.4 0v4.9l-1.1 1.6Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M10 16.5a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function NotificationMenu() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pending, setPending] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  async function load() {
    const response = await fetch('/api/notifications');
    if (!response.ok) return;
    const data = (await response.json()) as {
      unread: Omit<Item, 'unread'>[];
      read: Omit<Item, 'unread'>[];
    };
    setUnreadCount(data.unread.length);
    setItems([
      ...data.unread.map((item) => ({ ...item, unread: true })),
      ...data.read.map((item) => ({ ...item, unread: false })),
    ]);
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  async function markRead() {
    setPending(true);
    try {
      const response = await fetch('/api/notifications/read', { method: 'POST' });
      if (response.ok) await load();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={styles.wrap} ref={root}>
      <button
        type="button"
        className={styles.bell}
        aria-label="Notifikasi"
        aria-expanded={open}
        onClick={() => {
          setOpen((value) => !value);
          if (!open) void load();
        }}
      >
        <BellIcon />
        {unreadCount > 0 ? <span className={styles.dot} /> : null}
      </button>
      {open ? (
        <div className={styles.menu}>
          {unreadCount > 0 ? (
            <button type="button" className={styles.mark} disabled={pending} onClick={() => void markRead()}>
              Tandai telah dibaca
            </button>
          ) : null}
          {items.length === 0 ? <p className={styles.empty}>Belum ada notifikasi.</p> : null}
          <div className={styles.list}>
            {items.map((item) => (
              <article key={item.id} className={`${styles.item} ${item.unread ? styles.itemUnread : ''}`}>
                <p className={styles.title}>{item.title}</p>
                <p className={styles.body}>{item.body}</p>
                <p className={styles.time}>{formatTime(item.createdAt)}</p>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
