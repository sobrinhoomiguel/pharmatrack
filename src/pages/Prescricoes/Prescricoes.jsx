import { useState, useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, X, Calculator, ClipboardList } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { getMedicamentos } from '../../services/medicamentosService'
import { getPrescricoes, createPrescricao } from '../../services/prescricoesService'
import styles from './Prescricoes.module.css'

const schema = z.object({
  paciente:       z.string().min(2, 'Nome do paciente obrigatório'),
  medicamento:    z.string().min(1, 'Selecione um medicamento'),
  intervalo_horas:z.coerce.number().min(1).max(24),
  duracao_dias:   z.coerce.number().min(1),
  observacoes:    z.string().optional(),
})

function calcular(intervaloHoras, duracaoDias) {
  if (!intervaloHoras || !duracaoDias) return null
  const dosesPerDay = 24 / intervaloHoras
  const totalDoses = Math.ceil(dosesPerDay * duracaoDias)
  return { dosesPerDay, totalDoses }
}

export default function Prescricoes() {
  const [lista, setLista]       = useState([])
  const [medicamentos, setMeds] = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { intervalo_horas: 8, duracao_dias: 7 },
  })

  const intervaloHoras = useWatch({ control, name: 'intervalo_horas' })
  const duracaoDias    = useWatch({ control, name: 'duracao_dias' })
  const calc = calcular(Number(intervaloHoras), Number(duracaoDias))

  async function carregar() {
    try {
      const [prescs, meds] = await Promise.all([getPrescricoes(), getMedicamentos()])
      setLista(prescs)
      setMeds(meds)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [])

  async function onSubmit(data) {
    const c = calcular(Number(data.intervalo_horas), Number(data.duracao_dias))
    try {
      await createPrescricao({
        paciente:        data.paciente,
        medicamento:     data.medicamento,
        intervalo_horas: data.intervalo_horas,
        duracao_dias:    data.duracao_dias,
        total_doses:     c?.totalDoses ?? 0,
        total_unidades:  c?.totalDoses ?? 0,
        data:            new Date().toISOString().split('T')[0],
        status:          'ativa',
        observacoes:     data.observacoes ?? '',
      })
      await carregar()
      reset({ intervalo_horas: 8, duracao_dias: 7 })
      setModal(false)
    } catch (e) {
      console.error(e)
      alert('Erro ao salvar. Veja o console.')
    }
  }

  return (
    <div className={styles.page}>

      <div className={styles.toolbar}>
        <span className={styles.count}>{lista.length} prescrição(ões)</span>
        <Button icon={Plus} onClick={() => {
          reset({ intervalo_horas: 8, duracao_dias: 7 })
          setModal(true)
        }}>
          Nova Prescrição
        </Button>
      </div>

      {loading ? (
        <div className={styles.empty}>Carregando...</div>
      ) : (
        <div className={styles.cards}>
          {lista.map(p => (
            <div key={p.id} className={styles.card}>
              <div className={styles.cardTop}>
                <div>
                  <div className={styles.patientName}>{p.paciente}</div>
                  <div className={styles.medName}>{p.medicamento}</div>
                </div>
                <Badge variant={p.status === 'ativa' ? 'success' : 'default'}>
                  {p.status}
                </Badge>
              </div>

              <div className={styles.cardGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Intervalo</span>
                  <span className={styles.infoValue}>A cada {p.intervalo_horas}h</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Duração</span>
                  <span className={styles.infoValue}>{p.duracao_dias} dias</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Total de Doses</span>
                  <span className={styles.infoValue}>{p.total_doses}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Unidades Necessárias</span>
                  <span className={`${styles.infoValue} ${styles.highlight}`}>{p.total_unidades}</span>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <span className={styles.footerDate}>Prescrito em {p.data}</span>
              </div>
            </div>
          ))}
          {lista.length === 0 && (
            <div className={styles.empty}>Nenhuma prescrição registrada.</div>
          )}
        </div>
      )}

      {modal && (
        <div className={styles.overlay} onClick={() => setModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleWrap}>
                <ClipboardList size={18} className={styles.modalIcon} />
                <h2 className={styles.modalTitle}>Nova Prescrição</h2>
              </div>
              <button className={styles.closeBtn} onClick={() => setModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
              <div className={styles.field}>
                <label>Paciente *</label>
                <input {...register('paciente')} placeholder="Nome do paciente" autoFocus />
                {errors.paciente && <span className={styles.error}>{errors.paciente.message}</span>}
              </div>

              <div className={styles.field}>
                <label>Medicamento *</label>
                <select {...register('medicamento')}>
                  <option value="">Selecione o medicamento</option>
                  {medicamentos.map(m => (
                    <option key={m.id} value={`${m.nome} ${m.dosagem}`}>
                      {m.nome} {m.dosagem} — Estoque: {m.estoque_atual}
                    </option>
                  ))}
                </select>
                {errors.medicamento && <span className={styles.error}>{errors.medicamento.message}</span>}
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Intervalo (horas) *</label>
                  <input {...register('intervalo_horas')} type="number" min="1" max="24" placeholder="Ex: 8" />
                  {errors.intervalo_horas && <span className={styles.error}>{errors.intervalo_horas.message}</span>}
                </div>
                <div className={styles.field}>
                  <label>Duração (dias) *</label>
                  <input {...register('duracao_dias')} type="number" min="1" placeholder="Ex: 7" />
                  {errors.duracao_dias && <span className={styles.error}>{errors.duracao_dias.message}</span>}
                </div>
              </div>

              {calc && (
                <div className={styles.calcBox}>
                  <div className={styles.calcHeader}>
                    <Calculator size={14} />
                    <span>Cálculo automático</span>
                  </div>
                  <div className={styles.calcGrid}>
                    <div className={styles.calcItem}>
                      <span className={styles.calcLabel}>Doses por dia</span>
                      <span className={styles.calcValue}>{calc.dosesPerDay.toFixed(1)}</span>
                    </div>
                    <div className={styles.calcItem}>
                      <span className={styles.calcLabel}>Total de doses</span>
                      <span className={styles.calcValue}>{calc.totalDoses}</span>
                    </div>
                    <div className={styles.calcItem}>
                      <span className={styles.calcLabel}>Unidades necessárias</span>
                      <span className={`${styles.calcValue} ${styles.calcHighlight}`}>{calc.totalDoses}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.field}>
                <label>Observações</label>
                <textarea {...register('observacoes')} placeholder="Instruções adicionais..." rows={2} />
              </div>

              <div className={styles.formActions}>
                <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
                <Button type="submit">Salvar Prescrição</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}