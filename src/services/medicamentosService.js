import { supabase } from './supabase'

// Função auxiliar para pegar a empresa do usuário logado
export const getCompanyId = async () => {
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError) throw userError

  const { data, error } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', userData.user.id)
    .single()

  if (error) throw error

  return data.company_id
}

// LISTAR MEDICAMENTOS
export const getMedicamentos = async () => {
  const companyId = await getCompanyId()

  const { data, error } = await supabase
    .from('medicamentos')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// CRIAR MEDICAMENTO
export const createMedicamento = async (med) => {
  const companyId = await getCompanyId()

  const { data, error } = await supabase
    .from('medicamentos')
    .insert([
      {
        ...med,
        company_id: companyId
      }
    ])
    .select()

  if (error) throw error
  return data[0]
}

// ATUALIZAR MEDICAMENTO
export const updateMedicamento = async (id, med) => {
  const companyId = await getCompanyId()

  const { data, error } = await supabase
    .from('medicamentos')
    .update(med)
    .eq('id', id)
    .eq('company_id', companyId)
    .select()

  if (error) throw error
  return data[0]
}

// DELETAR MEDICAMENTO
export const deleteMedicamento = async (id) => {
  const companyId = await getCompanyId()

  const { error } = await supabase
    .from('medicamentos')
    .delete()
    .eq('id', id)
    .eq('company_id', companyId)

  if (error) throw error
}