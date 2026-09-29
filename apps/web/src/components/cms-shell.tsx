'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogoutButton } from './logout-button';
import styles from './cms-shell.module.css';

const NAV_KEY = 'bliyo_cms_nav';

function MenuLines() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function NavIcon({ label }: { label: string }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (label === 'Dashboard') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="7" height="7" rx="1.5" {...common} />
        <rect x="13" y="4" width="7" height="7" rx="1.5" {...common} />
        <rect x="4" y="13" width="7" height="7" rx="1.5" {...common} />
        <rect x="13" y="13" width="7" height="7" rx="1.5" {...common} />
      </svg>
    );
  }
  if (label === 'Links' || label === 'My Link') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10 13.5a4 4 0 0 0 5.7.4l2.2-2.2a4 4 0 0 0-5.7-5.6L11 7.3" {...common} />
        <path d="M14 10.5a4 4 0 0 0-5.7-.4L6.1 12.3a4 4 0 0 0 5.7 5.6L13 16.7" {...common} />
      </svg>
    );
  }
  if (label === 'User' || label === 'Profile') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="8" r="3" {...common} />
        <path d="M6.5 18.5a5.5 5.5 0 0 1 11 0" {...common} />
      </svg>
    );
  }
  if (label === 'Settings') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="3" {...common} />
        <path d="M12 4.5v2.2M12 17.3v2.2M4.5 12h2.2M17.3 12h2.2M6.7 6.7l1.6 1.6M15.7 15.7l1.6 1.6M17.3 6.7l-1.6 1.6M8.3 15.7l-1.6 1.6" {...common} />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 7.5h14M5 12h14M5 16.5h9" {...common} />
    </svg>
  );
}

export type CmsNavItem = {
  href: string;
  label: string;
  exact?: boolean;
};

export function CmsShell({
  children,
  items,
  profile,
}: {
  children: React.ReactNode;
  items: CmsNavItem[];
  profile: { href: string; firstName: string; avatar: string };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem(NAV_KEY) === 'min');
  }, []);

  function toggleCollapsed() {
    setCollapsed((value) => {
      const next = !value;
      window.localStorage.setItem(NAV_KEY, next ? 'min' : 'full');
      return next;
    });
  }

  const isActive = (item: CmsNavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <div className={styles.shell}>
      {open ? (
        <button type="button" aria-label="Tutup menu" className={styles.backdrop} onClick={() => setOpen(false)} />
      ) : null}

      <aside className={`${styles.aside} ${open ? styles.asideOpen : ''} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.brandRow}>
          <Link href="/" className={styles.brand}>
            <img src="/brand/bliyo-logo.png" alt="Bliyo" className={styles.mark} />
          </Link>
          <button
            type="button"
            className={styles.collapse}
            aria-label={collapsed ? 'Perbesar menu' : 'Kecilkan menu'}
            onClick={toggleCollapsed}
          >
            <MenuLines />
          </button>
        </div>
        <Link href={profile.href} className={styles.identity} onClick={() => setOpen(false)}>
          <span className={styles.avatar}>
            {profile.avatar ? <img src={profile.avatar} alt="" /> : (profile.firstName || 'B').slice(0, 1).toUpperCase()}
          </span>
          <span className={styles.greeting}>{profile.firstName ? `Hi, ${profile.firstName}` : 'Hi'}</span>
        </Link>
        <nav className={styles.nav}>
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item) ? 'page' : undefined}
              onClick={() => setOpen(false)}
              title={item.label}
              className={`${styles.item} ${isActive(item) ? styles.itemActive : ''}`}
            >
              <span className={styles.itemIcon}>
                <NavIcon label={item.label} />
              </span>
              <span className={styles.itemText}>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className={styles.logout}>
          <LogoutButton
            withIcon
            labelClassName={collapsed ? styles.itemText : undefined}
            className={`${styles.item} inline-flex w-full items-center gap-2 text-left`}
          />
        </div>
      </aside>

      <div className={styles.main}>
        <div className={styles.mobileBar}>
          <button type="button" className={styles.menuButton} onClick={() => setOpen(true)}>
            Menu
          </button>
          <img src="/brand/bliyo-logo.png" alt="Bliyo" className={styles.mobileMark} />
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
