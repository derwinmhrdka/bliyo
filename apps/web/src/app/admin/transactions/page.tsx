import { UnderDevelopment } from '@/components/under-development';
import styles from '../admin.module.css';

export default function AdminTransactionsPage() {
  return (
    <>
      <p className={styles.trail}>CMS Admin / Transactions</p>
      <UnderDevelopment
        title="Transactions"
        description="Daftar transaksi seluruh user akan tampil di sini."
      />
    </>
  );
}
