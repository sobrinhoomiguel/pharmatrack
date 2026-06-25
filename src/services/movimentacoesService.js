// src/services/movimentacoesService.js
// RLS filtra company_id automaticamente — sem necessidade de getCompanyId

import { supabase } from './supabase'

export const getMovimentacoes = async () => {
  const { data, error } = await supabase
    .from('movimentacoes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export const createMovimentacao = async (mov) => {
  // Pega company_id da view do usuário logado
  const { data: perfil, error: perfilError } = await supabase
    .from('my_profile')
    .select('company_id')
    .single()

  if (perfilError) throw perfilError

  const companyId = perfil.company_id

  // 1. Insere movimentação
  const { data, error } = await supabase
    .from('movimentacoes')
    .insert([{ ...mov, company_id: companyId }])
    .select()
    .single()

  if (error) throw error

  // 2. Busca estoque atual do medicamento
  const { data: med, error: errMed } = await supabase
    .from('medicamentos')
    .select('id, estoque_atual')
    .eq('id', mov.medicamento_id)
    .single()

  if (errMed) {
    console.error('Erro ao buscar medicamento:', errMed)
    return data
  }

  // 3. Atualiza estoque
  const novoEstoque =
    mov.tipo === 'entrada'
      ? Number(med.estoque_atual) + Number(mov.quantidade)
      : Math.max(0, Number(med.estoque_atual) - Number(mov.quantidade))

  const { error: errUpdate } = await supabase
    .from('medicamentos')
    .update({ estoque_atual: novoEstoque })
    .eq('id', med.id)

  if (errUpdate) console.error('Erro ao atualizar estoque:', errUpdate)

  return data
}