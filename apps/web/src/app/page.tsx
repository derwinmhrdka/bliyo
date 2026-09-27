import { LinkForm } from '@/components/link-form';
import { SiteHeader } from '@/components/site-header';
import { homeCopy } from '@/lib/home-copy';
import { getLocale } from '@/lib/locale';
import { getSession } from '@/lib/session';
import styles from './home.module.css';

const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'halo@bliyo.id';
const supportWhatsapp = (process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || '6281234567890').replace(/\D/g, '');
const supportWhatsappLabel = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || '+62 812 3456 7890';

const social = {
  instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || 'https://www.instagram.com/',
  tiktok: process.env.NEXT_PUBLIC_SOCIAL_TIKTOK || 'https://www.tiktok.com/',
  youtube: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE || 'https://www.youtube.com/',
};

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M4.5 7.5 12 13l7.5-5.5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function WhatsappIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 4.5a7.2 7.2 0 0 0-6.2 10.9L5 19.5l4.2-.9A7.2 7.2 0 1 0 12 4.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M9.2 10.2c.2 1.5 1.6 3 3.1 3.4l1-.9c.2-.2.5-.2.7 0l1.1.8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="4.5" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="12" cy="12" r="3.4" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="16.6" cy="7.4" r="0.9" fill="currentColor" />
    </svg>
  );
}

function TiktokIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14 6.5c.6 2.2 2.1 3.6 4.2 3.9v2.4c-1.5 0-2.9-.5-4.2-1.4v5.2a4.6 4.6 0 1 1-4.6-4.6c.3 0 .6 0 .9.1v2.5a2.2 2.2 0 1 0 1.5 2.1V6.5H14Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="6.5" width="18" height="11" rx="3" stroke="currentColor" strokeWidth="1.75" />
      <path d="M11 9.8v4.4l3.6-2.2L11 9.8Z" fill="currentColor" />
    </svg>
  );
}

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getSession();
  const locale = await getLocale();
  const copy = homeCopy(locale);
  const dashboardHref = !session ? undefined : session.role === 'member' ? '/member' : '/admin';

  return (
    <div className={styles.page}>
      <img src="/home/bg-reward.jpg" alt="" className={styles.backdrop} />
      <SiteHeader
        name={session?.name}
        dashboardHref={dashboardHref}
        locale={locale}
        masuk={copy.masuk}
        register={copy.register}
        welcome={copy.welcome}
        dasbor={copy.dasbor}
        keluar={copy.keluar}
        langLabel={copy.langLabel}
      />
      <main className={styles.main}>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.lead}>
          {copy.leadBefore}
          <strong className="font-bold text-green-dark">Bliyo</strong>
          {copy.leadAfter}
        </p>
        <LinkForm
          locale={locale}
          placeholder={copy.placeholder}
          submit={copy.submit}
          pending={copy.pending}
          resultLabel={copy.resultLabel}
          copyLabel={copy.copy}
          copiedLabel={copy.copied}
        />
        <section className={styles.steps} aria-label={copy.stepsLabel}>
          <article className={styles.step}>
            <div className={styles.stepEmbed}>
              <img src="/home/step-marketing.jpg" alt="" className={styles.stepImage} />
              <p className={styles.stepText}>{copy.step1}</p>
            </div>
          </article>
          <article className={styles.step}>
            <div className={styles.stepEmbed}>
              <img src="/home/step-register.png" alt="" className={styles.stepImage} />
              <p className={styles.stepText}>
                {copy.step2Before}
                <strong className="font-extrabold text-green-dark">Bliyo</strong>
              </p>
            </div>
          </article>
          <article className={styles.step}>
            <div className={styles.stepEmbed}>
              <img src="/home/step-reward.jpg" alt="" className={styles.stepImage} />
              <p className={styles.stepText}>{copy.step3}</p>
            </div>
          </article>
        </section>
      </main>
      <footer className={styles.footer}>
        <svg className={styles.footerWave} viewBox="0 0 920 120" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M0 62 C 160 28, 320 96, 520 58 C 680 28, 800 78, 920 48 L920 120 L0 120 Z"
            fill="#155c33"
          />
        </svg>
        <svg
          className={`${styles.footerWave} ${styles.footerWaveFront}`}
          viewBox="0 0 920 120"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 86 C 180 62, 360 108, 560 80 C 720 58, 820 92, 920 74 L920 120 L0 120 Z"
            fill="#1a6b3f"
          />
        </svg>
        <div className={styles.footerInner}>
          <div>
            <p className={styles.footerTitle}>Customer Center</p>
            <p className={styles.footerNote}>{copy.footerNote}</p>
            <div className={styles.contacts}>
              <a className={styles.contact} href={`mailto:${supportEmail}`}>
                <MailIcon />
                <span>{supportEmail}</span>
              </a>
              <a
                className={styles.contact}
                href={`https://wa.me/${supportWhatsapp}`}
                target="_blank"
                rel="noreferrer"
              >
                <WhatsappIcon />
                <span>{supportWhatsappLabel}</span>
              </a>
            </div>
          </div>
          <nav className={styles.socials} aria-label={copy.socialLabel}>
            <a className={styles.social} href={social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
              <InstagramIcon />
            </a>
            <a className={styles.social} href={social.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok">
              <TiktokIcon />
            </a>
            <a className={styles.social} href={social.youtube} target="_blank" rel="noreferrer" aria-label="YouTube">
              <YoutubeIcon />
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
