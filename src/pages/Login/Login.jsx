import { useState } from 'react'
import { login } from '../../services/authService'
import styles from './Login.module.css'

export default function Login() {
  const [email, setEmail]   = useState('')
  const [senha, setSenha]   = useState('')
  const [erro, setErro]     = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      await login(email, senha)
    } catch {
      setErro('E-mail ou senha inválidos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>⚕</div>
          <h1 className={styles.brandName}>PharmaTrack</h1>
        </div>
        <p className={styles.sub}>Acesse sua conta</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className={styles.field}>
            <label>Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              required
            />
          </div>
          {erro && <span className={styles.erro}>{erro}</span>}
          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}