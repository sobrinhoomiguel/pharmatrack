import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Pill, Package,
  ClipboardList, BarChart3, Users, Activity, LogOut,
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { logout } from '../../services/authService'
import styles from './Sidebar.module.css'

const NAV = [
  { to: '/',             label: 'Dashboard',   Icon: LayoutDashboard },
  { to: '/medicamentos', label: 'Medicamentos', Icon: Pill },
  { to: '/estoque',      label: 'Estoque',      Icon: Package },
  { to: '/prescricoes',  label: 'Prescrições',  Icon: ClipboardList },
  { to: '/relatorios',   label: 'Relatórios',   Icon: BarChart3 },
  { to: '/usuarios',     label: 'Usuários',     Icon: Users },
]

export default function Sidebar() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  const nome  = user?.user_metadata?.nome || user?.email?.split('@')[0] || 'Usuário'
  const cargo = user?.user_metadata?.cargo || 'Farmacêutico'
  const inicial = nome[0].toUpperCase()

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
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            <Icon size={17} className={styles.icon} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userBadge}>
          <div className={styles.avatar}>{inicial}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{nome}</span>
            <span className={styles.userRole}>{cargo}</span>
          </div>
          <button className={styles.logoutBtn} onClick={logout} title="Sair">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}