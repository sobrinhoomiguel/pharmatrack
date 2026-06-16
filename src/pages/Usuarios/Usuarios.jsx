import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import { supabase } from '../../services/supabase'
import styles from './Usuarios.module.css'

export default function Usuarios() {
  const [lista, setLista]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      const { data, error } = await supabase.auth.admin.listUsers()
      if (error) {
        // fallback: mostra só o usuário logado
        const { data: { user } } = await supabase.auth.getUser()
        setLista(user ? [{ id: user.id, email: user.email, nome: user.user_metadata?.nome || user.email, cargo: user.user_metadata?.cargo || 'Administrador', status: 'ativo' }] : [])
      } else {
        setLista(data.users.map(u => ({
          id: u.id,
          email: u.email,
          nome: u.user_metadata?.nome || u.email,
          cargo: u.user_metadata?.cargo || 'Usuário',
          status: u.banned_until ? 'inativo' : 'ativo',
        })))
      }
      setLoading(false)
    })
  }, [])

  if (loading) return <div className={styles.empty}>Carregando...</div>

  return (
    <div className={styles.page}>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Cargo</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {lista.map(u => (
              <tr key={u.id}>
                <td>
                  <div className={styles.userCell}>
                    <div className={styles.avatar}>{(u.nome || u.email)[0].toUpperCase()}</div>
                    <span>{u.nome || u.email}</span>
                  </div>
                </td>
                <td className={styles.muted}>{u.email}</td>
                <td>{u.cargo}</td>
                <td>
                  <span className={`${styles.status} ${u.status === 'ativo' ? styles.ativo : styles.inativo}`}>
                    {u.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {lista.length === 0 && (
          <div className={styles.empty}>Nenhum usuário encontrado.</div>
        )}
      </div>
    </div>
  )
}