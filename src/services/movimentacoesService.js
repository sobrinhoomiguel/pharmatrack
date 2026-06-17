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
  console.log('Criando movimentação:', mov)

  const { data, error } = await supabase
    .from('movimentacoes')
    .insert([{
      tipo:           mov.tipo,
      medicamento:    mov.medicamento,
      medicamento_id: mov.medicamento_id,
      quantidade:     mov.quantidade,
      data:           mov.data,
      responsavel:    mov.responsavel,
      destino:        mov.destino,
      observacao:     mov.observacao,
    }])
    .select()

  if (error) {
    console.error('Erro ao salvar movimentação:', error)
    throw error
  }

  console.log('Movimentação salva. Buscando medicamento id:', mov.medicamento_id)

  const { data: med, error: errMed } = await supabase
    .from('medicamentos')
    .select('id, estoque_atual')
    .eq('id', mov.medicamento_id)
    .single()

  if (errMed) {
    console.error('Erro ao buscar medicamento:', errMed)
  }

  if (!errMed && med) {
    const novoEstoque = mov.tipo === 'entrada'
      ? Number(med.estoque_atual) + Number(mov.quantidade)
      : Math.max(0, Number(med.estoque_atual) - Number(mov.quantidade))

    console.log('Estoque atual:', med.estoque_atual, '-> Novo estoque:', novoEstoque)

    const { error: errUpdate } = await supabase
      .from('medicamentos')
      .update({ estoque_atual: novoEstoque })
      .eq('id', med.id)

    if (errUpdate) {
      console.error('Erro ao atualizar estoque:', errUpdate)
    } else {
      console.log('Estoque atualizado com sucesso!')
    }
  }

  return data[0]
}