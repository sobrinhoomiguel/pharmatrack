import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { medicamentos as dadosIniciais } from '../../data/mock.js'
import styles from './Medicamentos.module.css'

// ─── Schema ───────────────────────────────────────────────
const schema = z.object({
  nome:          z.string().min(2, 'Nome obrigatório'),
  principioAtivo:z.string().min(2, 'Princípio ativo obrigatório'),
  dosagem:       z.string().min(1, 'Dosagem obrigatória'),
  unidade:       z.string().min(1, 'Unidade obrigatória'),
  fabricante:    z.string().optional(),
  lote:          z.string().optional(),
  validade:      z.string().optional(),
  estoqueAtual:  z.coerce.number().min(0, 'Estoque não pode ser negativo'),
  estoqueMinimo: z.coerce.number().min(0, 'Estoque mínimo não pode ser negativo'),
  observacoes:   z.string().optional(),
})

function statusEstoque(med) {
  if (med.estoqueAtual === 0) return 'critico'
  if (med.estoqueAtual <= med.estoqueMinimo) return med.estoqueAtual < med.estoqueMinimo * 0.5 ? 'critico' : 'baixo'
  return 'normal'
}

export default function Medicamentos() {
  const [lista, setLista] = useState(dadosIniciais)
  const [busca, setBusca]   = useState('')
  const [modal, setModal]   = useState(false)
  const [editando, setEditando] = useState(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const filtrado = lista.filter(m =>
    m.nome.toLowerCase().includes(busca.toLowerCase()) ||
    m.principioAtivo.toLowerCase().includes(busca.toLowerCase())
  )

  function abrirNovo() {
    setEditando(null)
    reset({})
    setModal(true)
  }

  function abrirEditar(med) {
    setEditando(med)
    reset(med)
    setModal(true)
  }

  function fecharModal() {
    setModal(false)
    setEditando(null)
    reset({})
  }

  function onSubmit(data) {
    if (editando) {
      setLista(prev => prev.map(m => m.id === editando.id ? { ...m, ...data } : m))
    } else {
      setLista(prev => [...prev, { ...data, id: Date.now(), status: 'normal' }])
    }
    fecharModal()
  }

  function excluir(id) {
    if (confirm('Excluir este medicamento?')) {
      setLista(prev => prev.filter(m => m.id !== id))
    }
  }

  return (
    <div className={styles.page}>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            className={styles.search}
            placeholder="Buscar medicamento..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>
        <Button icon={Plus} onClick={abrirNovo}>Novo Medicamento</Button>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Princípio Ativo</th>
              <th>Dosagem</th>
              <th>Fabricante</th>
              <th>Validade</th>
              <th>Estoque</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtrado.map(med => {
              const st = statusEstoque(med)
              return (
                <tr key={med.id}>
                  <td className={styles.nomeMed}>{med.nome}</td>
                  <td className={styles.muted}>{med.principioAtivo}</td>
                  <td className={styles.mono}>{med.dosagem}</td>
                  <td className={styles.muted}>{med.fabricante}</td>
                  <td className={styles.mono}>{med.validade}</td>
                  <td className={styles.mono}>{med.estoqueAtual} / {med.estoqueMinimo}</td>
                  <td>
                    <Badge variant={st === 'normal' ? 'success' : st === 'baixo' ? 'warning' : 'danger'}>
                      {st === 'normal' ? 'Normal' : st === 'baixo' ? 'Baixo' : 'Crítico'}
                    </Badge>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <button className={styles.actionBtn} onClick={() => abrirEditar(med)} title="Editar">
                        <Edit2 size={14} />
                      </button>
                      <button className={`${styles.actionBtn} ${styles.del}`} onClick={() => excluir(med.id)} title="Excluir">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtrado.length === 0 && (
          <div className={styles.empty}>Nenhum medicamento encontrado.</div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className={styles.overlay} onClick={fecharModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editando ? 'Editar Medicamento' : 'Novo Medicamento'}
              </h2>
              <button className={styles.closeBtn} onClick={fecharModal}>
                <X size={18} />
              </button>
            </div>

            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Nome *</label>
                  <input {...register('nome')} placeholder="Ex: Paracetamol" autoFocus />
                  {errors.nome && <span className={styles.error}>{errors.nome.message}</span>}
                </div>
                <div className={styles.field}>
                  <label>Princípio Ativo *</label>
                  <input {...register('principioAtivo')} placeholder="Ex: Paracetamol" />
                  {errors.principioAtivo && <span className={styles.error}>{errors.principioAtivo.message}</span>}
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Dosagem *</label>
                  <input {...register('dosagem')} placeholder="Ex: 500mg" />
                  {errors.dosagem && <span className={styles.error}>{errors.dosagem.message}</span>}
                </div>
                <div className={styles.field}>
                  <label>Unidade *</label>
                  <select {...register('unidade')}>
                    <option value="">Selecione</option>
                    <option value="comprimido">Comprimido</option>
                    <option value="cápsula">Cápsula</option>
                    <option value="frasco">Frasco</option>
                    <option value="ampola">Ampola</option>
                    <option value="sachê">Sachê</option>
                    <option value="ml">mL</option>
                  </select>
                  {errors.unidade && <span className={styles.error}>{errors.unidade.message}</span>}
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Fabricante</label>
                  <input {...register('fabricante')} placeholder="Ex: EMS" />
                </div>
                <div className={styles.field}>
                  <label>Lote</label>
                  <input {...register('lote')} placeholder="Ex: L2024001" />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Validade</label>
                  <input {...register('validade')} type="date" />
                </div>
                <div className={styles.field}>
                  <label>Estoque Atual *</label>
                  <input {...register('estoqueAtual')} type="number" min="0" />
                  {errors.estoqueAtual && <span className={styles.error}>{errors.estoqueAtual.message}</span>}
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Estoque Mínimo *</label>
                  <input {...register('estoqueMinimo')} type="number" min="0" />
                  {errors.estoqueMinimo && <span className={styles.error}>{errors.estoqueMinimo.message}</span>}
                </div>
                <div className={styles.field}>
                  <label>Observações</label>
                  <input {...register('observacoes')} placeholder="Observações opcionais" />
                </div>
              </div>

              <div className={styles.formActions}>
                <Button variant="secondary" onClick={fecharModal}>Cancelar</Button>
                <Button type="submit" variant="primary">
                  {editando ? 'Salvar Alterações' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
