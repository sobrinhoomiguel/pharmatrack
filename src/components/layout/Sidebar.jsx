import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Pill,
  Package,
  ClipboardList,
  BarChart3,
  Users,
  Activity,
} from 'lucide-react'
import styles from './Sidebar.module.css'

const NAV = [
  { to: '/dashboard',   label: 'Dashboard',    Icon: LayoutDashboard },
  { to: '/medicamentos',label: 'Medicamentos',  Icon: Pill },
  { to: '/estoque',     label: 'Estoque',       Icon: Package },
  { to: '/prescricoes', label: 'Prescrições',   Icon: ClipboardList },
  { to: '/relatorios',  label: 'Relatórios',    Icon: BarChart3 },
  { to: '/usuarios',    label: 'Usuários',      Icon: Users },
]

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <Activity size={20} className={styles.brandIcon} />
        <span className={styles.brandName}>PharmaTrack</span>
      </div>

      <nav className={styles.nav}>
        {NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ''}`
            }
          >
            <Icon size={17} className={styles.icon} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userBadge}>
          <div className={styles.avatar}>A</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Admin</span>
            <span className={styles.userRole}>Farmacêutico</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
