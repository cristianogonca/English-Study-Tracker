import { Usuario, SessaoAuth } from '../types';

const USUARIOS_KEY = 'english_study_usuarios';
const SESSAO_KEY = 'english_study_sessao';

class AuthService {
  // registrar novo usuario
  registrar(email: string, senha: string, nome: string): Usuario | null {
    const usuarios = this.getUsuarios();
    
    // verificar se email ja existe
    if (usuarios.find(u => u.email === email)) {
      return null;
    }

    const novoUsuario: Usuario = {
      id: this.gerarId(),
      email: email.toLowerCase(),
      senha, // em producao deveria usar hash
      nome,
      dataCriacao: new Date().toISOString(),
      ultimoAcesso: new Date().toISOString()
    };

    usuarios.push(novoUsuario);
    localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios));
    
    return novoUsuario;
  }

  // fazer login
  login(email: string, senha: string): boolean {
    const usuarios = this.getUsuarios();
    const usuario = usuarios.find(u => u.email === email.toLowerCase() && u.senha === senha);
    
    if (!usuario) {
      return false;
    }

    // atualizar ultimo acesso
    usuario.ultimoAcesso = new Date().toISOString();
    localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios));

    // criar sessao
    const sessao: SessaoAuth = {
      usuarioId: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      dataLogin: new Date().toISOString()
    };
    
    localStorage.setItem(SESSAO_KEY, JSON.stringify(sessao));
    return true;
  }

  // fazer logout
  logout(): void {
    localStorage.removeItem(SESSAO_KEY);
  }

  // obter sessao atual
  getSessao(): SessaoAuth | null {
    const sessaoStr = localStorage.getItem(SESSAO_KEY);
    if (!sessaoStr) return null;
    return JSON.parse(sessaoStr);
  }

  // verificar se esta logado
  estaLogado(): boolean {
    return this.getSessao() !== null;
  }

  // obter usuario logado
  getUsuarioLogado(): Usuario | null {
    const sessao = this.getSessao();
    if (!sessao) return null;

    const usuarios = this.getUsuarios();
    return usuarios.find(u => u.id === sessao.usuarioId) || null;
  }

  // obter todos os usuarios
  private getUsuarios(): Usuario[] {
    const usuariosStr = localStorage.getItem(USUARIOS_KEY);
    if (!usuariosStr) return [];
    return JSON.parse(usuariosStr);
  }

  // gerar ID unico
  private gerarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}

export default new AuthService();
