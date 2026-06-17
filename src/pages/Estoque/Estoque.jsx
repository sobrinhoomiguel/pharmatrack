import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, X, ArrowDownCircle, ArrowUpCircle, AlertTriangle, Link2 } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { getMovimentacoes, createMovimentacao } from '../../services/movimentacoesService'
import { getMedicamentos } from '../../services/medicamentosService'
import { getPrescricoes, updatePrescricao } from '../../services/prescricoesService'
import styles from './Estoque.module.css'

const schemaManual = z.object({
  tipo:           z.enum(['entrada', 'saida']),
  medicamento_id: z.string().min(1, 'Selecione um medicamento'),
  quantidade:     z.coerce.number().min(1, 'Quantidade deve ser ≥ 1'),
  data:           z.string().min(1, 'Data obrigatória'),
  responsavel:    z.string().min(2, 'Responsável obrigatório'),
  paciente_nome:  z.string().optional(),
  paciente_cpf:   z.string().optional(),
  destino:        z.string().optional(),
  observacao:     z.string().optional(),
})

const schemaPrescricao = z.object({
  tipo:           z.literal('saida'),
  prescricao_id:  z.string().min(1, 'Selecione uma prescrição'),
  data:           z.string().min(1, 'Data obrigatória'),
  responsavel:    z.string().min(2, 'Responsável obrigatório'),
  observacao:     z.string().optional(),
})

export default function Estoque() {
  const [lista, setLista]             = useState([])
  const [medicamentos, setMeds]       = useState([])
  const [prescricoesAtivas, setPrescs]= useState([])
  const [loading, setLoading]         = useState(true)
  const [modal, setModal]             = useState(false)
  const [tipoFiltro, setTipoFiltro]   = useState('todos')
  const [alerta, setAlerta]           = useState(null)
  const [modoVinculo, setModoVinculo] = useState(false) // false = manual, true = via prescrição

  const schemaAtivo = modoVinculo ? schemaPrescricao : schemaManual

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schemaAtivo),
    defaultValues: { tipo: 'entrada', data: new Date().toISOString().split('T')[0] },
  })

  const tipoAtual = watch('tipo')
  const prescricaoIdAtual = watch('prescricao_id')

  async function carregar() {
    try {
      const [movs, meds, prescs] = await Promise.all([
        getMovimentacoes(), getMedicamentos(), getPrescricoes(),
      ])
      setLista(movs)
      setMeds(meds)
      setPrescs(prescs.filter(p => p.status === 'ativa'))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [])

  const filtrado = tipoFiltro === 'todos'
    ? lista
    : lista.filter(m => m.tipo === tipoFiltro)

  function abrirModalManual() {
    setModoVinculo(false)
    reset({ tipo: 'entrada', data: new Date().toISOString().split('T')[0] })
    setModal(true)
  }

  function abrirModalPrescricao() {
    setModoVinculo(true)
    reset({ tipo: 'saida', data: new Date().toISOString().split('T')[0] })
    setModal(true)
  }

  async function checarAlerta(medId) {
    const medsAtualizados = await getMedicamentos()
    const med = medsAtualizados.find(m => m.id === medId)
    if (med && Number(med.estoque_atual) <= Number(med.estoque_minimo)) {
      setAlerta(`${med.nome} ${med.dosagem} está com estoque baixo: ${med.estoque_atual} unidade(s) (mínimo: ${med.estoque_minimo}).`)
    }
  }

  async function onSubmit(data) {
    try {
      if (modoVinculo) {
        // Saída vinculada a uma prescrição
        const prescricao = prescricoesAtivas.find(p => p.id === data.prescricao_id)
        if (!prescricao) return alert('Prescrição não encontrada.')

        const med = medicamentos.find(m => `${m.nome} ${m.dosagem}` === prescricao.medicamento)

        await createMovimentacao({
          tipo:           'saida',
          medicamento:    prescricao.medicamento,
          medicamento_id: med?.id,
          quantidade:     prescricao.total_unidades,
          data:           data.data,
          responsavel:    data.responsavel,
          destino:        '',
          observacao:     data.observacao || '',
          paciente_nome:  prescricao.paciente,
          paciente_cpf:   '',
          prescricao_id:  prescricao.id,
        })

        await updatePrescricao(prescricao.id, { status: 'concluida' })

        if (med) await checarAlerta(med.id)

      } else {
        // Saída/entrada manual
        const med = medicamentos.find(m => m.id === data.medicamento_id)
        if (!med) return alert('Medicamento não encontrado.')

        await createMovimentacao({
          tipo:           data.tipo,
          medicamento:    `${med.nome} ${med.dosagem}`,
          medicamento_id: med.id,
          quantidade:     data.quantidade,
          data:           data.data,
          responsavel:    data.responsavel,
          destino:        data.destino || '',
          observacao:     data.observacao || '',
          paciente_nome:  data.paciente_nome || '',
          paciente_cpf:   data.paciente_cpf || '',
          prescricao_id:  null,
        })

        await checarAlerta(med.id)
      }

      await carregar()
      setModal(false)
    } catch (e) {
      console.error(e)
      alert('Erro ao registrar. Veja o console.')
    }
  }

  return (
    <div className={styles.page}>

      {alerta && (
        <div className={styles.alertBanner}>
          <AlertTriangle size={16} />
          <span>{alerta}</span>
          <button onClick={() => setAlerta(null)}>×</button>
        </div>
      )}

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {['todos', 'entrada', 'saida'].map(f => (
            <button
              key={f}
              className={`${styles.filterBtn} ${tipoFiltro === f ? styles.filterActive : ''}`}
              onClick={() => setTipoFiltro(f)}
            >
              {f === 'todos' ? 'Todos' : f === 'entrada' ? 'Entradas' : 'Saídas'}
            </button>
          ))}
        </div>
        <div className={styles.toolbarActions}>
          <Button icon={Link2} variant="secondary" onClick={abrirModalPrescricao}>
            Saída via Prescrição
          </Button>
          <Button icon={Plus} onClick={abrirModalManual}>
            Registrar Movimentação
          </Button>
        </div>
      </div>

      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.empty}>Carregando...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Medicamento</th>
                <th>Quantidade</th>
                <th>Paciente</th>
                <th>Data</th>
                <th>Responsável</th>
                <th>Destino / Obs.</th>
              </tr>
            </thead>
            <tbody>
              {filtrado.map(m => (
                <tr key={m.id}>
                  <td>
                    <div className={styles.tipoCell}>
                      {m.tipo === 'entrada'
                        ? <ArrowDownCircle size={14} className={styles.entradaIcon} />
                        : <ArrowUpCircle   size={14} className={styles.saidaIcon} />
                      }
                      <Badge variant={m.tipo === 'entrada' ? 'success' : 'warning'}>
                        {m.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                      </Badge>
                    </div>
                  </td>
                  <td className={styles.medName}>{m.medicamento}</td>
                  <td className={styles.mono}>{m.quantidade}</td>
                  <td className={styles.muted}>
                    {m.paciente_nome || '—'}
                    {m.prescricao_id && <span className={styles.tagPrescricao}> (prescrição)</span>}
                  </td>
                  <td>{m.data}</td>
                  <td className={styles.muted}>{m.responsavel}</td>
                  <td className={styles.muted}>{m.destino || m.observacao || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtrado.length === 0 && (
          <div className={styles.empty}>Nenhuma movimentação registrada.</div>
        )}
      </div>

      {modal && (
        <div className={styles.overlay} onClick={() => setModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {modoVinculo ? 'Saída via Prescrição' : 'Registrar Movimentação'}
              </h2>
              <button className={styles.closeBtn} onClick={() => setModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>

              {modoVinculo ? (
                <>
                  <div className={styles.field}>
                    <label>Prescrição Ativa *</label>
                    <select {...register('prescricao_id')}>
                      <option value="">Selecione a prescrição</option>
                      {prescricoesAtivas.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.paciente} — {p.medicamento} ({p.total_unidades} un.)
                        </option>
                      ))}
                    </select>
                    {errors.prescricao_id && <span className={styles.error}>{errors.prescricao_id.message}</span>}
                    {prescricoesAtivas.length === 0 && (
                      <span className={styles.hint}>Nenhuma prescrição ativa encontrada.</span>
                    )}
                  </div>

                  {prescricaoIdAtual && (() => {
                    const p = prescricoesAtivas.find(pr => pr.id === prescricaoIdAtual)
                    if (!p) return null
                    return (
                      <div className={styles.previewBox}>
                        <span><strong>Paciente:</strong> {p.paciente}</span>
                        <span><strong>Médico:</strong> {p.medico_nome} — CRM {p.medico_crm}</span>
                        <span><strong>Medicamento:</strong> {p.medicamento}</span>
                        <span><strong>Unidades a baixar:</strong> {p.total_unidades}</span>
                      </div>
                    )
                  })()}
                </>
              ) : (
                <>
                  <div className={styles.tipoToggle}>
                    {['entrada', 'saida'].map(t => (
                      <label key={t} className={`${styles.tipoOpt} ${tipoAtual === t ? styles.tipoOptActive : ''}`}>
                        <input type="radio" value={t} {...register('tipo')} className={styles.radioHidden} />
                        {t === 'entrada'
                          ? <><ArrowDownCircle size={15} /> Entrada</>
                          : <><ArrowUpCircle   size={15} /> Saída</>
                        }
                      </label>
                    ))}
                  </div>

                  <div className={styles.field}>
                    <label>Medicamento *</label>
                    <select {...register('medicamento_id')}>
                      <option value="">Selecione</option>
                      {medicamentos.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.nome} {m.dosagem} — Estoque: {m.estoque_atual}
                        </option>
                      ))}
                    </select>
                    {errors.medicamento_id && <span className={styles.error}>{errors.medicamento_id.message}</span>}
                  </div>

                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label>Quantidade *</label>
                      <input {...register('quantidade')} type="number" min="1" placeholder="0" autoFocus />
                      {errors.quantidade && <span className={styles.error}>{errors.quantidade.message}</span>}
                    </div>
                    <div className={styles.field}>
                      <label>Data *</label>
                      <input {...register('data')} type="date" />
                      {errors.data && <span className={styles.error}>{errors.data.message}</span>}
                    </div>
                  </div>

                  {tipoAtual === 'saida' && (
                    <div className={styles.row}>
                      <div className={styles.field}>
                        <label>Nome do Paciente</label>
                        <input {...register('paciente_nome')} placeholder="Nome de quem recebeu" />
                      </div>
                      <div className={styles.field}>
                        <label>CPF do Paciente</label>
                        <input {...register('paciente_cpf')} placeholder="000.000.000-00" />
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Responsável *</label>
                  <input {...register('responsavel')} placeholder="Nome do responsável" />
                  {errors.responsavel && <span className={styles.error}>{errors.responsavel.message}</span>}
                </div>
                {!modoVinculo && tipoAtual === 'saida' && (
                  <div className={styles.field}>
                    <label>Destino</label>
                    <input {...register('destino')} placeholder="Ex: Ala A, UTI..." />
                  </div>
                )}
                {modoVinculo && (
                  <div className={styles.field}>
                    <label>Data *</label>
                    <input {...register('data')} type="date" />
                    {errors.data && <span className={styles.error}>{errors.data.message}</span>}
                  </div>
                )}
              </div>

              <div className={styles.field}>
                <label>Observação</label>
                <input {...register('observacao')} placeholder="Observação opcional" />
              </div>

              <div className={styles.formActions}>
                <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
                <Button type="submit">Registrar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}