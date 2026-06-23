import { NavLink } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
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
  const canvasRef = useRef(null)
  const rafRef    = useRef(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  /* Anel de pulso animado no canvas — versão discreta */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let t = 0

    function resize() {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()

    function tick() {
      const { width: w, height: h } = canvas
      ctx.clearRect(0, 0, w, h)

      const cx = w / 2
      const cy = h * 0.16

      /* Anel único, sutil */
      const r1 = 22 + 5 * Math.sin(t * 0.035)
      const a1 = 0.025 + 0.015 * Math.sin(t * 0.035)
      ctx.beginPath()
      ctx.arc(cx, cy, r1, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(91,159,255,${a1})`
      ctx.lineWidth = 0.6
      ctx.stroke()

      t++
      rafRef.current = requestAnimationFrame(tick)
    }

    tick()
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const nome    = user?.user_metadata?.nome || user?.email?.split('@')[0] || 'Usuário'
  const cargo   = user?.user_metadata?.cargo || 'Farmacêutico'
  const inicial = nome[0].toUpperCase()

  return (
    <aside className={styles.sidebar}>

      {/* Glow de profundidade */}
      <div className={styles.glow} aria-hidden="true" />

      {/* Canvas do anel de pulso animado */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.brandIconWrap}>
          <Activity size={16} strokeWidth={2.5} />
        </div>
        <div className={styles.brandTexts}>
          <span className={styles.brandName}>PharmaTrack</span>
          <span className={styles.brandSub}>Sistema Farmacêutico</span>
        </div>
      </div>

      <div className={styles.divider} />

      {/* Nav */}
      <nav className={styles.nav}>
        <span className={styles.navSection}>Navegação</span>

        {NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.pip}      aria-hidden="true" />
            <span className={styles.iconWrap}>
              <Icon size={15} strokeWidth={2} />
            </span>
            <span className={styles.linkLabel}>{label}</span>
            <span className={styles.dot}      aria-hidden="true" />
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.divider} />
        <div className={styles.userBadge}>
          <div className={styles.avatar}>
            {inicial}
            <span className={styles.avatarOnline} aria-label="Online" />
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{nome}</span>
            <span className={styles.userRole}>{cargo}</span>
          </div>
          <button
            className={styles.logoutBtn}
            onClick={logout}
            title="Sair"
            aria-label="Sair"
          >
            <LogOut size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

    </aside>
  )
}