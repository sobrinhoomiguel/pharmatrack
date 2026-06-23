import { supabase } from './supabase'
import { getCompanyId } from './getCompanyId'

// LISTAR MOVIMENTAÇÕES
export const getMovimentacoes = async () => {
  const companyId = await getCompanyId()

  const { data, error } = await supabase
    .from('movimentacoes')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// CRIAR MOVIMENTAÇÃO + ATUALIZAR ESTOQUE
export const createMovimentacao = async (mov) => {
  const companyId = await getCompanyId()

  console.log('Criando movimentação:', mov)

  // 1. inserir movimentação com company_id
  const { data, error } = await supabase
    .from('movimentacoes')
    .insert([{
      ...mov,
      company_id: companyId
    }])
    .select()

  if (error) {
    console.error('Erro ao salvar movimentação:', error)
    throw error
  }

  console.log('Movimentação salva. Buscando medicamento id:', mov.medicamento_id)

  // 2. buscar medicamento dentro da empresa
  const { data: med, error: errMed } = await supabase
    .from('medicamentos')
    .select('id, estoque_atual')
    .eq('id', mov.medicamento_id)
    .eq('company_id', companyId)
    .single()

  if (errMed) {
    console.error('Erro ao buscar medicamento:', errMed)
  }

  // 3. atualizar estoque
  if (!errMed && med) {
    const novoEstoque =
      mov.tipo === 'entrada'
        ? Number(med.estoque_atual) + Number(mov.quantidade)
        : Math.max(0, Number(med.estoque_atual) - Number(mov.quantidade))

    console.log('Estoque atual:', med.estoque_atual, '-> Novo estoque:', novoEstoque)

    const { error: errUpdate } = await supabase
      .from('medicamentos')
      .update({ estoque_atual: novoEstoque })
      .eq('id', med.id)
      .eq('company_id', companyId)

    if (errUpdate) {
      console.error('Erro ao atualizar estoque:', errUpdate)
    } else {
      console.log('Estoque atualizado com sucesso!')
    }
  }

  return data[0]
}