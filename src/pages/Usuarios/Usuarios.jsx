// src/pages/Usuarios/Usuarios.jsx
// Lista usuários da empresa via tabela profiles (RLS filtra automaticamente)

import { useEffect, useState } from 'react'
import { Plus, UserCheck, UserX } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../hooks/useAuth'
import styles from './Usuarios.module.css'

export default function Usuarios() {
  const { profile, isAdmin, inviteUser } = useAuth()
  const [lista, setLista]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro]         = useState('')
  const [form, setForm]         = useState({
    nome: '', email: '', password: '', role: 'usuario',
  })

  async function carregar() {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nome, email, role, cargo, status, created_at')
      .order('created_at', { ascending: false })

    if (!error) setLista(data)
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErro('')
  }

  async function handleConvidar() {
    if (!form.nome.trim())            return setErro('Informe o nome.')
    if (!form.email.trim())           return setErro('Informe o email.')
    if (form.password.length < 6)     return setErro('Senha mínima: 6 caracteres.')

    setSalvando(true)
    const result = await inviteUser({
      nome:     form.nome,
      email:    form.email,
      password: form.password,
      role:     form.role,
    })
    setSalvando(false)

    if (result.success) {
      setModal(false)
      setForm({ nome: '', email: '', password: '', role: 'usuario' })
      await carregar()
    } else {
      setErro(result.error || 'Erro ao convidar usuário.')
    }
  }

  async function toggleStatus(usuario) {
    const novoStatus = usuario.status === 'ativo' ? 'inativo' : 'ativo'
    await supabase
      .from('profiles')
      .update({ status: novoStatus })
      .eq('id', usuario.id)
    await carregar()
  }

  const roleLabel = {
    superadmin:   'Super Admin',
    admin:        'Administrador',
    farmaceutico: 'Farmacêutico',
    usuario:      'Usuário',
  }

  if (loading) return <div className={styles.empty}>Carregando...</div>

  return (
    <div className={styles.page}>

      {/* Header com botão de convidar (só admin vê) */}
      {isAdmin && (
        <div className={styles.toolbar}>
          <button className={styles.btnConvidar} onClick={() => setModal(true)}>
            <Plus size={15} />
            Convidar Usuário
          </button>
        </div>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Status</th>
              {isAdmin && <th></th>}
            </tr>
          </thead>
          <tbody>
            {lista.map(u => (
              <tr key={u.id}>
                <td>
                  <div className={styles.userCell}>
                    <div className={styles.avatar}>
                      {(u.nome || u.email || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <span className={styles.userName}>{u.nome || '—'}</span>
                      {u.id === profile?.id && (
                        <span className={styles.voce}> (você)</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className={styles.muted}>{u.email}</td>
                <td>
                  <span className={`${styles.roleBadge} ${styles[u.role]}`}>
                    {roleLabel[u.role] || u.role}
                  </span>
                </td>
                <td>
                  <span className={`${styles.status} ${u.status === 'ativo' ? styles.ativo : styles.inativo}`}>
                    {u.status}
                  </span>
                </td>
                {isAdmin && (
                  <td>
                    {u.id !== profile?.id && (
                      <button
                        className={styles.toggleBtn}
                        onClick={() => toggleStatus(u)}
                        title={u.status === 'ativo' ? 'Desativar' : 'Ativar'}
                      >
                        {u.status === 'ativo'
                          ? <UserX size={15} />
                          : <UserCheck size={15} />
                        }
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {lista.length === 0 && (
          <div className={styles.empty}>Nenhum usuário encontrado.</div>
        )}
      </div>

      {/* Modal convidar */}
      {modal && (
        <div className={styles.overlay} onClick={() => setModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Convidar Usuário</h2>

            <div className={styles.field}>
              <label>Nome completo</label>
              <input name="nome" value={form.nome} onChange={handleChange} placeholder="Maria Silva" autoFocus />
            </div>
            <div className={styles.field}>
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="maria@farmacia.com" />
            </div>
            <div className={styles.field}>
              <label>Senha provisória</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Mín. 6 caracteres" />
            </div>
            <div className={styles.field}>
              <label>Perfil</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="usuario">Usuário</option>
                <option value="farmaceutico">Farmacêutico</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            {erro && <p className={styles.erro}>{erro}</p>}

            <div className={styles.modalActions}>
              <button className={styles.btnCancelar} onClick={() => setModal(false)}>
                Cancelar
              </button>
              <button className={styles.btnSalvar} onClick={handleConvidar} disabled={salvando}>
                {salvando ? 'Salvando...' : 'Convidar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}