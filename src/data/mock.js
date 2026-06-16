// =====================
// MEDICAMENTOS
// =====================
export const medicamentos = [
  {
    id: 1,
    nome: 'Paracetamol',
    principioAtivo: 'Paracetamol',
    dosagem: '500mg',
    unidade: 'comprimido',
    fabricante: 'EMS',
    lote: 'L2024001',
    validade: '2026-08-01',
    estoqueAtual: 240,
    estoqueMinimo: 50,
    status: 'normal',
  },
  {
    id: 2,
    nome: 'Amoxicilina',
    principioAtivo: 'Amoxicilina tri-hidratada',
    dosagem: '500mg',
    unidade: 'cápsula',
    fabricante: 'Medley',
    lote: 'L2024022',
    validade: '2025-12-01',
    estoqueAtual: 18,
    estoqueMinimo: 30,
    status: 'baixo',
  },
  {
    id: 3,
    nome: 'Ibuprofeno',
    principioAtivo: 'Ibuprofeno',
    dosagem: '400mg',
    unidade: 'comprimido',
    fabricante: 'Eurofarma',
    lote: 'L2024045',
    validade: '2026-03-15',
    estoqueAtual: 90,
    estoqueMinimo: 40,
    status: 'normal',
  },
  {
    id: 4,
    nome: 'Dipirona',
    principioAtivo: 'Metamizol sódico',
    dosagem: '500mg',
    unidade: 'comprimido',
    fabricante: 'Medley',
    lote: 'L2024060',
    validade: '2026-06-01',
    estoqueAtual: 5,
    estoqueMinimo: 60,
    status: 'critico',
  },
  {
    id: 5,
    nome: 'Omeprazol',
    principioAtivo: 'Omeprazol',
    dosagem: '20mg',
    unidade: 'cápsula',
    fabricante: 'EMS',
    lote: 'L2024081',
    validade: '2027-01-01',
    estoqueAtual: 130,
    estoqueMinimo: 30,
    status: 'normal',
  },
]

// =====================
// MOVIMENTAÇÕES ESTOQUE
// =====================
export const movimentacoes = [
  { id: 1, tipo: 'entrada', medicamentoId: 1, medicamento: 'Paracetamol 500mg', quantidade: 200, data: '2025-09-01', responsavel: 'Carla M.', observacao: 'Compra mensal' },
  { id: 2, tipo: 'saida',   medicamentoId: 1, medicamento: 'Paracetamol 500mg', quantidade: 30,  data: '2025-09-05', destino: 'Ala A', responsavel: 'João P.', observacao: '' },
  { id: 3, tipo: 'entrada', medicamentoId: 3, medicamento: 'Ibuprofeno 400mg',  quantidade: 100, data: '2025-09-03', responsavel: 'Carla M.', observacao: '' },
  { id: 4, tipo: 'saida',   medicamentoId: 2, medicamento: 'Amoxicilina 500mg', quantidade: 12,  data: '2025-09-08', destino: 'UTI', responsavel: 'Paula R.', observacao: 'Urgência' },
  { id: 5, tipo: 'entrada', medicamentoId: 5, medicamento: 'Omeprazol 20mg',    quantidade: 150, data: '2025-09-10', responsavel: 'Carla M.', observacao: '' },
]

// =====================
// PRESCRIÇÕES
// =====================
export const prescricoes = [
  {
    id: 1,
    paciente: 'Maria S.',
    medicamentoId: 1,
    medicamento: 'Paracetamol 500mg',
    dosagem: '500mg',
    intervaloHoras: 8,
    duracaoDias: 7,
    totalDoses: 21,
    totalUnidades: 21,
    data: '2025-09-10',
    status: 'ativa',
  },
  {
    id: 2,
    paciente: 'Roberto F.',
    medicamentoId: 2,
    medicamento: 'Amoxicilina 500mg',
    dosagem: '500mg',
    intervaloHoras: 12,
    duracaoDias: 10,
    totalDoses: 20,
    totalUnidades: 20,
    data: '2025-09-08',
    status: 'ativa',
  },
]

// =====================
// CHARTDATA
// =====================
export const consumoMensal = [
  { mes: 'Abr', unidades: 320 },
  { mes: 'Mai', unidades: 410 },
  { mes: 'Jun', unidades: 380 },
  { mes: 'Jul', unidades: 520 },
  { mes: 'Ago', unidades: 490 },
  { mes: 'Set', unidades: 610 },
]

export const consumoPorMedicamento = [
  { nome: 'Paracetamol', quantidade: 230 },
  { nome: 'Dipirona',    quantidade: 180 },
  { nome: 'Amoxicilina', quantidade: 120 },
  { nome: 'Ibuprofeno',  quantidade: 90 },
  { nome: 'Omeprazol',   quantidade: 60 },
]

export const estoqueVsMinimo = [
  { nome: 'Paracetamol', atual: 240, minimo: 50 },
  { nome: 'Amoxicilina', atual: 18,  minimo: 30 },
  { nome: 'Ibuprofeno',  atual: 90,  minimo: 40 },
  { nome: 'Dipirona',    atual: 5,   minimo: 60 },
  { nome: 'Omeprazol',   atual: 130, minimo: 30 },
]

export const prescricoesPorMes = [
  { mes: 'Abr', prescricoes: 8  },
  { mes: 'Mai', prescricoes: 12 },
  { mes: 'Jun', prescricoes: 9  },
  { mes: 'Jul', prescricoes: 17 },
  { mes: 'Ago', prescricoes: 14 },
  { mes: 'Set', prescricoes: 21 },
]
