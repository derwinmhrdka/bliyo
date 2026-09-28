import type { Locale } from './locale-shared';

export function homeCopy(locale: Locale) {
  if (locale === 'en') {
    return {
      masuk: 'Sign in',
      welcome: 'Welcome',
      dasbor: 'Dashboard',
      keluar: 'Log out',
      title: 'Register Your Link',
      leadBefore: 'Paste a product link, get a ',
      leadAfter: ' affiliate link, and start earning commission.',
      stepsLabel: 'How to use Bliyo',
      step1: 'Share a product link you want to buy',
      step2Before: 'Register your link on ',
      step3: 'Collect and claim your reward!',
      placeholder: 'Paste a product link here',
      submit: 'Register Link',
      pending: 'Processing',
      resultLabel: 'Affiliate link',
      copy: 'Copy',
      copied: 'Copied',
      footerNote: 'Need help with links and commission.',
      socialLabel: 'Social media',
      langLabel: 'Language',
      emptyLink: 'Enter a product link.',
      unavailable: 'The service is unavailable.',
      failed: 'Could not register the link.',
    };
  }

  return {
    masuk: 'Masuk',
    welcome: 'Selamat Datang',
    dasbor: 'Dashboard',
    keluar: 'Keluar',
    title: 'Ayo kumpulkan rewardmu!',
    leadBefore: 'Masukkan link produk, daftarkan link di ',
    leadAfter: ' dan mulai kumpulkan rewardnya.',
    stepsLabel: 'Cara pakai Bliyo',
    step1: 'Share link produk yang ingin kamu beli',
    step2Before: 'Daftarkan linkmu di ',
    step3: 'Kumpulkan dan klaim rewardmu!',
    placeholder: 'Tempel link produk di sini',
    submit: 'Daftarkan Link',
    pending: 'Memproses',
    resultLabel: 'Link affiliate',
    copy: 'Salin',
    copied: 'Tersalin',
    footerNote: 'Butuh bantuan seputar link dan komisi.',
    socialLabel: 'Media sosial',
    langLabel: 'Bahasa',
    emptyLink: 'Masukkan link produk.',
    unavailable: 'Layanan sedang tidak tersedia.',
    failed: 'Link gagal didaftarkan.',
  };
}
