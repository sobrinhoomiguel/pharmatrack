import { useEffect, useState } from 'react'
import { FileDown } from 'lucide-react'
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

const COLORS = ['#14328C', '#2dd98f', '#f5a623', '#e84040', '#a78bfa']
const TOOLTIP_STYLE = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  color: 'var(--color-text)',
  fontSize: 13,
}
const TICK = { fill: 'var(--color-text-muted)', fontSize: 12 }

function exportar(dados, nomePlanilha, nomeArquivo) {
  const ws = XLSX.utils.json_to_sheet(dados)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, nomePlanilha)
  XLSX.writeFile(wb, `${nomeArquivo}.xlsx`)
}

export default function Relatorios() {
  const [medicamentos, setMeds]     = useState([])
  const [movimentacoes, setMovs]    = useState([])
  const [prescricoes, setPrescs]    = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([getMedicamentos(), getMovimentacoes(), getPrescricoes()])
      .then(([meds, movs, prescs]) => {
        setMeds(meds)
        setMovs(movs)
        setPrescs(prescs)
      })
      .finally(() => setLoading(false))
  }, [])

  // Gráfico 1 — Consumo por medicamento (saídas)
  const consumoPorMed = Object.values(
    movimentacoes
      .filter(m => m.tipo === 'saida')
      .reduce((acc, m) => {
        acc[m.medicamento] = acc[m.medicamento] || { nome: m.medicamento, quantidade: 0 }
        acc[m.medicamento].quantidade += Number(m.quantidade)
        return acc
      }, {})
  ).slice(0, 5)

  // Gráfico 2 — Estoque atual vs mínimo
  const estoqueVsMinimo = medicamentos.map(m => ({
    nome: m.nome,
    atual: m.estoque_atual,
    minimo: m.estoque_minimo,
  })).slice(0, 6)

  // Gráfico 3 — Prescrições por mês
  const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  const prescricoesPorMes = Object.values(
    prescricoes.reduce((acc, p) => {
      const mes = MESES[new Date(p.created_at).getMonth()]
      acc[mes] = acc[mes] || { mes, prescricoes: 0 }
      acc[mes].prescricoes += 1
      return acc
    }, {})
  )

  // Exports
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

  const dadosMovsExport = movimentacoes.map(m => ({
    Tipo: m.tipo,
    Medicamento: m.medicamento,
    Quantidade: m.quantidade,
    Data: m.data,
    Responsável: m.responsavel,
    'Destino/Obs': m.destino || m.observacao || '',
  }))

  const dadosPrescsExport = prescricoes.map(p => ({
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

      <div className={styles.grid}>
        <div className={styles.card}>
          <h2 className={styles.title}>Consumo por Medicamento</h2>
          {consumoPorMed.length === 0
            ? <p className={styles.vazio}>Nenhuma saída registrada ainda.</p>
            : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={consumoPorMed}>
                  <XAxis dataKey="nome" tick={TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={TICK} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="quantidade" radius={[4,4,0,0]}>
                    {consumoPorMed.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>

        <div className={styles.card}>
          <h2 className={styles.title}>Distribuição de Consumo</h2>
          {consumoPorMed.length === 0
            ? <p className={styles.vazio}>Nenhuma saída registrada ainda.</p>
            : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={consumoPorMed}
                    dataKey="quantidade"
                    nameKey="nome"
                    cx="50%" cy="50%"
                    outerRadius={90} innerRadius={40}
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
        <div className={styles.card}>
          <h2 className={styles.title}>Estoque Atual vs Mínimo</h2>
          {estoqueVsMinimo.length === 0
            ? <p className={styles.vazio}>Nenhum medicamento cadastrado ainda.</p>
            : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={estoqueVsMinimo}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="nome" tick={TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={TICK} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 12, color: 'var(--color-text-muted)' }} />
                  <Bar dataKey="atual"  name="Estoque Atual"  fill="#14328C" radius={[4,4,0,0]} />
                  <Bar dataKey="minimo" name="Estoque Mínimo" fill="#f5a623" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>

        <div className={styles.card}>
          <h2 className={styles.title}>Prescrições por Mês</h2>
          {prescricoesPorMes.length === 0
            ? <p className={styles.vazio}>Nenhuma prescrição registrada ainda.</p>
            : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={prescricoesPorMes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="mes" tick={TICK} axisLine={false} tickLine={false} />
                  <YAxis tick={TICK} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Line
                    type="monotone"
                    dataKey="prescricoes"
                    name="Prescrições"
                    stroke="#14328C"
                    strokeWidth={2}
                    dot={{ fill: '#14328C', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )
          }
        </div>
      </div>

      <div className={styles.exportSection}>
        <h2 className={styles.exportTitle}>Exportar dados</h2>
        <div className={styles.exportGrid}>
          <div className={styles.exportCard}>
            <div className={styles.exportInfo}>
              <span className={styles.exportLabel}>Medicamentos</span>
              <span className={styles.exportCount}>{medicamentos.length} registros</span>
            </div>
            <Button icon={FileDown} variant="secondary"
              onClick={() => exportar(dadosMedsExport, 'Medicamentos', 'pharmatrack-medicamentos')}>
              Exportar Excel
            </Button>
          </div>
          <div className={styles.exportCard}>
            <div className={styles.exportInfo}>
              <span className={styles.exportLabel}>Estoque</span>
              <span className={styles.exportCount}>{movimentacoes.length} movimentações</span>
            </div>
            <Button icon={FileDown} variant="secondary"
              onClick={() => exportar(dadosMovsExport, 'Estoque', 'pharmatrack-estoque')}>
              Exportar Excel
            </Button>
          </div>
          <div className={styles.exportCard}>
            <div className={styles.exportInfo}>
              <span className={styles.exportLabel}>Prescrições</span>
              <span className={styles.exportCount}>{prescricoes.length} registros</span>
            </div>
            <Button icon={FileDown} variant="secondary"
              onClick={() => exportar(dadosPrescsExport, 'Prescrições', 'pharmatrack-prescricoes')}>
              Exportar Excel
            </Button>
          </div>
        </div>
      </div>

    </div>
  )
}