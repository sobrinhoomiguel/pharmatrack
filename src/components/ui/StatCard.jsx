import styles from './StatCard.module.css'

export default function StatCard({ label, value, icon: Icon, color = 'accent', trend }) {
  return (
    <div className={`${styles.card} ${styles[color]}`}>
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        {Icon && (
          <div className={styles.iconWrap}>
            <Icon size={16} />
          </div>
        )}
      </div>
      <div className={styles.value}>{value}</div>
      {trend && <div className={styles.trend}>{trend}</div>}
    </div>
  )
}
