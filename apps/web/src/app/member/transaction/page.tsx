import { UnderDevelopment } from '@/components/under-development';
import styles from '../member.module.css';

export default function MemberTransactionPage() {
  return (
    <>
      <p className={styles.trail}>CMS Member / Transaction</p>
      <UnderDevelopment
        title="Transaction"
        description="Riwayat transaksi milik user akan tampil di sini."
      />
    </>
  );
}
