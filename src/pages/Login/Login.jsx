import { useState } from 'react'
import { Activity, Mail, Lock } from 'lucide-react'
import { login } from '../../services/authService'
import styles from './Login.module.css'

export default function Login() {
  const [email, setEmail]     = useState('')
  const [senha, setSenha]     = useState('')
  const [erro, setErro]       = useState('')
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

      <div className={styles.glowCorner} aria-hidden="true" />

      <div className={styles.card}>

        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <Activity size={18} strokeWidth={2.5} />
          </div>
          <div className={styles.brandTexts}>
            <span className={styles.brandName}>PharmaTrack</span>
            <span className={styles.brandSub}>Sistema Farmacêutico</span>
          </div>
        </div>

        {/* Heading */}
        <div className={styles.heading}>
          <h2>Bem-vindo de volta</h2>
          <p>Acesse sua conta para continuar</p>
        </div>

        <div className={styles.divider} />

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit}>

          <div className={styles.field}>
            <label htmlFor="email">E-mail</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>
                <Mail size={15} strokeWidth={2} />
              </span>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className={styles.field}>
            <div className={styles.fieldHeader}>
              <label htmlFor="senha">Senha</label>
              <button type="button" className={styles.forgot}>Esqueceu?</button>
            </div>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>
                <Lock size={15} strokeWidth={2} />
              </span>
              <input
                id="senha"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
              />
            </div>
          </div>

          {erro && <span className={styles.erro}>{erro}</span>}

          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

        </form>

        {/* Footer */}
        <div className={styles.cardFooter}>
          <span className={styles.cardFooterDot} aria-hidden="true" />
          <span className={styles.cardFooterText}>Conexão segura · PharmaTrack v2.0</span>
        </div>

      </div>
    </div>
  )
}