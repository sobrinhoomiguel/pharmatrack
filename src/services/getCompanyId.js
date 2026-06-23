import { supabase } from './supabase'

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