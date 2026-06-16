import { supabase } from './supabase'

export const login = async (email, senha) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
  if (error) throw error
  return data
}

export const logout = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getSession = async () => {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export const getUsuarios = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export const criarUsuario = async (email, senha, nome, cargo) => {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome, cargo }
  })
  if (error) throw error
  return data
}