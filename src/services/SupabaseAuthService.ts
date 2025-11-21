import { supabase, isSupabaseConfigured } from '../lib/supabase';
import AuthService from './AuthService';
import type { Usuario, SessaoAuth } from '../types';

class SupabaseAuthService {
  private readonly SESSAO_KEY = 'english_tracker_sessao';
  private authChangeCallback: ((user: Usuario | null) => void) | null = null;

  constructor() {
    // Listener para mudanças de autenticação
    if (isSupabaseConfigured()) {
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const usuario = await this.getUserFromSupabase(session.user.id);
          this.authChangeCallback?.(usuario);
        } else if (event === 'SIGNED_OUT') {
          this.authChangeCallback?.(null);
        }
      });
    }
  }

  // ============================================
  // REGISTRO
  // ============================================
  async registrar(email: string, senha: string, nome: string): Promise<Usuario | null> {
    // Fallback para localStorage se Supabase não configurado
    if (!isSupabaseConfigured()) {
      return AuthService.registrar(email, senha, nome);
    }

    try {
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            nome: nome,
          },
        },
      });

      if (authError || !authData.user) {
        console.error('Erro ao registrar:', authError);
        return null;
      }

      const usuario: Usuario = {
        id: authData.user.id,
        email: authData.user.email!,
        senha: '', // Não armazenamos senha com Supabase
        nome: nome,
        dataCriacao: new Date().toISOString(),
        ultimoAcesso: new Date().toISOString(),
      };

      // Criar sessão
      const sessao: SessaoAuth = {
        usuarioId: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        dataLogin: new Date().toISOString(),
      };
      localStorage.setItem(this.SESSAO_KEY, JSON.stringify(sessao));

      return usuario;
    } catch (error) {
      console.error('Erro ao registrar:', error);
      return null;
    }
  }

  // ============================================
  // LOGIN
  // ============================================
  async login(email: string, senha: string): Promise<Usuario | null> {
    // Fallback para localStorage se Supabase não configurado
    if (!isSupabaseConfigured()) {
      const sucesso = AuthService.login(email, senha);
      if (!sucesso) return null;
      return AuthService.getUsuarioLogado();
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error || !data.user) {
        console.error('Erro ao fazer login:', error);
        return null;
      }

      const usuario = await this.getUserFromSupabase(data.user.id);
      
      if (usuario) {
        // Criar sessão
        const sessao: SessaoAuth = {
          usuarioId: usuario.id,
          email: usuario.email,
          nome: usuario.nome,
          dataLogin: new Date().toISOString(),
        };
        localStorage.setItem(this.SESSAO_KEY, JSON.stringify(sessao));
      }

      return usuario;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return null;
    }
  }

  // ============================================
  // LOGOUT
  // ============================================
  async logout(): Promise<void> {
    if (!isSupabaseConfigured()) {
      AuthService.logout();
      return;
    }

    try {
      await supabase.auth.signOut();
      localStorage.removeItem(this.SESSAO_KEY);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  // ============================================
  // OBTER USUÁRIO ATUAL
  // ============================================
  async getUsuarioAtual(): Promise<Usuario | null> {
    if (!isSupabaseConfigured()) {
      return AuthService.getUsuarioLogado();
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      return await this.getUserFromSupabase(user.id);
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      return null;
    }
  }

  // ============================================
  // OBTER SESSÃO
  // ============================================
  getSessao(): SessaoAuth | null {
    const sessaoStr = localStorage.getItem(this.SESSAO_KEY);
    if (!sessaoStr) return null;
    
    try {
      return JSON.parse(sessaoStr);
    } catch {
      return null;
    }
  }

  // ============================================
  // TROCAR SENHA
  // ============================================
  async trocarSenha(senhaAtual: string, novaSenha: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      console.error('Supabase não configurado');
      return false;
    }

    try {
      // Primeiro, verificar senha atual fazendo re-autenticação
      const usuario = await this.getUsuarioAtual();
      if (!usuario) return false;

      // Tentar login com senha atual para validar
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: usuario.email,
        password: senhaAtual,
      });

      if (loginError) {
        console.error('Senha atual incorreta');
        return false;
      }

      // Atualizar senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: novaSenha,
      });

      if (updateError) {
        console.error('Erro ao atualizar senha:', updateError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao trocar senha:', error);
      return false;
    }
  }

  // ============================================
  // VERIFICAR SE ESTÁ LOGADO
  // ============================================
  async estaLogado(): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      return AuthService.estaLogado();
    }

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Erro ao verificar sessão:', error);
        return false;
      }
      return !!session;
    } catch (error) {
      console.error('Erro ao verificar se está logado:', error);
      return false;
    }
  }

  // ============================================
  // ON AUTH STATE CHANGE
  // ============================================
  onAuthStateChange(callback: (user: Usuario | null) => void) {
    this.authChangeCallback = callback;
  }

  // ============================================
  // HELPER: Obter usuário do Supabase
  // ============================================
  private async getUserFromSupabase(_userId: string): Promise<Usuario | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      return {
        id: user.id,
        email: user.email!,
        senha: '',
        nome: user.user_metadata?.nome || user.email!.split('@')[0],
        dataCriacao: user.created_at,
        ultimoAcesso: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Erro ao obter usuário do Supabase:', error);
      return null;
    }
  }
}

// Export singleton
export default new SupabaseAuthService();
