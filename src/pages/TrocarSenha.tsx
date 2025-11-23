import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SupabaseAuthService from '../services/SupabaseAuthService';
import './Login.css'; // Reutilizar os mesmos estilos

export default function TrocarSenha() {
  const navigate = useNavigate();
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso(false);

    // Validações
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setErro('Fill in all fields');
      return;
    }

    if (novaSenha.length < 6) {
      setErro('New password must be at least 6 characters');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro('Passwords do not match');
      return;
    }

    setCarregando(true);

    try {
      const trocou = await SupabaseAuthService.trocarSenha(senhaAtual, novaSenha);
      
      if (trocou) {
        setSucesso(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setErro('Incorrect current password or error changing password');
      }
    } catch (error) {
      setErro('Error changing password. Please try again.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>🔐 Change Password</h1>
        <p className="login-subtitle">Change your temporary password</p>

        {erro && <div className="erro-mensagem">{erro}</div>}
        {sucesso && <div className="sucesso-mensagem">✅ Password changed successfully! Redirecting...</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="senhaAtual">Current Password</label>
            <input
              type="password"
              id="senhaAtual"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              placeholder="Enter your current password"
              disabled={carregando || sucesso}
            />
          </div>

          <div className="form-group">
            <label htmlFor="novaSenha">New Password</label>
            <input
              type="password"
              id="novaSenha"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Enter your new password (min. 6 characters)"
              disabled={carregando || sucesso}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmarSenha">Confirm New Password</label>
            <input
              type="password"
              id="confirmarSenha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Confirm your new password"
              disabled={carregando || sucesso}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={carregando || sucesso}
          >
            {carregando ? 'Changing...' : sucesso ? '✅ Password Changed!' : 'Change Password'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            <a href="#" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
