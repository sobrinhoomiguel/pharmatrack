import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, Mail, Lock } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import styles from './Login.module.css'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail]     = useState('')
  const [senha, setSenha]     = useState('')
  const [erro, setErro]       = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    const result = await login(email, senha)

    setLoading(false)

    if (result.success) {
      navigate('/', { replace: true })
    } else {
      setErro(result.error || 'E-mail ou senha inválidos.')
    }
  }

  return (
    <div className={styles.page}>

      <div className={styles.glowCorner} aria-hidden="true" />

      <div className={styles.card}>

        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <Activity size={18} strokeWidth={2.5} />
          </div>
          <div className={styles.brandTexts}>
            <span className={styles.brandName}>PharmaTrack</span>
            <span className={styles.brandSub}>Sistema Farmacêutico</span>
          </div>
        </div>

        <div className={styles.heading}>
          <h2>Bem-vindo de volta</h2>
          <p>Acesse sua conta para continuar</p>
        </div>

        <div className={styles.divider} />

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

        <p className={styles.accessNote}>
          Acesso restrito. Em caso de dúvida, contate o administrador da sua farmácia.
        </p>

        <div className={styles.cardFooter}>
          <span className={styles.cardFooterDot} aria-hidden="true" />
          <span className={styles.cardFooterText}>Conexão segura · PharmaTrack v2.0</span>
        </div>

      </div>
    </div>
  )
}