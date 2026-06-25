// src/services/medicamentosService.js
// RLS já filtra por company_id automaticamente — não precisa passar manual

import { supabase } from './supabase'

export const getMedicamentos = async () => {
  const { data, error } = await supabase
    .from('medicamentos')
    .select('*')
    .order('nome', { ascending: true })

  if (error) throw error
  return data
}

export const createMedicamento = async (campos) => {
  // Pega company_id do profile do usuário logado via view
  const { data: perfil, error: perfilError } = await supabase
    .from('my_profile')
    .select('company_id')
    .single()

  if (perfilError) throw perfilError

  const { data, error } = await supabase
    .from('medicamentos')
    .insert({ ...campos, company_id: perfil.company_id })
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateMedicamento = async (id, campos) => {
  const { data, error } = await supabase
    .from('medicamentos')
    .update(campos)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteMedicamento = async (id) => {
  const { error } = await supabase
    .from('medicamentos')
    .delete()
    .eq('id', id)

  if (error) throw error
}