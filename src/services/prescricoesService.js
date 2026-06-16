import { supabase } from './supabase'

export const getPrescricoes = async () => {
  const { data, error } = await supabase
    .from('prescricoes')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const createPrescricao = async (pres) => {
  const { data, error } = await supabase
    .from('prescricoes')
    .insert([pres])
    .select()
  if (error) throw error
  return data[0]
}

export const updatePrescricao = async (id, pres) => {
  const { data, error } = await supabase
    .from('prescricoes')
    .update(pres)
    .eq('id', id)
    .select()
  if (error) throw error
  return data[0]
}