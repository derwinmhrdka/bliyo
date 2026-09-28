import { MyLinkList } from '@/components/my-link-list';
import styles from '../member.module.css';
import local from './my-link.module.css';

export default function MyLinkPage() {
  return (
    <>
      <p className={styles.trail}>CMS Member / My Link</p>
      <h1 className={local.title}>My Link</h1>
      <MyLinkList />
    </>
  );
}
