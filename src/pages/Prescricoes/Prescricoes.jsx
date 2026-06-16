import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, X, Calculator, ClipboardList } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { medicamentos, prescricoes as dadosIniciais } from '../../data/mock.js'
import styles from './Prescricoes.module.css'

const schema = z.object({
  paciente:      z.string().min(2, 'Nome do paciente obrigatório'),
  medicamentoId: z.coerce.number().min(1, 'Selecione um medicamento'),
  intervaloHoras:z.coerce.number().min(1, 'Intervalo deve ser ≥ 1h').max(24),
  duracaoDias:   z.coerce.number().min(1, 'Duração deve ser ≥ 1 dia'),
  observacoes:   z.string().optional(),
})

function calcular(intervaloHoras, duracaoDias) {
  if (!intervaloHoras || !duracaoDias) return null
  const dosesPerDay = 24 / intervaloHoras
  const totalDoses = Math.ceil(dosesPerDay * duracaoDias)
  return { dosesPerDay, totalDoses }
}

export default function Prescricoes() {
  const [lista, setLista] = useState(dadosIniciais)
  const [modal, setModal] = useState(false)

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { intervaloHoras: 8, duracaoDias: 7 },
  })

  const intervaloHoras = useWatch({ control, name: 'intervaloHoras' })
  const duracaoDias    = useWatch({ control, name: 'duracaoDias' })
  const calc = calcular(Number(intervaloHoras), Number(duracaoDias))

  function onSubmit(data) {
    const med = medicamentos.find(m => m.id === Number(data.medicamentoId))
    const c = calcular(Number(data.intervaloHoras), Number(data.duracaoDias))
    setLista(prev => [...prev, {
      id: Date.now(),
      paciente: data.paciente,
      medicamentoId: data.medicamentoId,
      medicamento: med ? `${med.nome} ${med.dosagem}` : '—',
      dosagem: med?.dosagem ?? '',
      intervaloHoras: data.intervaloHoras,
      duracaoDias: data.duracaoDias,
      totalDoses: c?.totalDoses ?? 0,
      totalUnidades: c?.totalDoses ?? 0,
      data: new Date().toISOString().split('T')[0],
      status: 'ativa',
      observacoes: data.observacoes ?? '',
    }])
    reset({ intervaloHoras: 8, duracaoDias: 7 })
    setModal(false)
  }

  return (
    <div className={styles.page}>

      <div className={styles.toolbar}>
        <span className={styles.count}>{lista.length} prescrição(ões)</span>
        <Button icon={Plus} onClick={() => { reset({ intervaloHoras: 8, duracaoDias: 7 }); setModal(true) }}>
          Nova Prescrição
        </Button>
      </div>

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
                <span className={styles.infoValue}>A cada {p.intervaloHoras}h</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Duração</span>
                <span className={styles.infoValue}>{p.duracaoDias} dias</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Total de Doses</span>
                <span className={styles.infoValue}>{p.totalDoses}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Unidades Necessárias</span>
                <span className={`${styles.infoValue} ${styles.highlight}`}>{p.totalUnidades}</span>
              </div>
            </div>

            <div className={styles.cardFooter}>
              <span className={styles.footerDate}>Prescrito em {p.data}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
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
                <select {...register('medicamentoId')}>
                  <option value="">Selecione o medicamento</option>
                  {medicamentos.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.nome} {m.dosagem} — Estoque: {m.estoqueAtual}
                    </option>
                  ))}
                </select>
                {errors.medicamentoId && <span className={styles.error}>{errors.medicamentoId.message}</span>}
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Intervalo (horas) *</label>
                  <input {...register('intervaloHoras')} type="number" min="1" max="24" placeholder="Ex: 8" />
                  {errors.intervaloHoras && <span className={styles.error}>{errors.intervaloHoras.message}</span>}
                </div>
                <div className={styles.field}>
                  <label>Duração (dias) *</label>
                  <input {...register('duracaoDias')} type="number" min="1" placeholder="Ex: 7" />
                  {errors.duracaoDias && <span className={styles.error}>{errors.duracaoDias.message}</span>}
                </div>
              </div>

              {/* Cálculo automático */}
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
