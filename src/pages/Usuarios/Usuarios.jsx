import { Users } from 'lucide-react'
import styles from './Usuarios.module.css'

const USUARIOS = [
  { id: 1, nome: 'Admin Geral',  email: 'admin@pharmatrack.com',  cargo: 'Administrador',  status: 'ativo' },
  { id: 2, nome: 'Carla Moura',  email: 'carla@pharmatrack.com',  cargo: 'Farmacêutica',   status: 'ativo' },
  { id: 3, nome: 'João Pinto',   email: 'joao@pharmatrack.com',   cargo: 'Operador',        status: 'ativo' },
  { id: 4, nome: 'Paula Ramos',  email: 'paula@pharmatrack.com',  cargo: 'Farmacêutica',   status: 'inativo' },
]

export default function Usuarios() {
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
            {USUARIOS.map(u => (
              <tr key={u.id}>
                <td>
                  <div className={styles.userCell}>
                    <div className={styles.avatar}>{u.nome[0]}</div>
                    <span>{u.nome}</span>
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
      </div>

      <div className={styles.comingSoon}>
        <Users size={28} />
        <p>Perfis de acesso e gestão avançada de usuários em breve.</p>
      </div>
    </div>
  )
}
