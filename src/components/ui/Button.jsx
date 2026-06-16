import styles from './Button.module.css'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  onClick,
  icon: Icon,
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${styles.btn} ${styles[variant]} ${styles[size]}`}
    >
      {Icon && <Icon size={15} className={styles.icon} />}
      {children}
    </button>
  )
}
