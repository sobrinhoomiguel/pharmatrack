// src/services/prescricoesService.js
// RLS filtra company_id automaticamente — sem necessidade de getCompanyId

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
  // Pega company_id da view do usuário logado
  const { data: perfil, error: perfilError } = await supabase
    .from('my_profile')
    .select('company_id')
    .single()

  if (perfilError) throw perfilError

  const { data, error } = await supabase
    .from('prescricoes')
    .insert([{ ...pres, company_id: perfil.company_id }])
    .select()
    .single()

  if (error) throw error
  return data
}

export const updatePrescricao = async (id, pres) => {
  const { data, error } = await supabase
    .from('prescricoes')
    .update(pres)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}