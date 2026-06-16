import { Pill, Package, ClipboardList, AlertTriangle } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts'
import StatCard from '../../components/ui/StatCard.jsx'
import Badge from '../../components/ui/Badge.jsx'
import {
  medicamentos,
  movimentacoes,
  consumoMensal,
  consumoPorMedicamento,
} from '../../data/mock.js'
import styles from './Dashboard.module.css'

const baixoEstoque = medicamentos.filter(m => m.estoqueAtual <= m.estoqueMinimo)
const entradas = movimentacoes.filter(m => m.tipo === 'entrada').slice(0, 4)
const saidas   = movimentacoes.filter(m => m.tipo === 'saida').slice(0, 4)

export default function Dashboard() {
  return (
    <div className={styles.page}>

      {/* Stats */}
      <section className={styles.stats}>
        <StatCard
          label="Total de Medicamentos"
          value={medicamentos.length}
          icon={Pill}
          color="accent"
        />
        <StatCard
          label="Itens em Estoque Baixo"
          value={baixoEstoque.length}
          icon={AlertTriangle}
          color="warning"
        />
        <StatCard
          label="Movimentações (mês)"
          value={movimentacoes.length}
          icon={Package}
          color="success"
        />
        <StatCard
          label="Prescrições Ativas"
          value={2}
          icon={ClipboardList}
          color="accent"
        />
      </section>

      {/* Charts */}
      <section className={styles.charts}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Consumo Mensal</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={consumoMensal}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="mes" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  color: 'var(--color-text)',
                  fontSize: 13,
                }}
              />
              <Line type="monotone" dataKey="unidades" stroke="var(--color-accent)" strokeWidth={2} dot={{ fill: 'var(--color-accent)', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Top Medicamentos</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={consumoPorMedicamento} layout="vertical">
              <XAxis type="number" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="nome" type="category" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  color: 'var(--color-text)',
                  fontSize: 13,
                }}
              />
              <Bar dataKey="quantidade" fill="var(--color-accent)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Tables */}
      <section className={styles.tables}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Entradas Recentes</h2>
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
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Estoque Crítico</h2>
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
                  <td className={styles.mono}>{m.estoqueAtual}</td>
                  <td className={styles.mono}>{m.estoqueMinimo}</td>
                  <td>
                    <Badge variant={m.status === 'critico' ? 'danger' : 'warning'}>
                      {m.status === 'critico' ? 'Crítico' : 'Baixo'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
