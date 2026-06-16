import { supabase } from './supabase'

export const getMedicamentos = async () => {
  const { data, error } = await supabase
    .from('medicamentos')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const createMedicamento = async (med) => {
  const { data, error } = await supabase
    .from('medicamentos')
    .insert([med])
    .select()
  if (error) throw error
  return data[0]
}

export const updateMedicamento = async (id, med) => {
  const { data, error } = await supabase
    .from('medicamentos')
    .update(med)
    .eq('id', id)
    .select()
  if (error) throw error
  return data[0]
}

export const deleteMedicamento = async (id) => {
  const { error } = await supabase
    .from('medicamentos')
    .delete()
    .eq('id', id)
  if (error) throw error
}