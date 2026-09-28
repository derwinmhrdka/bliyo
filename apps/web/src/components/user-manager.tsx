'use client';

import { useEffect, useMemo, useState } from 'react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import 'react-phone-number-input/style.css';
import form from '@/app/register/register.module.css';
import styles from '@/app/admin/user/user.module.css';
import { PasswordField } from './password-field';
import { RegionFields, type PlaceValue } from './region-fields';

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Role = 'superadmin' | 'admin' | 'member';

type ManagedUser = {
  id: string;
  email: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  phone: string | null;
  provinceId: string | null;
  provinceName: string | null;
  regencyId: string | null;
  regencyName: string | null;
  districtId: string | null;
  districtName: string | null;
  address: string | null;
  avatarData: string | null;
  referralCode: string | null;
  role: Role;
  isActive: boolean;
};

type Draft = {
  firstName: string;
  lastName: string;
  username: string;
  savedUsername: string;
  email: string;
  phone?: string;
  place: PlaceValue;
  referralCode: string;
  avatar: string;
  password: string;
  confirmPassword: string;
  role: 'member' | 'admin';
  isActive: boolean;
};

const emptyDraft: Draft = {
  firstName: '',
  lastName: '',
  username: '',
  savedUsername: '',
  email: '',
  phone: undefined,
  place: {
    provinceId: '',
    provinceName: '',
    regencyId: '',
    regencyName: '',
    districtId: '',
    districtName: '',
    address: '',
  },
  referralCode: '',
  avatar: '',
  password: '',
  confirmPassword: '',
  role: 'member',
  isActive: true,
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

function displayName(user: ManagedUser) {
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.name;
}

function canEdit(selfRole: Role, selfId: string, user: ManagedUser) {
  if (user.role === 'superadmin' && user.id !== selfId) return false;
  if (selfRole !== 'superadmin' && user.role === 'admin' && user.id !== selfId) return false;
  return true;
}

function canChangeStatus(selfRole: Role, selfId: string, user: ManagedUser) {
  if (user.id === selfId || user.role === 'superadmin') return false;
  if (selfRole !== 'superadmin' && user.role === 'admin') return false;
  return true;
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20h4l10.2-10.2a1.6 1.6 0 0 0 0-2.3L16.5 5.8a1.6 1.6 0 0 0-2.3 0L4 16v4Z" stroke="currentColor" strokeWidth="1.75" />
      <path d="M13.2 7.2 16.8 10.8" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.75" />
      <path d="M10 9v6M14 9v6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.75" />
      <path d="M10.5 9.2v5.6L15 12l-4.5-2.8Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 7h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M9 7V5.5h6V7" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8 7l.7 12h6.6L16 7" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

export function UserManager({ selfId, selfRole }: { selfId: string; selfRole: Role }) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'free' | 'taken'>('idle');
  const score = useMemo(() => passwordScore(draft?.password ?? ''), [draft?.password]);
  const passwordRules = {
    length: (draft?.password.length ?? 0) >= 8,
    letters: /[a-z]/.test(draft?.password ?? '') && /[A-Z]/.test(draft?.password ?? ''),
    number: /\d/.test(draft?.password ?? ''),
  };
  const [pending, setPending] = useState(false);
  const [confirm, setConfirm] = useState<{ id: string; kind: 'delete' | 'active'; nextActive?: boolean } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      const search = query.trim();
      fetch(`/api/users${search ? `?q=${encodeURIComponent(search)}` : ''}`, { signal: controller.signal })
        .then(async (response) => {
          const data = await response.json().catch(() => null);
          if (!response.ok) throw new Error(data?.message || 'User gagal dimuat.');
          setUsers(data);
          setError('');
        })
        .catch((reason: unknown) => {
          if (reason instanceof DOMException && reason.name === 'AbortError') return;
          setError('User gagal dimuat.');
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, pending]);

  useEffect(() => {
    const username = draft?.username ?? '';
    const saved = draft?.savedUsername ?? '';
    const normalized = username.trim().toLowerCase();
    if (!draft) return;
    if (normalized && normalized === saved) {
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
        .then((data) => {
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
  }, [draft]);

  function openAdd() {
    setEditingId(null);
    setDraft({ ...emptyDraft });
    setError('');
  }

  function openEdit(user: ManagedUser) {
    setEditingId(user.id);
    setDraft({
      firstName: user.firstName || user.name,
      lastName: user.lastName || '',
      username: user.username || '',
      savedUsername: (user.username || '').toLowerCase(),
      email: user.email,
      phone: user.phone || undefined,
      place: {
        provinceId: user.provinceId || '',
        provinceName: user.provinceName || '',
        regencyId: user.regencyId || '',
        regencyName: user.regencyName || '',
        districtId: user.districtId || '',
        districtName: user.districtName || '',
        address: user.address || '',
      },
      referralCode: user.referralCode || '',
      avatar: user.avatarData || '',
      password: '',
      confirmPassword: '',
      role: user.role === 'admin' ? 'admin' : 'member',
      isActive: user.isActive,
    });
    setError('');
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!draft) return;
    setPending(true);
    setError('');
    const normalizedUsername = draft.username.trim().toLowerCase();
    const rulesOk = draft.password.length >= 8 && /[a-z]/.test(draft.password) && /[A-Z]/.test(draft.password) && /\d/.test(draft.password);
    if (!draft.firstName.trim() || !normalizedUsername || !draft.phone || !draft.email.trim()) {
      setPending(false);
      setError('Complete the required fields.');
      return;
    }
    if (!editingId && !rulesOk) {
      setPending(false);
      setError('Password does not meet the rules.');
      return;
    }
    if (draft.password && !rulesOk) {
      setPending(false);
      setError('Password does not meet the rules.');
      return;
    }
    if ((draft.password || !editingId) && draft.password !== draft.confirmPassword) {
      setPending(false);
      setError('Confirmation password does not match.');
      return;
    }
    if (!isValidPhoneNumber(draft.phone) || !EMAIL_PATTERN.test(draft.email.trim()) || usernameStatus === 'taken') {
      setPending(false);
      setError('Periksa username, email, dan nomor telepon.');
      return;
    }
    const body = {
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      username: normalizedUsername,
      email: draft.email.trim(),
      phone: draft.phone,
      provinceId: draft.place.provinceId,
      provinceName: draft.place.provinceName,
      regencyId: draft.place.regencyId,
      regencyName: draft.place.regencyName,
      districtId: draft.place.districtId,
      districtName: draft.place.districtName,
      address: draft.place.address.trim(),
      referralCode: draft.referralCode.trim(),
      avatarData: draft.avatar || '',
      isActive: editingId ? draft.isActive : undefined,
      role: selfRole === 'superadmin' && editingId !== selfId ? draft.role : undefined,
      password: draft.password || undefined,
    };
    const response = await fetch(editingId ? `/api/users/${editingId}` : '/api/users', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({ message: 'User gagal disimpan.' }));
    setPending(false);
    if (!response.ok) {
      setError(Array.isArray(data.message) ? data.message[0] : data.message || 'User gagal disimpan.');
      return;
    }
    setDraft(null);
    setEditingId(null);
  }

  async function applyConfirm() {
    if (!confirm) return;
    setPending(true);
    const response =
      confirm.kind === 'delete'
        ? await fetch(`/api/users/${confirm.id}`, { method: 'DELETE' })
        : await fetch(`/api/users/${confirm.id}/active`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: confirm.nextActive }),
          });
    const data = await response.json().catch(() => ({ message: 'Aksi gagal.' }));
    setPending(false);
    if (!response.ok) {
      setError(Array.isArray(data.message) ? data.message[0] : data.message || 'Aksi gagal.');
      setConfirm(null);
      return;
    }
    setConfirm(null);
  }

  return (
    <section className={styles.page}>
      <div className={styles.toolbar}>
        <input
          className={styles.search}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari nama, username, atau email"
        />
        <button type="button" className={styles.add} onClick={openAdd}>
          Tambah
        </button>
      </div>

      {error && !draft ? <p className={styles.error}>{error}</p> : null}
      {loading ? <p className={styles.muted}>Memuat user...</p> : null}
      {!loading && users.length === 0 ? <p className={styles.muted}>User tidak ditemukan.</p> : null}

      <ul className={styles.list}>
        {users.map((user) => {
          const name = displayName(user);
          const initial = (user.firstName || user.name).trim().charAt(0).toUpperCase() || 'B';
          return (
            <li key={user.id} className={`${styles.row} ${user.isActive ? '' : styles.rowOff}`}>
              <div className={styles.person}>
                <span className={styles.avatar}>
                  {user.avatarData ? <img src={user.avatarData} alt="" /> : initial}
                </span>
                <span>
                  <span className={styles.nameLine}>
                    <span className={styles.name}>{name}</span>
                    {user.role === 'admin' || user.role === 'superadmin' ? <span className={styles.tag}>Admin</span> : null}
                    {!user.isActive ? <span className={styles.tag}>Nonaktif</span> : null}
                  </span>
                  <span className={styles.meta}>{user.email}</span>
                </span>
              </div>
              <span className={styles.actions}>
                {canEdit(selfRole, selfId, user) ? (
                  <button type="button" className={styles.iconButton} aria-label="Ubah" onClick={() => openEdit(user)}>
                    <EditIcon />
                  </button>
                ) : null}
                {canChangeStatus(selfRole, selfId, user) ? (
                  <button
                    type="button"
                    className={styles.iconButton}
                    aria-label={user.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    onClick={() => setConfirm({ id: user.id, kind: 'active', nextActive: !user.isActive })}
                  >
                    {user.isActive ? <PauseIcon /> : <PlayIcon />}
                  </button>
                ) : null}
                {canChangeStatus(selfRole, selfId, user) ? (
                  <button
                    type="button"
                    className={styles.iconButton}
                    aria-label="Hapus"
                    onClick={() => setConfirm({ id: user.id, kind: 'delete' })}
                  >
                    <TrashIcon />
                  </button>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>

      {draft ? (
          <form className={`${styles.panel} ${form.form}`} onSubmit={save}>
            <h2>{editingId ? 'Ubah user' : 'Tambah user'}</h2>
            <div className={form.avatarRow}>
              <div className={form.avatar} aria-hidden="true">
                {draft.avatar ? <img src={draft.avatar} alt="" /> : <span>{(draft.firstName.trim()[0] || 'B').toUpperCase()}</span>}
              </div>
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
            </div>
            <label className={form.field}>
              <span>
                First Name <i className={form.req}>*</i>
              </span>
              <input value={draft.firstName} onChange={(event) => setDraft({ ...draft, firstName: event.target.value })} required />
            </label>
            <label className={form.field}>
              <span>Last Name</span>
              <input value={draft.lastName} onChange={(event) => setDraft({ ...draft, lastName: event.target.value })} />
            </label>
            <label className={form.field}>
              <span>
                Username <i className={form.req}>*</i>
              </span>
              <span className={form.usernameBox}>
                <input
                  value={draft.username}
                  onChange={(event) => setDraft({ ...draft, username: event.target.value })}
                  className={usernameStatus === 'idle' ? undefined : form.usernameInput}
                  required
                />
                {usernameStatus === 'checking' ? <span className={form.spinner} aria-hidden="true" /> : null}
                {usernameStatus === 'free' ? <OkIcon label="Username tersedia" /> : null}
                {usernameStatus === 'taken' ? <BadIcon label="Username sudah dipakai" /> : null}
              </span>
            </label>
            <label className={form.field}>
              <span>
                Password {editingId ? null : <i className={form.req}>*</i>}
              </span>
              <PasswordField
                value={draft.password}
                onChange={(value) => setDraft({ ...draft, password: value })}
                required={!editingId}
                autoComplete="new-password"
              />
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
              <span>
                Confirmation password {editingId ? null : <i className={form.req}>*</i>}
              </span>
              <PasswordField
                value={draft.confirmPassword}
                onChange={(value) => setDraft({ ...draft, confirmPassword: value })}
                required={!editingId}
                autoComplete="new-password"
              >
                {draft.confirmPassword && draft.confirmPassword === draft.password ? <OkIcon label="Password sama" /> : null}
                {draft.confirmPassword && draft.confirmPassword !== draft.password ? <BadIcon label="Password tidak sama" /> : null}
              </PasswordField>
            </label>
            <label className={form.field}>
              <span>
                Phone Number <i className={form.req}>*</i>
              </span>
              <PhoneInput
                international
                defaultCountry="ID"
                flags={flags}
                value={draft.phone}
                onChange={(value) => setDraft({ ...draft, phone: value })}
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
                  onChange={(event) => setDraft({ ...draft, email: event.target.value })}
                  className={draft.email.includes('@') ? form.usernameInput : undefined}
                  required
                />
                {EMAIL_PATTERN.test(draft.email.trim()) ? <OkIcon label="Email valid" /> : null}
                {draft.email.includes('@') && !EMAIL_PATTERN.test(draft.email.trim()) ? <BadIcon label="Email tidak valid" /> : null}
              </span>
            </label>
            <RegionFields value={draft.place} onChange={(place) => setDraft({ ...draft, place })} />
            <label className={form.field}>
              <span>Referral Code</span>
              <input value={draft.referralCode} onChange={(event) => setDraft({ ...draft, referralCode: event.target.value })} />
            </label>
            {editingId && editingId !== selfId ? (
              <label className={styles.activeRow}>
                <input
                  type="checkbox"
                  checked={draft.isActive}
                  onChange={(event) => setDraft({ ...draft, isActive: event.target.checked })}
                />
                Active
              </label>
            ) : null}
            {selfRole === 'superadmin' && editingId !== selfId ? (
              <label className={form.field}>
                <span>Role</span>
                <select value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value as Draft['role'] })}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            ) : null}
            {error ? <p className={form.error}>{error}</p> : null}
            <div className={styles.dialogActions}>
              <button type="button" className={styles.cancel} onClick={() => setDraft(null)}>
                Batal
              </button>
              <button type="submit" className={form.submit} disabled={pending}>
                Simpan
              </button>
            </div>
          </form>
      ) : null}

      {confirm ? (
        <div className={styles.overlay}>
          <div className={styles.dialog}>
            <h2>{confirm.kind === 'delete' ? 'Hapus user ini?' : confirm.nextActive ? 'Aktifkan user ini?' : 'Nonaktifkan user ini?'}</h2>
            <div className={styles.dialogActions}>
              <button type="button" className={styles.cancel} onClick={() => setConfirm(null)}>
                Batal
              </button>
              <button type="button" className={styles.add} disabled={pending} onClick={() => void applyConfirm()}>
                Ya
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
