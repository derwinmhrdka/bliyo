import { TransactionList } from '@/components/transaction-list';
import styles from '../member.module.css';

export default function MemberTransactionPage() {
  return (
    <>
      <p className={styles.trail}>CMS Member / Transaction</p>
      <h1 className={styles.title}>Transaction</h1>
      <TransactionList mode="member" />
    </>
  );
}
