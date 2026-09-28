'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M10 7V5.5A1.5 1.5 0 0 1 11.5 4h7A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 10 18.5V17"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path d="M13 12H4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M6.5 9.5 4 12l2.5 2.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LogoutButton({
  tone = 'muted',
  label = 'Keluar',
  withIcon = false,
  className,
}: {
  tone?: 'muted' | 'light';
  label?: string;
  withIcon?: boolean;
  className?: string;
}) {
  const [ask, setAsk] = useState(false);
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setHost(document.getElementById('bliyo-portal'));
  }, []);

  async function logout() {
    try {
      await fetch('/auth/logout', { method: 'POST' });
    } finally {
      window.location.assign('/login');
    }
  }

  const toneClass =
    tone === 'light'
      ? 'inline-flex items-center gap-2 text-sm font-semibold text-white/70'
      : 'inline-flex items-center gap-2 text-sm font-semibold text-mute';

  const english = host !== null && document.cookie.includes('bliyo_lang=en');
  const title = english ? 'Sure you want to leave?' : 'Yakin nih mau keluar?';
  const note = english ? 'You will be taken to the login page' : 'Kamu akan diarahkan ke halaman login';
  const cancel = english ? 'Cancel' : 'Batal';
  const confirm = english ? 'Log out' : 'Keluar';

  return (
    <>
      <button type="button" onClick={() => setAsk(true)} className={className ?? toneClass}>
        {withIcon ? <LogoutIcon /> : null}
        {label}
      </button>
      {host
        ? createPortal(
            <div
              className={`fixed inset-0 z-[90] items-center justify-center bg-[#0e3d23]/40 px-4 ${ask ? 'flex' : 'hidden'}`}
              role="dialog"
              aria-modal="true"
              aria-hidden={!ask}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="w-full max-w-[320px] rounded-[12px] border border-[#dfe8e2] bg-[#fbf8f2] px-5 py-5 text-center">
                <p className="mb-2 text-4xl leading-none" aria-hidden="true">
                  😢
                </p>
                <p className="text-base font-bold text-[#16241c]">{title}</p>
                <p className="mt-1 text-xs text-[#5c6b62]">{note}</p>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-[9px] border border-[#dfe8e2] px-3 py-2 text-sm text-[#16241c]"
                    onClick={() => setAsk(false)}
                  >
                    {cancel}
                  </button>
                  <button
                    type="button"
                    className="rounded-[9px] bg-[#0e3d23] px-3 py-2 text-sm font-bold text-white"
                    onClick={logout}
                  >
                    {confirm}
                  </button>
                </div>
              </div>
            </div>,
            host,
          )
        : null}
    </>
  );
}
