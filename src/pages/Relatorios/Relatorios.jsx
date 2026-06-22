import { useEffect, useState, useMemo } from 'react'
import { FileDown, Calendar } from 'lucide-react'
import * as XLSX from 'xlsx'
import styles from './Relatorios.module.css'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
} from 'recharts'
import { getMedicamentos } from '../../services/medicamentosService'
import { getMovimentacoes } from '../../services/movimentacoesService'
import { getPrescricoes } from '../../services/prescricoesService'
import Button from '../../components/ui/Button.jsx'

const COLORS = ['#3152af', '#57b78f', '#cf9247', '#ba3f3f', '#9B8FB0']

const TOOLTIP_STYLE = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  color: 'var(--color-text)',
  fontSize: 13,
}

const TICK = { fill: 'var(--color-text-muted)', fontSize: 12 }

const MESES_LABEL = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const PERIODOS = [
  { label: 'Últimos 7 dias',  dias: 7  },
  { label: 'Últimos 30 dias', dias: 30 },
  { label: 'Últimos 90 dias', dias: 90 },
  { label: 'Últimos 12 meses', dias: 365 },
  { label: 'Tudo',            dias: null },
]

function exportar(dados, nomePlanilha, nomeArquivo) {
  const ws = XLSX.utils.json_to_sheet(dados)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, nomePlanilha)
  XLSX.writeFile(wb, `${nomeArquivo}.xlsx`)
}

function dentroDoFiltro(dataStr, dias) {
  if (!dias) return true
  if (!dataStr) return false
  const data = new Date(dataStr)
  const limite = new Date()
  limite.setDate(limite.getDate() - dias)
  return data >= limite
}

export default function Relatorios() {
  const [medicamentos, setMeds]   = useState([])
  const [movimentacoes, setMovs]  = useState([])
  const [prescricoes, setPrescs]  = useState([])
  const [loading, setLoading]     = useState(true)
  const [periodoIdx, setPeriodoIdx] = useState(1) // default: 30 dias

  useEffect(() => {
    Promise.all([getMedicamentos(), getMovimentacoes(), getPrescricoes()])
      .then(([meds, movs, prescs]) => {
        setMeds(meds)
        setMovs(movs)
        setPrescs(prescs)
      })
      .finally(() => setLoading(false))
  }, [])

  const { dias } = PERIODOS[periodoIdx]

  // --- Dados derivados com filtro de período ---

  const movsFiltered = useMemo(
    () => movimentacoes.filter(m => dentroDoFiltro(m.data || m.created_at, dias)),
    [movimentacoes, dias]
  )

  const prescsFiltered = useMemo(
    () => prescricoes.filter(p => dentroDoFiltro(p.data || p.created_at, dias)),
    [prescricoes, dias]
  )

  // Gráfico 1 — Consumo por medicamento (saídas)
  const consumoPorMed = useMemo(() =>
    Object.values(
      movsFiltered
        .filter(m => m.tipo === 'saida')
        .reduce((acc, m) => {
          acc[m.medicamento] = acc[m.medicamento] || { nome: m.medicamento, quantidade: 0 }
          acc[m.medicamento].quantidade += Number(m.quantidade)
          return acc
        }, {})
    )
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 5),
    [movsFiltered]
  )

  // Gráfico 2 — Estoque atual vs mínimo (sem filtro de data — é snapshot atual)
  const estoqueVsMinimo = useMemo(() =>
    medicamentos
      .map(m => ({
        nome: m.nome.split(' ')[0], // só o nome principal p/ caber no eixo
        atual: m.estoque_atual,
        minimo: m.estoque_minimo,
        critico: m.estoque_atual <= m.estoque_minimo,
      }))
      .slice(0, 6),
    [medicamentos]
  )

  // Gráfico 3 — Prescrições por mês (com sort cronológico)
  const prescricoesPorMes = useMemo(() => {
    const contagem = prescsFiltered.reduce((acc, p) => {
      const d = new Date(p.data || p.created_at)
      if (isNaN(d)) return acc
      const chave = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
      const label = `${MESES_LABEL[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`
      acc[chave] = acc[chave] || { chave, label, prescricoes: 0 }
      acc[chave].prescricoes += 1
      return acc
    }, {})

    return Object.values(contagem).sort((a, b) => a.chave.localeCompare(b.chave))
  }, [prescsFiltered])

  // --- Exports ---
  const dadosMedsExport = medicamentos.map(m => ({
    Nome: m.nome,
    'Princípio Ativo': m.principio_ativo,
    Dosagem: m.dosagem,
    Unidade: m.unidade,
    Fabricante: m.fabricante,
    Lote: m.lote,
    Validade: m.validade,
    'Estoque Atual': m.estoque_atual,
    'Estoque Mínimo': m.estoque_minimo,
  }))

  const dadosMovsExport = movsFiltered.map(m => ({
    Tipo: m.tipo,
    Medicamento: m.medicamento,
    Quantidade: m.quantidade,
    Data: m.data,
    Responsável: m.responsavel,
    'Destino/Obs': m.destino || m.observacao || '',
  }))

  const dadosPrescsExport = prescsFiltered.map(p => ({
    Paciente: p.paciente,
    Medicamento: p.medicamento,
    'Intervalo (h)': p.intervalo_horas,
    'Duração (dias)': p.duracao_dias,
    'Total de Doses': p.total_doses,
    'Unidades Necessárias': p.total_unidades,
    Data: p.data,
    Status: p.status,
  }))

  if (loading) return <div className={styles.empty}>Carregando...</div>

  return (
    <div className={styles.page}>

      {/* Filtro de período */}
      <div className={styles.filtroBar}>
        <span className={styles.filtroLabel}>
          <Calendar size={14} />
          Período:
        </span>
        <div className={styles.filtroBtns}>
          {PERIODOS.map((p, i) => (
            <button
              key={i}
              className={`${styles.filtroBtn} ${periodoIdx === i ? styles.filtroBtnAtivo : ''}`}
              onClick={() => setPeriodoIdx(i)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.grid}>
        {/* Consumo por Medicamento */}
        <div className={styles.card}>
          <h2 className={styles.title}>Consumo por Medicamento</h2>
          {consumoPorMed.length === 0
            ? <p className={styles.vazio}>Nenhuma saída registrada no período.</p>
            : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={consumoPorMed}>
                  <XAxis dataKey="nome" tick={TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={TICK} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="quantidade" name="Unidades" radius={[4, 4, 0, 0]}>
                    {consumoPorMed.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>

        {/* Distribuição de Consumo */}
        <div className={styles.card}>
          <h2 className={styles.title}>Distribuição de Consumo</h2>
          {consumoPorMed.length === 0
            ? <p className={styles.vazio}>Nenhuma saída registrada no período.</p>
            : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={consumoPorMed}
                    dataKey="quantidade"
                    nameKey="nome"
                    cx="50%" cy="50%"
                    outerRadius={90} innerRadius={45}
                    paddingAngle={2}
                  >
                    {consumoPorMed.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 12, color: 'var(--color-text-muted)' }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            )
          }
        </div>
      </div>

      <div className={styles.grid}>
        {/* Estoque Atual vs Mínimo */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.title}>Estoque Atual vs Mínimo</h2>
            {estoqueVsMinimo.some(m => m.critico) && (
              <span className={styles.badge}>
                {estoqueVsMinimo.filter(m => m.critico).length} crítico(s)
              </span>
            )}
          </div>
          {estoqueVsMinimo.length === 0
            ? <p className={styles.vazio}>Nenhum medicamento cadastrado ainda.</p>
            : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={estoqueVsMinimo} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="nome" tick={TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={TICK} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 12, color: 'var(--color-text-muted)' }} />
                  <Bar dataKey="atual"  name="Estoque Atual"  radius={[4, 4, 0, 0]}>
                    {estoqueVsMinimo.map((entry, i) => (
                      <Cell key={i} fill={entry.critico ? '#ba3f3f' : '#3152af'} />
                    ))}
                  </Bar>
                  <Bar dataKey="minimo" name="Estoque Mínimo" fill="#D9A86C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>

        {/* Prescrições por Mês */}
        <div className={styles.card}>
          <h2 className={styles.title}>Prescrições por Mês</h2>
          {prescricoesPorMes.length === 0
            ? <p className={styles.vazio}>Nenhuma prescrição registrada no período.</p>
            : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={prescricoesPorMes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="label" tick={TICK} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={TICK}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    domain={[0, 'auto']}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Line
                    type="monotone"
                    dataKey="prescricoes"
                    name="Prescrições"
                    stroke="#3152af"
                    strokeWidth={2.5}
                    dot={{ fill: '#4A5C8C', r: 5, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )
          }
        </div>
      </div>

      {/* Seção de export */}
      <div className={styles.exportSection}>
        <h2 className={styles.exportTitle}>Exportar dados</h2>
        <p className={styles.exportSubtitle}>
          Os arquivos refletem o período selecionado (exceto Medicamentos, que é o snapshot atual).
        </p>
        <div className={styles.exportGrid}>
          <div className={styles.exportCard}>
            <div className={styles.exportInfo}>
              <span className={styles.exportLabel}>Medicamentos</span>
              <span className={styles.exportCount}>{medicamentos.length} registros</span>
            </div>
            <Button icon={FileDown} variant="secondary"
              onClick={() => exportar(dadosMedsExport, 'Medicamentos', 'pharmatrack-medicamentos')}>
              Exportar
            </Button>
          </div>
          <div className={styles.exportCard}>
            <div className={styles.exportInfo}>
              <span className={styles.exportLabel}>Movimentações</span>
              <span className={styles.exportCount}>{movsFiltered.length} de {movimentacoes.length} total</span>
            </div>
            <Button icon={FileDown} variant="secondary"
              onClick={() => exportar(dadosMovsExport, 'Estoque', 'pharmatrack-estoque')}>
              Exportar
            </Button>
          </div>
          <div className={styles.exportCard}>
            <div className={styles.exportInfo}>
              <span className={styles.exportLabel}>Prescrições</span>
              <span className={styles.exportCount}>{prescsFiltered.length} de {prescricoes.length} total</span>
            </div>
            <Button icon={FileDown} variant="secondary"
              onClick={() => exportar(dadosPrescsExport, 'Prescrições', 'pharmatrack-prescricoes')}>
              Exportar
            </Button>
          </div>
        </div>
      </div>

    </div>
  )
}