'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LogoutButton } from './logout-button';
import styles from './cms-shell.module.css';

export type CmsNavItem = {
  href: string;
  label: string;
  exact?: boolean;
};

export function CmsShell({ children, items }: { children: React.ReactNode; items: CmsNavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (item: CmsNavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <div className={styles.shell}>
      {open ? (
        <button type="button" aria-label="Tutup menu" className={styles.backdrop} onClick={() => setOpen(false)} />
      ) : null}

      <aside className={`${styles.aside} ${open ? styles.asideOpen : ''}`}>
        <Link href="/" className={styles.brand}>
          <img src="/brand/bliyo-logo.png" alt="Bliyo" className={styles.mark} />
        </Link>
        <nav className={styles.nav}>
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item) ? 'page' : undefined}
              onClick={() => setOpen(false)}
              className={`${styles.item} ${isActive(item) ? styles.itemActive : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.logout}>
          <LogoutButton withIcon className={`${styles.item} inline-flex w-full items-center gap-2 text-left`} />
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
