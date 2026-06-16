import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, X, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { movimentacoes as dadosIniciais, medicamentos } from '../../data/mock.js'
import styles from './Estoque.module.css'

const schema = z.object({
  tipo:          z.enum(['entrada', 'saida']),
  medicamentoId: z.coerce.number().min(1, 'Selecione um medicamento'),
  quantidade:    z.coerce.number().min(1, 'Quantidade deve ser ≥ 1'),
  data:          z.string().min(1, 'Data obrigatória'),
  responsavel:   z.string().min(2, 'Responsável obrigatório'),
  destino:       z.string().optional(),
  observacao:    z.string().optional(),
})

export default function Estoque() {
  const [lista, setLista] = useState(dadosIniciais)
  const [modal, setModal] = useState(false)
  const [tipoFiltro, setTipoFiltro] = useState('todos')

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { tipo: 'entrada', data: new Date().toISOString().split('T')[0] },
  })

  const tipoAtual = watch('tipo')

  const filtrado = tipoFiltro === 'todos'
    ? lista
    : lista.filter(m => m.tipo === tipoFiltro)

  function onSubmit(data) {
    const med = medicamentos.find(m => m.id === Number(data.medicamentoId))
    setLista(prev => [{
      id: Date.now(),
      ...data,
      medicamento: med ? `${med.nome} ${med.dosagem}` : '—',
    }, ...prev])
    reset({ tipo: 'entrada', data: new Date().toISOString().split('T')[0] })
    setModal(false)
  }

  return (
    <div className={styles.page}>

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
        <Button icon={Plus} onClick={() => { reset({ tipo: 'entrada', data: new Date().toISOString().split('T')[0] }); setModal(true) }}>
          Registrar Movimentação
        </Button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Medicamento</th>
              <th>Quantidade</th>
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
                      : <ArrowUpCircle   size={14} className={styles.saidaIcon}   />
                    }
                    <Badge variant={m.tipo === 'entrada' ? 'success' : 'warning'}>
                      {m.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                    </Badge>
                  </div>
                </td>
                <td className={styles.medName}>{m.medicamento}</td>
                <td className={styles.mono}>{m.quantidade}</td>
                <td>{m.data}</td>
                <td className={styles.muted}>{m.responsavel}</td>
                <td className={styles.muted}>{m.destino || m.observacao || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtrado.length === 0 && (
          <div className={styles.empty}>Nenhuma movimentação registrada.</div>
        )}
      </div>

      {modal && (
        <div className={styles.overlay} onClick={() => setModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Registrar Movimentação</h2>
              <button className={styles.closeBtn} onClick={() => setModal(false)}><X size={18} /></button>
            </div>

            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
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
                <select {...register('medicamentoId')}>
                  <option value="">Selecione</option>
                  {medicamentos.map(m => (
                    <option key={m.id} value={m.id}>{m.nome} {m.dosagem}</option>
                  ))}
                </select>
                {errors.medicamentoId && <span className={styles.error}>{errors.medicamentoId.message}</span>}
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

              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Responsável *</label>
                  <input {...register('responsavel')} placeholder="Nome do responsável" />
                  {errors.responsavel && <span className={styles.error}>{errors.responsavel.message}</span>}
                </div>
                {tipoAtual === 'saida' && (
                  <div className={styles.field}>
                    <label>Destino</label>
                    <input {...register('destino')} placeholder="Ex: Ala A, UTI..." />
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
