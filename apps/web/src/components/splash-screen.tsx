'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from './splash-screen.module.css';

const DASHBOARDS = new Set(['/admin', '/member']);

function inCms(path: string) {
  return path === '/admin' || path.startsWith('/admin/') || path === '/member' || path.startsWith('/member/');
}

function shouldSplash(path: string, firstLoad: boolean, from: string | null) {
  if (firstLoad) return true;
  if (path === '/login') return true;
  if (from && inCms(from) && inCms(path)) return false;
  return DASHBOARDS.has(path);
}

export function SplashScreen() {
  const pathname = usePathname();
  const firstLoad = useRef(true);
  const previous = useRef<string | null>(null);
  const [phase, setPhase] = useState<'enter' | 'show' | 'leave'>('enter');

  useEffect(() => {
    const first = firstLoad.current;
    const from = previous.current;
    firstLoad.current = false;
    previous.current = pathname;
    if (!shouldSplash(pathname, first, from)) {
      setPhase('leave');
      return;
    }

    setPhase('enter');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setPhase('show'));
    });
    const hold = window.setTimeout(() => setPhase('leave'), reduced ? 180 : 900);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(hold);
    };
  }, [pathname]);

  return (
    <div
      className={`${styles.screen} ${phase === 'show' ? styles.show : ''} ${phase === 'leave' ? styles.leave : ''}`}
      aria-hidden={phase !== 'show'}
      role="status"
    >
      <svg className={styles.wave} viewBox="0 0 920 560" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M0 380 C 180 320, 340 440, 560 380 C 720 335, 820 400, 920 360 L920 560 L0 560 Z"
          fill="#155c33"
        />
      </svg>
      <svg className={`${styles.wave} ${styles.waveFront}`} viewBox="0 0 920 560" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M0 460 C 200 410, 380 500, 620 450 C 760 420, 840 470, 920 445 L920 560 L0 560 Z"
          fill="#1a6b3f"
        />
      </svg>
      <div className={styles.center}>
        <img src="/brand/bliyo-logo.png" alt="" className={styles.logo} />
        <span className={styles.track}>
          <span className={styles.bar} data-path={pathname} />
        </span>
      </div>
    </div>
  );
}
