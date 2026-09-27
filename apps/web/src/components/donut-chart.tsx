import styles from './donut-chart.module.css';

type Slice = { label: string; value: number };

const COLORS = ['#1a6b3f', '#1f8a4c', '#0e3d23'];

export function DonutChart({ title, slices }: { title: string; slices: Slice[] }) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const radius = 15.9;
  const circumference = 2 * Math.PI * radius;
  let consumed = 0;
  const segments = slices.flatMap((slice, index) => {
    if (total <= 0 || slice.value <= 0) return [];
    const length = (slice.value / total) * circumference;
    const segment = {
      ...slice,
      length,
      offset: consumed,
      color: COLORS[index % COLORS.length],
    };
    consumed += length;
    return [segment];
  });

  return (
    <section className={styles.card}>
      <h2 className={styles.title}>{title}</h2>
      <svg width="140" height="140" viewBox="0 0 42 42" role="img" aria-label={title}>
        <circle cx="21" cy="21" r={radius} fill="transparent" stroke="#e7f3ec" strokeWidth="6" />
        {segments.map((segment) => (
          <circle
            key={segment.label}
            cx="21"
            cy="21"
            r={radius}
            fill="transparent"
            stroke={segment.color}
            strokeWidth="6"
            strokeDasharray={`${segment.length} ${circumference - segment.length}`}
            strokeDashoffset={-segment.offset}
            transform="rotate(-90 21 21)"
          />
        ))}
      </svg>
      <div className={styles.legend}>
        {total <= 0 ? (
          <span>Belum ada data</span>
        ) : (
          slices.map((slice, index) =>
            slice.value <= 0 ? null : (
              <span key={slice.label}>
                <span
                  className={styles.dot}
                  style={{ background: COLORS[index % COLORS.length] }}
                />
                {slice.label} {Math.round((slice.value / total) * 100)}%
              </span>
            ),
          )
        )}
      </div>
    </section>
  );
}
