import { useEffect, useState } from 'react'
import { Pill, Package, ClipboardList, AlertTriangle } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts'
import StatCard from '../../components/ui/StatCard.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { getMedicamentos } from '../../services/medicamentosService'
import { getMovimentacoes } from '../../services/movimentacoesService'
import { getPrescricoes } from '../../services/prescricoesService'
import styles from './Dashboard.module.css'

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export default function Dashboard() {
  const [medicamentos, setMeds]  = useState([])
  const [movimentacoes, setMovs] = useState([])
  const [prescricoes, setPrescs] = useState([])
  const [loading, setLoading]    = useState(true)

  useEffect(() => {
    Promise.all([getMedicamentos(), getMovimentacoes(), getPrescricoes()])
      .then(([meds, movs, prescs]) => {
        setMeds(meds)
        setMovs(movs)
        setPrescs(prescs)
      })
      .finally(() => setLoading(false))
  }, [])

  const baixoEstoque      = medicamentos.filter(m => Number(m.estoque_atual) <= Number(m.estoque_minimo))
  const prescAtivasCount  = prescricoes.filter(p => p.status === 'ativa').length
  const entradas          = movimentacoes.filter(m => m.tipo === 'entrada').slice(0, 4)
  const saidas            = movimentacoes.filter(m => m.tipo === 'saida')

  // Consumo mensal — soma quantidade de TODAS movimentações por mês
  const consumoMensalMap = {}
  movimentacoes.forEach(m => {
    const d = new Date(m.created_at)
    const mes = MESES[d.getMonth()] + '/' + String(d.getFullYear()).slice(2)
    if (!consumoMensalMap[mes]) consumoMensalMap[mes] = { mes, entradas: 0, saidas: 0 }
    if (m.tipo === 'entrada') consumoMensalMap[mes].entradas += Number(m.quantidade)
    if (m.tipo === 'saida')   consumoMensalMap[mes].saidas   += Number(m.quantidade)
  })
  const consumoMensal = Object.values(consumoMensalMap)

  // Top medicamentos — soma saídas por medicamento
  const topMedsMap = {}
  saidas.forEach(m => {
    if (!topMedsMap[m.medicamento]) topMedsMap[m.medicamento] = { nome: m.medicamento, quantidade: 0 }
    topMedsMap[m.medicamento].quantidade += Number(m.quantidade)
  })
  const topMeds = Object.values(topMedsMap)
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 5)

  if (loading) return <div className={styles.loading}>Carregando...</div>

  return (
    <div className={styles.page}>

      <section className={styles.stats}>
        <StatCard label="Total de Medicamentos" value={medicamentos.length}   icon={Pill}          color="accent"  />
        <StatCard label="Estoque Baixo/Crítico"  value={baixoEstoque.length}  icon={AlertTriangle} color="warning" />
        <StatCard label="Movimentações"          value={movimentacoes.length} icon={Package}       color="success" />
        <StatCard label="Prescrições Ativas"     value={prescAtivasCount}     icon={ClipboardList} color="accent"  />
      </section>

      <section className={styles.charts}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Movimentações por Mês</h2>
          {consumoMensal.length === 0
            ? <p className={styles.vazio}>Nenhuma movimentação registrada ainda.</p>
            : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={consumoMensal}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="mes" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text)', fontSize: 13 }} />
                  <Bar dataKey="entradas" name="Entradas" fill="#2dd98f" radius={[4,4,0,0]} />
                  <Bar dataKey="saidas"   name="Saídas"   fill="#14328C" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Top Medicamentos (Saídas)</h2>
          {topMeds.length === 0
            ? <p className={styles.vazio}>Nenhuma saída registrada ainda.</p>
            : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topMeds} layout="vertical">
                  <XAxis type="number" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="nome" type="category" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} width={110} />
                  <Tooltip contentStyle={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text)', fontSize: 13 }} />
                  <Bar dataKey="quantidade" name="Unidades" fill="#14328C" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>
      </section>

      <section className={styles.tables}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Entradas Recentes</h2>
          {entradas.length === 0
            ? <p className={styles.vazio}>Nenhuma entrada registrada.</p>
            : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Medicamento</th>
                    <th>Qtd</th>
                    <th>Data</th>
                    <th>Responsável</th>
                  </tr>
                </thead>
                <tbody>
                  {entradas.map(e => (
                    <tr key={e.id}>
                      <td>{e.medicamento}</td>
                      <td className={styles.mono}>{e.quantidade}</td>
                      <td>{e.data}</td>
                      <td>{e.responsavel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Estoque Crítico</h2>
          {baixoEstoque.length === 0
            ? <p className={styles.vazio}>Nenhum item em estoque crítico.</p>
            : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Medicamento</th>
                    <th>Atual</th>
                    <th>Mínimo</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {baixoEstoque.map(m => (
                    <tr key={m.id}>
                      <td>{m.nome} {m.dosagem}</td>
                      <td className={styles.mono}>{m.estoque_atual}</td>
                      <td className={styles.mono}>{m.estoque_minimo}</td>
                      <td>
                        <Badge variant={m.estoque_atual === 0 ? 'danger' : 'warning'}>
                          {m.estoque_atual === 0 ? 'Crítico' : 'Baixo'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>
      </section>
    </div>
  )
}