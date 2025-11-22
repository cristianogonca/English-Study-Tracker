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
    
    // Buscar role do users_profile
    let role: 'aluno' | 'professor' | 'admin' = 'aluno';
    if (data.user) {
      const { data: profileData } = await supabase
        .from('users_profile')
        .select('role')
        .eq('id', data.user.id)
        .single();
      
      if (profileData?.role) {
        role = profileData.role as 'aluno' | 'professor' | 'admin';
      }
    }
    
    console.log('[SupabaseAuth] Login bem-sucedido:', data.user?.id, 'Role:', role);
    return { ...data.user, role };
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
    
    // Criar users_profile com role padrão 'aluno'
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users_profile')
        .insert({
          id: data.user.id,
          nome,
          role: 'aluno'
        });
      
      if (profileError) {
        console.error('[SupabaseAuth] Erro ao criar profile:', profileError);
      }
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
      
      if (!user) return null;
      
      // Buscar role do users_profile
      const { data: profileData } = await supabase
        .from('users_profile')
        .select('role')
        .eq('id', user.id)
        .single();
      
      const role = profileData?.role || 'aluno';
      
      return { ...user, role };
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
  },

  async trocarSenha(senhaAtual: string, novaSenha: string) {
    try {
      // 1. Reautenticar com senha atual para validar
      const user = await this.getUsuarioAtual();
      if (!user?.email) {
        console.error('[SupabaseAuth] Usuário não encontrado');
        return false;
      }

      // Tentar fazer login com senha atual para validar
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: senhaAtual
      });

      if (loginError) {
        console.error('[SupabaseAuth] Senha atual incorreta:', loginError);
        return false;
      }

      // 2. Atualizar para nova senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: novaSenha
      });

      if (updateError) {
        console.error('[SupabaseAuth] Erro ao atualizar senha:', updateError);
        return false;
      }

      console.log('[SupabaseAuth] Senha trocada com sucesso');
      return true;
    } catch (error) {
      console.error('[SupabaseAuth] EXCEÇÃO ao trocar senha:', error);
      return false;
    }
  }
};

export default SupabaseAuthService;