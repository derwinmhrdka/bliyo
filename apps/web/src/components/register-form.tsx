'use client';

import { useEffect, useMemo, useState } from 'react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import 'react-phone-number-input/style.css';
import styles from '@/app/register/register.module.css';
import { PasswordField } from './password-field';
import { emptyPlace, RegionFields, type PlaceValue } from './region-fields';

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function OkIcon({ label }: { label: string }) {
  return (
    <svg className={styles.check} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-label={label}>
      <circle cx="12" cy="12" r="8.25" stroke="#1f8a4c" strokeWidth="1.75" />
      <path d="M8.2 12.2 11 15l4.8-6" stroke="#1f8a4c" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BadIcon({ label }: { label: string }) {
  return (
    <svg className={styles.check} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-label={label}>
      <circle cx="12" cy="12" r="8.25" stroke="#9f2d2d" strokeWidth="1.75" />
      <path d="M9 9l6 6M15 9l-6 6" stroke="#9f2d2d" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

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

export function RegisterForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState<string | undefined>();
  const [email, setEmail] = useState('');
  const [place, setPlace] = useState<PlaceValue>(emptyPlace);
  const [referralCode, setReferralCode] = useState('');
  const [avatar, setAvatar] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'free' | 'taken'>('idle');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const score = useMemo(() => passwordScore(password), [password]);
  const initial = (firstName.trim()[0] || 'B').toUpperCase();
  const rules = {
    length: password.length >= 8,
    letters: /[a-z]/.test(password) && /[A-Z]/.test(password),
    number: /\d/.test(password),
  };

  async function onAvatar(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Profile picture must be an image.');
      return;
    }
    const data = await compressImage(file);
    if (!data) {
      setError('Profile picture could not be compressed.');
      return;
    }
    setError('');
    setAvatar(data);
  }

  useEffect(() => {
    const normalized = username.trim().toLowerCase();
    if (!USERNAME_PATTERN.test(normalized)) {
      setUsernameStatus('idle');
      return;
    }

    const controller = new AbortController();
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setUsernameStatus('checking');
      fetch(`/api/auth/username-available?username=${encodeURIComponent(normalized)}`, {
        signal: controller.signal,
      })
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
  }, [username]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    const normalizedUsername = username.trim().toLowerCase();
    if (!firstName.trim() || !normalizedUsername || !password || !confirmPassword || !phone || !email.trim()) {
      setError('Complete the required fields.');
      return;
    }
    if (!USERNAME_PATTERN.test(normalizedUsername)) {
      setError('Username must be 3 to 20 letters, numbers, or underscores.');
      return;
    }
    if (usernameStatus === 'taken') {
      setError('Username is already used.');
      return;
    }
    if (!rules.length || !rules.letters || !rules.number) {
      setError('Password does not meet the rules.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Confirmation password does not match.');
      return;
    }
    if (!isValidPhoneNumber(phone)) {
      setError('Phone number is not valid.');
      return;
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError('Email is not valid.');
      return;
    }

    setPending(true);
    const response = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        username: normalizedUsername,
        password,
        confirmPassword,
        phone,
        email: email.trim(),
        provinceId: place.provinceId || undefined,
        provinceName: place.provinceName || undefined,
        regencyId: place.regencyId || undefined,
        regencyName: place.regencyName || undefined,
        districtId: place.districtId || undefined,
        districtName: place.districtName || undefined,
        address: place.address.trim() || undefined,
        referralCode: referralCode.trim() || undefined,
        avatarData: avatar || undefined,
      }),
    });
    const data = await response.json().catch(() => ({ message: 'Registration failed.' }));
    if (!response.ok) {
      setPending(false);
      setError(data.message || 'Registration failed.');
      return;
    }
    window.location.href = data.redirect || '/';
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.avatarRow}>
        <div className={styles.avatar} aria-hidden="true">
          {avatar ? <img src={avatar} alt="" /> : <span>{initial}</span>}
        </div>
        <label className={styles.upload}>
          Profile picture
          <input
            type="file"
            accept="image/*"
            className={styles.file}
            onChange={(event) => void onAvatar(event.target.files?.[0])}
          />
        </label>
      </div>

      <label className={styles.field}>
        <span>
          First Name <i className={styles.req}>*</i>
        </span>
        <input value={firstName} onChange={(event) => setFirstName(event.target.value)} autoComplete="given-name" required />
      </label>

      <label className={styles.field}>
        <span>Last Name</span>
        <input value={lastName} onChange={(event) => setLastName(event.target.value)} autoComplete="family-name" />
      </label>

      <label className={styles.field}>
        <span>
          Username <i className={styles.req}>*</i>
        </span>
        <span className={styles.usernameBox}>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            className={usernameStatus === 'idle' ? undefined : styles.usernameInput}
            required
          />
          {usernameStatus === 'checking' ? <span className={styles.spinner} aria-hidden="true" /> : null}
          {usernameStatus === 'free' ? <OkIcon label="Username tersedia" /> : null}
          {usernameStatus === 'taken' ? <BadIcon label="Username sudah dipakai" /> : null}
        </span>
      </label>

      <label className={styles.field}>
        <span>
          Password <i className={styles.req}>*</i>
        </span>
        <PasswordField value={password} onChange={setPassword} autoComplete="new-password" required />
        <span className={styles.strengthRow} data-score={password ? score : 0}>
          <span className={styles.meter} aria-hidden="true">
            <span className={styles.fill} />
          </span>
          {password ? <small className={styles.strength}>{strengthLabel(score)}</small> : null}
        </span>
        <ul className={styles.rules}>
          <li data-ok={rules.length ? 'yes' : 'no'}>At least 8 characters</li>
          <li data-ok={rules.letters ? 'yes' : 'no'}>Uppercase and lowercase letters</li>
          <li data-ok={rules.number ? 'yes' : 'no'}>At least one number</li>
        </ul>
      </label>

      <label className={styles.field}>
        <span>
          Confirmation password <i className={styles.req}>*</i>
        </span>
        <PasswordField value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" required>
          {confirmPassword && confirmPassword === password ? <OkIcon label="Password sama" /> : null}
          {confirmPassword && confirmPassword !== password ? <BadIcon label="Password tidak sama" /> : null}
        </PasswordField>
      </label>

      <label className={styles.field}>
        <span>
          Phone Number <i className={styles.req}>*</i>
        </span>
        <PhoneInput
          international
          defaultCountry="ID"
          flags={flags}
          value={phone}
          onChange={setPhone}
          className={styles.phoneInput}
          numberInputProps={{ required: true }}
        />
      </label>

      <label className={styles.field}>
        <span>
          Email <i className={styles.req}>*</i>
        </span>
        <span className={styles.usernameBox}>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            className={email.includes('@') ? styles.usernameInput : undefined}
            required
          />
          {EMAIL_PATTERN.test(email.trim()) ? <OkIcon label="Email valid" /> : null}
          {email.includes('@') && !EMAIL_PATTERN.test(email.trim()) ? <BadIcon label="Email tidak valid" /> : null}
        </span>
      </label>

      <RegionFields value={place} onChange={setPlace} />

      <label className={styles.field}>
        <span>Referral Code</span>
        <input value={referralCode} onChange={(event) => setReferralCode(event.target.value)} />
      </label>

      {error ? <p className={styles.error}>{error}</p> : null}
      <button type="submit" className={styles.submit} disabled={pending}>
        {pending ? 'Registering' : 'Register'}
      </button>
    </form>
  );
}
