// src/hooks/useAuth.js
// Hook central de autenticação do PharmaTrack SaaS
// Gerencia: login, logout, sessão, profile + empresa

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from '../services/supabase';

// ─── Context ───────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}

// ─── Hook principal ────────────────────────────────────────
function useProvideAuth() {
  const [user,    setUser]    = useState(null);   // auth.users
  const [profile, setProfile] = useState(null);   // profiles + company
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // ── Busca o perfil completo (view my_profile) ──
  const fetchProfile = useCallback(async (userId) => {
    if (!userId) return null;

    const { data, error } = await supabase
      .from('my_profile')
      .select('*')
      .single();

    if (error) {
      console.error('[useAuth] fetchProfile error:', error.message);
      return null;
    }
    return data;
  }, []);

  // ── Inicializa sessão existente ──
  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user && mounted) {
        setUser(session.user);
        const prof = await fetchProfile(session.user.id);
        if (mounted) setProfile(prof);
      }

      if (mounted) setLoading(false);
    }

    init();

    // Listener de mudanças de sessão
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          const prof = await fetchProfile(session.user.id);
          setProfile(prof);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // ── LOGIN ──────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setLoading(false);
      setError(translateAuthError(error.message));
      return { success: false, error: error.message };
    }

    // Profile é carregado pelo onAuthStateChange
    return { success: true, user: data.user };
  }, []);

  // ── REGISTRO SaaS (empresa nova + admin) ───────────────
  const registerCompany = useCallback(async ({
    email,
    password,
    nome,
    companyNome,
    companyCnpj = null,
  }) => {
    setError(null);
    setLoading(true);

    // 1. Cria usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome }, // metadata extra (opcional)
      },
    });

    if (authError) {
      setLoading(false);
      setError(translateAuthError(authError.message));
      return { success: false, error: authError.message };
    }

    const userId = authData.user?.id;
    if (!userId) {
      setLoading(false);
      setError('Erro ao obter ID do usuário.');
      return { success: false, error: 'no_user_id' };
    }

    // 2. Chama RPC que cria empresa + profile (security definer)
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      'register_company_and_admin',
      {
        p_user_id:      userId,
        p_user_email:   email,
        p_user_nome:    nome,
        p_company_nome: companyNome,
        p_company_cnpj: companyCnpj,
      }
    );

    if (rpcError) {
      // Auth foi criado mas profile falhou → tenta limpar
      await supabase.auth.signOut();
      setLoading(false);
      setError('Erro ao configurar empresa. Tente novamente.');
      return { success: false, error: rpcError.message };
    }

    // 3. Busca profile completo
    const prof = await fetchProfile(userId);
    setProfile(prof);
    setLoading(false);

    return { success: true, companyId: rpcData?.company_id };
  }, [fetchProfile]);

  // ── CONVIDAR USUÁRIO (admin convida membro) ───────────
  const inviteUser = useCallback(async ({
    email,
    password,
    nome,
    role = 'usuario',
  }) => {
    if (!profile?.company_id) return { success: false, error: 'Sem empresa vinculada' };

    setError(null);

    // 1. Admin cria o auth do novo usuário via Admin API (requer service_role no backend)
    // No frontend, usamos signUp normal + invite via RPC
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(translateAuthError(authError.message));
      return { success: false, error: authError.message };
    }

    const newUserId = authData.user?.id;

    // 2. RPC vincula o novo usuário à empresa do admin
    const { error: rpcError } = await supabase.rpc('invite_user_to_company', {
      p_user_id:    newUserId,
      p_user_email: email,
      p_user_nome:  nome,
      p_company_id: profile.company_id,
      p_role:       role,
    });

    if (rpcError) {
      setError('Erro ao vincular usuário à empresa.');
      return { success: false, error: rpcError.message };
    }

    return { success: true };
  }, [profile]);

  // ── LOGOUT ─────────────────────────────────────────────
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  // ── REFRESH PROFILE ────────────────────────────────────
  const refreshProfile = useCallback(async () => {
    if (!user?.id) return;
    const prof = await fetchProfile(user.id);
    setProfile(prof);
  }, [user, fetchProfile]);

  // ── Helpers de permissão ───────────────────────────────
  const isAdmin       = profile?.role === 'admin' || profile?.role === 'superadmin';
  const isFarmaceutico = profile?.role === 'farmaceutico';
  const companyAtiva  = profile?.company_status === 'ativo';

  return {
    // Estado
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user && !!profile,

    // Permissões
    isAdmin,
    isFarmaceutico,
    companyAtiva,

    // Ações
    login,
    logout,
    registerCompany,
    inviteUser,
    refreshProfile,
    setError,
  };
}

// ── Tradução de erros do Supabase ──────────────────────────
function translateAuthError(msg) {
  const map = {
    'Invalid login credentials':            'Email ou senha incorretos.',
    'Email not confirmed':                  'Confirme seu email antes de entrar.',
    'User already registered':              'Este email já está cadastrado.',
    'Password should be at least 6 characters': 'A senha deve ter no mínimo 6 caracteres.',
    'signup_disabled':                      'Novos cadastros estão desabilitados.',
  };

  for (const [key, value] of Object.entries(map)) {
    if (msg?.includes(key)) return value;
  }
  return 'Erro de autenticação. Tente novamente.';
}