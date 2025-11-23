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
      setErro('Fill in all fields');
      setCarregando(false);
      return;
    }

    if (senha.length < 6) {
      setErro('Password must be at least 6 characters');
      setCarregando(false);
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('Passwords do not match');
      setCarregando(false);
      return;
    }

    try {
      const usuario = await SupabaseAuthService.registrar(email, senha, nome);
      
      if (!usuario) {
        setErro('This email is already registered or an error occurred');
        setCarregando(false);
        return;
      }

      console.log('Registro bem-sucedido, redirecionando...');
      // forcar recarregamento completo da pagina para o contexto atualizar
      window.location.href = '/setup';
    } catch (error) {
      console.error('Erro ao registrar:', error);
      setErro('Error creating account. Please try again.');
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>📚 English Study Tracker</h1>
        <h2>Create Account</h2>
        
        <form onSubmit={handleRegistro}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Your full name"
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
              placeholder="your@email.com"
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Minimum 6 characters"
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Enter password again"
              autoComplete="new-password"
            />
          </div>

          {erro && <div className="erro-mensagem">{erro}</div>}

          <button type="submit" className="btn-primary" disabled={carregando}>
            {carregando ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="login-footer">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
