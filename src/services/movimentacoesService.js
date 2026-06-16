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
  const { data, error } = await supabase
    .from('movimentacoes')
    .insert([mov])
    .select()
  if (error) throw error
  return data[0]
}