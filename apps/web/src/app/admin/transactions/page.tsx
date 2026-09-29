import { TransactionList } from '@/components/transaction-list';
import styles from '../admin.module.css';

export default function AdminTransactionsPage() {
  return (
    <>
      <p className={styles.trail}>CMS Admin / Transactions</p>
      <h1 className={styles.title}>Transactions</h1>
      <TransactionList mode="admin" />
    </>
  );
}
