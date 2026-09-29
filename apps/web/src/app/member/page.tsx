import { redirect } from 'next/navigation';
import { DonutChart } from '@/components/donut-chart';
import { apiFetch } from '@/lib/api';
import { formatRupiah } from '@/lib/format';
import styles from './member.module.css';

export const dynamic = 'force-dynamic';

type DashboardData = {
  linkCount: number;
  commissionThisMonth: number;
  commissionByMerchant: { label: string; value: number }[];
  payoutStatus: { label: string; value: number }[];
};

export default async function MemberDashboardPage() {
  let data: DashboardData | null = null;
  let failed = false;

  try {
    const response = await apiFetch('/api/commissions/mine');
    if (response.status === 401) {
      redirect('/auth/expired');
    }
    if (!response.ok) {
      failed = true;
    } else {
      data = (await response.json()) as DashboardData;
    }
  } catch (error) {
    if (typeof error === 'object' && error && 'digest' in error) {
      throw error;
    }
    failed = true;
  }

  return (
    <>
      <p className={styles.trail}>CMS Member / Dashboard</p>
      <h1 className={styles.title}>Dashboard</h1>
      {failed || !data ? (
        <p className={styles.muted}>Data dashboard belum bisa dimuat.</p>
      ) : (
        <>
          <div className={styles.stats}>
            <Stat label="Link Saya" value={String(data.linkCount)} />
            <Stat label="Komisi Bulan Ini" value={formatRupiah(data.commissionThisMonth)} />
          </div>
          <div className={styles.charts}>
            <DonutChart title="Komisi per Merchant" slices={data.commissionByMerchant} />
            <DonutChart title="Status Payout" slices={data.payoutStatus} />
          </div>
        </>
      )}
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <article className={styles.stat}>
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue}>{value}</p>
    </article>
  );
}
