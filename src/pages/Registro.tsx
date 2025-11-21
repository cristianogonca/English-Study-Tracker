import { useState } from 'react';
import { Link } from 'react-router-dom';
import SupabaseAuthService from '../services/SupabaseAuthService';
import './Login.css';

export default function Registro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    if (!nome || !email || !senha || !confirmarSenha) {
      setErro('Preencha todos os campos');
      setCarregando(false);
      return;
    }

    if (senha.length < 6) {
      setErro('Senha deve ter no mínimo 6 caracteres');
      setCarregando(false);
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem');
      setCarregando(false);
      return;
    }

    try {
      const usuario = await SupabaseAuthService.registrar(email, senha, nome);
      
      if (!usuario) {
        setErro('Este email já está cadastrado ou ocorreu um erro');
        setCarregando(false);
        return;
      }

      console.log('Registro bem-sucedido, redirecionando...');
      // forcar recarregamento completo da pagina para o contexto atualizar
      window.location.href = '/setup';
    } catch (error) {
      console.error('Erro ao registrar:', error);
      setErro('Erro ao criar conta. Tente novamente.');
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>📚 English Study Tracker</h1>
        <h2>Criar Conta</h2>
        
        <form onSubmit={handleRegistro}>
          <div className="form-group">
            <label>Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome completo"
              autoComplete="off"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label>Confirmar Senha</label>
            <input
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Digite a senha novamente"
              autoComplete="new-password"
            />
          </div>

          {erro && <div className="erro-mensagem">{erro}</div>}

          <button type="submit" className="btn-primary" disabled={carregando}>
            {carregando ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <div className="login-footer">
          <p>Já tem conta? <Link to="/login">Fazer login</Link></p>
        </div>
      </div>
    </div>
  );
}
