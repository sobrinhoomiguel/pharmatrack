import { BarChart3 } from 'lucide-react'
import styles from './Relatorios.module.css'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { consumoPorMedicamento, consumoMensal } from '../../data/mock.js'

const COLORS = ['#4f7fff', '#2dd98f', '#f5a623', '#e84040', '#a78bfa']

export default function Relatorios() {
  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        <div className={styles.card}>
          <h2 className={styles.title}>Consumo por Medicamento</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={consumoPorMedicamento}>
              <XAxis dataKey="nome" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text)', fontSize: 13 }} />
              <Bar dataKey="quantidade" radius={[4, 4, 0, 0]}>
                {consumoPorMedicamento.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.card}>
          <h2 className={styles.title}>Distribuição de Consumo</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={consumoPorMedicamento} dataKey="quantidade" nameKey="nome" cx="50%" cy="50%" outerRadius={100} label>
                {consumoPorMedicamento.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 12, color: 'var(--color-text-muted)' }} />
              <Tooltip contentStyle={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.comingSoon}>
        <BarChart3 size={32} className={styles.icon} />
        <p>Importação de Excel e relatórios avançados em breve.</p>
      </div>
    </div>
  )
}
