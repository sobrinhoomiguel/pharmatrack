// src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styles from './Register.module.css';

const STEPS = ['Conta', 'Empresa', 'Confirmar'];

function maskCnpj(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

function validarCnpj(cnpj) {
  const n = cnpj.replace(/\D/g, '')
  if (n.length !== 14) return false
  if (/^(\d)\1+$/.test(n)) return false
  const calc = (x) => {
    const slice = n.slice(0, x)
    let sum = 0, pos = x - 7
    for (let i = x; i >= 1; i--) {
      sum += parseInt(slice[x - i]) * pos--
      if (pos < 2) pos = 9
    }
    return sum % 11 < 2 ? 0 : 11 - (sum % 11)
  }
  return calc(12) === parseInt(n[12]) && calc(13) === parseInt(n[13])
}

export default function Register() {
  const navigate = useNavigate();
  const { registerCompany, error: authError, setError } = useAuth();

  const [step, setStep]             = useState(0);
  const [loading, setLoading]       = useState(false);
  const [localError, setLocalError] = useState('');

  const [form, setForm] = useState({
    nome: '', email: '', password: '', passwordConfirm: '',
    companyNome: '', companyCnpj: '',
  });

  function handleChange(e) {
    let { name, value } = e.target;
    if (name === 'companyCnpj') value = maskCnpj(value);
    setForm(prev => ({ ...prev, [name]: value }));
    setLocalError('');
    setError(null);
  }

  function validateStep() {
    if (step === 0) {
      if (!form.nome.trim())                      return 'Informe seu nome.';
      if (form.nome.trim().length < 3)            return 'Nome deve ter ao menos 3 caracteres.';
      if (!form.email.trim())                     return 'Informe seu email.';
      if (!/\S+@\S+\.\S+/.test(form.email))       return 'Email inválido.';
      if (form.password.length < 8)               return 'Senha deve ter no mínimo 8 caracteres.';
      if (form.password !== form.passwordConfirm) return 'As senhas não coincidem.';
    }
    if (step === 1) {
      if (!form.companyNome.trim())               return 'Informe o nome da farmácia.';
      if (form.companyNome.trim().length < 3)     return 'Nome da farmácia muito curto.';
      if (form.companyCnpj && !validarCnpj(form.companyCnpj)) return 'CNPJ inválido.';
    }
    return null;
  }

  function nextStep() {
    const err = validateStep();
    if (err) { setLocalError(err); return; }
    setStep(s => s + 1);
  }

  function prevStep() {
    setLocalError('');
    setStep(s => s - 1);
  }

  async function handleSubmit() {
    setLoading(true);
    setLocalError('');

    const result = await registerCompany({
      email:       form.email,
      password:    form.password,
      nome:        form.nome,
      companyNome: form.companyNome,
      companyCnpj: form.companyCnpj || null,
    });

    setLoading(false);

    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setLocalError(authError || 'Erro ao criar conta. Tente novamente.');
      setStep(0);
    }
  }

  const displayError = localError || authError;

  return (
    <div className={styles.page}>

      <div className={styles.brand}>
        <div className={styles.brandInner}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>P</div>
            <span className={styles.logoText}>PharmaTrack</span>
          </div>
          <h1 className={styles.brandTitle}>
            Gestão farmacêutica<br />inteligente
          </h1>
          <p className={styles.brandSub}>
            Controle de estoque, prescrições e relatórios — tudo em um lugar.
          </p>
          <ul className={styles.brandFeatures}>
            <li>Controle de medicamentos e validades</li>
            <li>Gestão de prescrições</li>
            <li>Relatórios com exportação Excel</li>
            <li>Multi-usuários por empresa</li>
          </ul>
        </div>
      </div>

      <div className={styles.formSide}>
        <div className={styles.formCard}>

          <div className={styles.steps}>
            {STEPS.map((label, i) => (
              <div key={label} className={`${styles.stepItem} ${i === step ? styles.stepActive : i < step ? styles.stepDone : ''}`}>
                <div className={styles.stepCircle}>{i < step ? '✓' : i + 1}</div>
                <span className={styles.stepLabel}>{label}</span>
                {i < STEPS.length - 1 && <div className={styles.stepLine} />}
              </div>
            ))}
          </div>

          {step === 0 && (
            <div className={styles.stepContent}>
              <h2 className={styles.formTitle}>Crie sua conta</h2>
              <p className={styles.formSub}>Você será o administrador da farmácia</p>

              <div className={styles.field}>
                <label htmlFor="nome">Nome completo</label>
                <input id="nome" name="nome" type="text"
                  placeholder="João Silva"
                  value={form.nome} onChange={handleChange}
                  autoFocus maxLength={80} />
              </div>

              <div className={styles.field}>
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email"
                  placeholder="joao@farmacia.com"
                  value={form.email} onChange={handleChange}
                  maxLength={120} />
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="password">Senha</label>
                  <input id="password" name="password" type="password"
                    placeholder="Mín. 8 caracteres"
                    value={form.password} onChange={handleChange}
                    maxLength={64} />
                </div>
                <div className={styles.field}>
                  <label htmlFor="passwordConfirm">Confirmar senha</label>
                  <input id="passwordConfirm" name="passwordConfirm" type="password"
                    placeholder="Repita a senha"
                    value={form.passwordConfirm} onChange={handleChange}
                    maxLength={64} />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className={styles.stepContent}>
              <h2 className={styles.formTitle}>Sua farmácia</h2>
              <p className={styles.formSub}>Informe os dados do estabelecimento</p>

              <div className={styles.field}>
                <label htmlFor="companyNome">Nome da farmácia *</label>
                <input id="companyNome" name="companyNome" type="text"
                  placeholder="Farmácia Central Ltda."
                  value={form.companyNome} onChange={handleChange}
                  autoFocus maxLength={100} />
              </div>

              <div className={styles.field}>
                <label htmlFor="companyCnpj">
                  CNPJ <span className={styles.optional}>(opcional)</span>
                </label>
                <input id="companyCnpj" name="companyCnpj" type="text"
                  placeholder="00.000.000/0001-00"
                  value={form.companyCnpj} onChange={handleChange}
                  maxLength={18} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.stepContent}>
              <h2 className={styles.formTitle}>Confirmar cadastro</h2>
              <p className={styles.formSub}>Revise os dados antes de criar sua conta</p>

              <div className={styles.summary}>
                <div className={styles.summarySection}>
                  <h3>Conta</h3>
                  <div className={styles.summaryRow}><span>Nome</span><strong>{form.nome}</strong></div>
                  <div className={styles.summaryRow}><span>Email</span><strong>{form.email}</strong></div>
                  <div className={styles.summaryRow}><span>Perfil</span><strong className={styles.badge}>Admin</strong></div>
                </div>
                <div className={styles.summarySection}>
                  <h3>Farmácia</h3>
                  <div className={styles.summaryRow}><span>Nome</span><strong>{form.companyNome}</strong></div>
                  {form.companyCnpj && (
                    <div className={styles.summaryRow}><span>CNPJ</span><strong>{form.companyCnpj}</strong></div>
                  )}
                </div>
              </div>
            </div>
          )}

          {displayError && (
            <div className={styles.error} role="alert">{displayError}</div>
          )}

          <div className={styles.actions}>
            {step > 0 && (
              <button type="button" className={styles.btnSecondary} onClick={prevStep} disabled={loading}>
                Voltar
              </button>
            )}
            {step < 2 && (
              <button type="button" className={styles.btnPrimary} onClick={nextStep}>
                Continuar
              </button>
            )}
            {step === 2 && (
              <button type="button" className={styles.btnPrimary} onClick={handleSubmit} disabled={loading}>
                {loading ? <span className={styles.spinner} /> : 'Criar conta'}
              </button>
            )}
          </div>

          <p className={styles.loginLink}>
            Já tem conta? <Link to="/login">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}