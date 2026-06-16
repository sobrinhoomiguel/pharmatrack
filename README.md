# PharmaTrack

Sistema administrativo farmacêutico desenvolvido com React + Vite.

## Stack

- **React 18** + Vite
- **React Router DOM** — navegação
- **React Hook Form** + **Zod** — formulários e validação
- **TanStack Table** — tabelas (preparado para uso nos próximos módulos)
- **Recharts** — gráficos e dashboards
- **Lucide React** — ícones
- **CSS Modules** — estilos isolados por componente

## Como rodar

```bash
npm install
npm run dev
```

## Estrutura

```
src/
├── components/
│   ├── layout/      # Layout, Sidebar, Header
│   └── ui/          # Button, Badge, StatCard
├── pages/
│   ├── Dashboard/
│   ├── Medicamentos/
│   ├── Estoque/
│   ├── Prescricoes/
│   ├── Relatorios/
│   └── Usuarios/
├── data/
│   └── mock.js      # Dados de desenvolvimento
├── styles/
│   └── global.css   # Tokens e reset
└── App.jsx
```

## Módulos implementados

- ✅ Dashboard com gráficos e indicadores
- ✅ Medicamentos — CRUD completo com validação Zod
- ✅ Estoque — registro de entradas e saídas
- ✅ Prescrições — cálculo automático de doses e unidades
- ✅ Relatórios — gráficos de consumo (base)
- ✅ Usuários — listagem (base)

## Próximos passos

- [ ] Integração com backend / API
- [ ] Autenticação
- [ ] Importação de Excel
- [ ] TanStack Table nas listagens
- [ ] QR Code
- [ ] Assinatura digital
