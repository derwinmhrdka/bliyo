import styles from './under-development.module.css';

export function UnderDevelopment({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className={styles.wrap}>
      <span className={styles.tag}>Under Development</span>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.text}>{description}</p>
    </div>
  );
}
