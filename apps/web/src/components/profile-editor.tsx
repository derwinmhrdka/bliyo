'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import 'react-phone-number-input/style.css';
import form from '@/app/register/register.module.css';
import styles from './profile-editor.module.css';

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Profile = {
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  referralCode: string | null;
  avatarData: string | null;
  name: string;
};

type Draft = {
  firstName: string;
  lastName: string;
  username: string;
  savedUsername: string;
  email: string;
  phone?: string;
  address: string;
  referralCode: string;
  avatar: string;
  password: string;
  confirmPassword: string;
};

function passwordScore(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (password.length >= 12 && /[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

function strengthLabel(score: number) {
  if (score <= 1) return 'Poor';
  if (score === 2) return 'Fair';
  if (score === 3) return 'Good';
  return 'Excellent';
}

async function compressImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const max = 256;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return '';
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.72);
}

function toDraft(profile: Profile): Draft {
  return {
    firstName: profile.firstName || profile.name,
    lastName: profile.lastName || '',
    username: profile.username || '',
    savedUsername: (profile.username || '').toLowerCase(),
    email: profile.email,
    phone: profile.phone || undefined,
    address: profile.address || '',
    referralCode: profile.referralCode || '',
    avatar: profile.avatarData || '',
    password: '',
    confirmPassword: '',
  };
}

function OkIcon({ label }: { label: string }) {
  return (
    <svg className={form.check} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-label={label}>
      <circle cx="12" cy="12" r="8.25" stroke="#1f8a4c" strokeWidth="1.75" />
      <path d="M8.2 12.2 11 15l4.8-6" stroke="#1f8a4c" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BadIcon({ label }: { label: string }) {
  return (
    <svg className={form.check} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-label={label}>
      <circle cx="12" cy="12" r="8.25" stroke="#9f2d2d" strokeWidth="1.75" />
      <path d="M9 9l6 6M15 9l-6 6" stroke="#9f2d2d" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20h4l10.2-10.2a1.6 1.6 0 0 0 0-2.3L16.5 5.8a1.6 1.6 0 0 0-2.3 0L4 16v4Z" stroke="currentColor" strokeWidth="1.75" />
      <path d="M13.2 7.2 16.8 10.8" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

export function ProfileEditor({ trail }: { trail: string }) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState<Draft | null>(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'free' | 'taken'>('idle');
  const score = useMemo(() => passwordScore(draft?.password ?? ''), [draft?.password]);
  const passwordRules = {
    length: (draft?.password.length ?? 0) >= 8,
    letters: /[a-z]/.test(draft?.password ?? '') && /[A-Z]/.test(draft?.password ?? ''),
    number: /\d/.test(draft?.password ?? ''),
  };

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/users/me', { signal: controller.signal })
      .then(async (response) => {
        const data = (await response.json().catch(() => null)) as Profile | { message?: string } | null;
        if (!response.ok || !data || !('email' in data)) {
          throw new Error('message' in (data || {}) ? String((data as { message?: string }).message) : 'Profil gagal dimuat.');
        }
        const next = toDraft(data);
        setDraft(next);
        setSaved(next);
        setError('');
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === 'AbortError') return;
        setError('Profil gagal dimuat.');
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!editing || !draft) return;
    const normalized = draft.username.trim().toLowerCase();
    if (normalized && normalized === draft.savedUsername) {
      setUsernameStatus('free');
      return;
    }
    if (!USERNAME_PATTERN.test(normalized)) {
      setUsernameStatus('idle');
      return;
    }
    const controller = new AbortController();
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setUsernameStatus('checking');
      fetch(`/api/auth/username-available?username=${encodeURIComponent(normalized)}`, { signal: controller.signal })
        .then((response) => response.json())
        .then((data: { available?: boolean }) => {
          if (!cancelled) setUsernameStatus(data.available === false ? 'taken' : 'free');
        })
        .catch((reason: unknown) => {
          if (cancelled || (reason instanceof DOMException && reason.name === 'AbortError')) return;
          setUsernameStatus('idle');
        });
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [draft, editing]);

  function cancel() {
    if (saved) setDraft(saved);
    setEditing(false);
    setError('');
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!draft || !editing) return;
    if (!draft.firstName.trim()) {
      setError('First Name wajib diisi.');
      return;
    }
    if (!USERNAME_PATTERN.test(draft.username.trim().toLowerCase()) || usernameStatus === 'taken') {
      setError('Username tidak tersedia.');
      return;
    }
    if (!EMAIL_PATTERN.test(draft.email.trim())) {
      setError('Email tidak valid.');
      return;
    }
    if (!draft.phone || !isValidPhoneNumber(draft.phone)) {
      setError('Nomor telepon tidak valid.');
      return;
    }
    if (draft.password || draft.confirmPassword) {
      if (!passwordRules.length || !passwordRules.letters || !passwordRules.number || draft.password !== draft.confirmPassword) {
        setError('Password tidak memenuhi aturan.');
        return;
      }
    }

    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: draft.firstName.trim(),
          lastName: draft.lastName.trim(),
          username: draft.username.trim().toLowerCase(),
          email: draft.email.trim(),
          phone: draft.phone,
          address: draft.address.trim(),
          referralCode: draft.referralCode.trim(),
          avatarData: draft.avatar,
          password: draft.password || undefined,
        }),
      });
      const data = (await response.json().catch(() => null)) as Profile | { message?: string } | null;
      if (!response.ok || !data || !('email' in data)) {
        const message = data && 'message' in data ? data.message : '';
        setError(Array.isArray(message) ? String(message[0]) : message || 'Profil gagal disimpan.');
        return;
      }
      const next = toDraft(data);
      setDraft(next);
      setSaved(next);
      setEditing(false);
    } catch {
      setError('Profil gagal disimpan.');
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className={styles.head}>
        <div>
          <p className={styles.trail}>{trail}</p>
          <h1 className={styles.title}>Profile</h1>
        </div>
        {draft && !editing ? (
          <button type="button" className={styles.edit} aria-label="Edit profile" onClick={() => setEditing(true)}>
            <EditIcon />
          </button>
        ) : null}
      </div>
      {!draft ? <p className="text-sm text-mute">{error || 'Memuat profil...'}</p> : null}
      {draft ? (
        <form className={`${styles.card} ${form.form} ${editing ? '' : styles.locked}`} onSubmit={save}>
          <div className={form.avatarRow}>
            <div className={form.avatar} aria-hidden="true">
              {draft.avatar ? <img src={draft.avatar} alt="" /> : <span>{(draft.firstName.trim()[0] || 'B').toUpperCase()}</span>}
            </div>
            {editing ? (
              <label className={form.upload}>
                Profile picture
                <input
                  type="file"
                  accept="image/*"
                  className={form.file}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    void compressImage(file).then((data) => {
                      if (data) setDraft({ ...draft, avatar: data });
                    });
                  }}
                />
              </label>
            ) : (
              <span className="text-sm font-semibold text-ink">Profile picture</span>
            )}
          </div>
          <label className={form.field}>
            <span>
              First Name <i className={form.req}>*</i>
            </span>
            <input
              value={draft.firstName}
              readOnly={!editing}
              onChange={(event) => setDraft({ ...draft, firstName: event.target.value })}
              required
            />
          </label>
          <label className={form.field}>
            <span>Last Name</span>
            <input value={draft.lastName} readOnly={!editing} onChange={(event) => setDraft({ ...draft, lastName: event.target.value })} />
          </label>
          <label className={form.field}>
            <span>
              Username <i className={form.req}>*</i>
            </span>
            <span className={form.usernameBox}>
              <input
                value={draft.username}
                readOnly={!editing}
                onChange={(event) => setDraft({ ...draft, username: event.target.value })}
                className={editing && usernameStatus !== 'idle' ? form.usernameInput : undefined}
                required
              />
              {editing && usernameStatus === 'checking' ? <span className={form.spinner} aria-hidden="true" /> : null}
              {editing && usernameStatus === 'free' ? <OkIcon label="Username tersedia" /> : null}
              {editing && usernameStatus === 'taken' ? <BadIcon label="Username sudah dipakai" /> : null}
            </span>
          </label>
          {editing ? (
            <>
              <label className={form.field}>
                <span>Password</span>
                <input type="password" value={draft.password} onChange={(event) => setDraft({ ...draft, password: event.target.value })} />
                <span className={form.strengthRow} data-score={draft.password ? score : 0}>
                  <span className={form.meter} aria-hidden="true">
                    <span className={form.fill} />
                  </span>
                  {draft.password ? <small className={form.strength}>{strengthLabel(score)}</small> : null}
                </span>
                <ul className={form.rules}>
                  <li data-ok={passwordRules.length ? 'yes' : 'no'}>At least 8 characters</li>
                  <li data-ok={passwordRules.letters ? 'yes' : 'no'}>Uppercase and lowercase letters</li>
                  <li data-ok={passwordRules.number ? 'yes' : 'no'}>At least one number</li>
                </ul>
              </label>
              <label className={form.field}>
                <span>Confirmation password</span>
                <span className={form.usernameBox}>
                  <input
                    type="password"
                    value={draft.confirmPassword}
                    onChange={(event) => setDraft({ ...draft, confirmPassword: event.target.value })}
                    className={draft.confirmPassword ? form.usernameInput : undefined}
                  />
                  {draft.confirmPassword && draft.confirmPassword === draft.password ? <OkIcon label="Password sama" /> : null}
                  {draft.confirmPassword && draft.confirmPassword !== draft.password ? <BadIcon label="Password tidak sama" /> : null}
                </span>
              </label>
            </>
          ) : null}
          <label className={form.field}>
            <span>
              Phone Number <i className={form.req}>*</i>
            </span>
            <PhoneInput
              international
              defaultCountry="ID"
              flags={flags}
              value={draft.phone}
              disabled={!editing}
              onChange={(value) => editing && setDraft({ ...draft, phone: value })}
              className={form.phoneInput}
            />
          </label>
          <label className={form.field}>
            <span>
              Email <i className={form.req}>*</i>
            </span>
            <span className={form.usernameBox}>
              <input
                type="email"
                value={draft.email}
                readOnly={!editing}
                onChange={(event) => setDraft({ ...draft, email: event.target.value })}
                className={editing && draft.email.includes('@') ? form.usernameInput : undefined}
                required
              />
              {editing && EMAIL_PATTERN.test(draft.email.trim()) ? <OkIcon label="Email valid" /> : null}
              {editing && draft.email.includes('@') && !EMAIL_PATTERN.test(draft.email.trim()) ? <BadIcon label="Email tidak valid" /> : null}
            </span>
          </label>
          <label className={form.field}>
            <span>Address</span>
            <textarea
              value={draft.address}
              readOnly={!editing}
              onChange={(event) => setDraft({ ...draft, address: event.target.value })}
              rows={3}
            />
          </label>
          <label className={form.field}>
            <span>Referral Code</span>
            <input
              value={draft.referralCode}
              readOnly={!editing}
              onChange={(event) => setDraft({ ...draft, referralCode: event.target.value })}
            />
          </label>
          {error ? <p className={form.error}>{error}</p> : null}
          {editing ? (
            <div className={styles.actions}>
              <button type="button" className={styles.cancel} onClick={cancel}>
                Batal
              </button>
              <button type="submit" className={form.submit} disabled={pending}>
                Simpan
              </button>
            </div>
          ) : null}
        </form>
      ) : null}
    </>
  );
}
