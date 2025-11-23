import { useState, useEffect } from 'react';
import SupabaseAuthService from '../services/SupabaseAuthService';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Limpa erro ao montar componente
  useEffect(() => {
    setErro('');
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    if (!email || !senha) {
      setErro('Fill in all fields');
      setCarregando(false);
      return;
    }

    try {
      console.log('Tentando login com:', email);
      const usuario = await SupabaseAuthService.login(email, senha);
      console.log('Resultado do login:', usuario);
      
      if (usuario) {
        console.log('Login bem-sucedido, redirecionando...');
        // forcar recarregamento completo da pagina para o contexto atualizar
        window.location.href = '/';
      } else {
        setErro('Incorrect email or password');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setErro('Login error. Please try again.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>📚 English Study Tracker</h1>
        <h2>Login</h2>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              autoComplete="off"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              autoComplete="off"
            />
          </div>

          {erro && <div className="erro-mensagem">{erro}</div>}

          <button type="submit" className="btn-primary" disabled={carregando}>
            {carregando ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p className="texto-info">
            💡 You will receive your credentials by email after purchasing the course.
          </p>
        </div>
      </div>
    </div>
  );
}
