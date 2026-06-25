import { useLocation } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'
import styles from './Header.module.css'

const PAGE_TITLES = {
  '/dashboard':    'Dashboard',
  '/medicamentos': 'Medicamentos',
  '/estoque':      'Estoque',
  '/prescricoes':  'Prescrições',
  '/relatorios':   'Relatórios',
  '/usuarios':     'Usuários',
}

export default function Header() {
  const { pathname } = useLocation()
  const title = PAGE_TITLES[pathname] ?? 'PharmaTrack'

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
    </header>
  )
}
