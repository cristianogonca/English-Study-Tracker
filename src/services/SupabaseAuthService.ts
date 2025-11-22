import { supabase } from '../lib/supabase';

const SupabaseAuthService = {
  async login(email: string, senha: string) {
    console.log('[SupabaseAuth] login() chamado para:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha
    });
    
    if (error) {
      console.error('[SupabaseAuth] Erro no login:', error);
      throw new Error(error.message);
    }
    
    console.log('[SupabaseAuth] Login bem-sucedido:', data.user?.id);
    return data.user;
  },

  async registro(email: string, senha: string, nome: string) {
    console.log('[SupabaseAuth] registro() chamado para:', email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: {
          nome
        }
      }
    });
    
    if (error) {
      console.error('[SupabaseAuth] Erro no registro:', error);
      throw new Error(error.message);
    }
    
    console.log('[SupabaseAuth] Registro bem-sucedido:', data.user?.id);
    return data.user;
  },

  async logout() {
    console.log('[SupabaseAuth] logout() chamado');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[SupabaseAuth] Erro no logout:', error);
      throw new Error(error.message);
    }
    console.log('[SupabaseAuth] Logout bem-sucedido');
  },

  async getUsuarioAtual() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('[SupabaseAuth] Erro ao buscar usuário:', error);
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('[SupabaseAuth] EXCEÇÃO ao buscar usuário:', error);
      return null;
    }
  },

  async obterSessao() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('[SupabaseAuth] Erro ao buscar sessão:', error);
        return null;
      }
      return session;
    } catch (error) {
      console.error('[SupabaseAuth] EXCEÇÃO ao buscar sessão:', error);
      return null;
    }
  }
};

export default SupabaseAuthService;