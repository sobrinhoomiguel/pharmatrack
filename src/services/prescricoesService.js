import { supabase } from './supabase'
import { getCompanyId } from './getCompanyId'

// LISTAR PRESCRIÇÕES
export const getPrescricoes = async () => {
  const companyId = await getCompanyId()

  const { data, error } = await supabase
    .from('prescricoes')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// CRIAR PRESCRIÇÃO
export const createPrescricao = async (pres) => {
  const companyId = await getCompanyId()

  const { data, error } = await supabase
    .from('prescricoes')
    .insert([{
      ...pres,
      company_id: companyId
    }])
    .select()

  if (error) throw error
  return data[0]
}

// ATUALIZAR PRESCRIÇÃO
export const updatePrescricao = async (id, pres) => {
  const companyId = await getCompanyId()

  const { data, error } = await supabase
    .from('prescricoes')
    .update(pres)
    .eq('id', id)
    .eq('company_id', companyId)
    .select()

  if (error) throw error
  return data[0]
}