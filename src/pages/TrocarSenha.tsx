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
      setErro('Preencha todos os campos');
      return;
    }

    if (novaSenha.length < 6) {
      setErro('A nova senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem');
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
        setErro('Senha atual incorreta ou erro ao trocar senha');
      }
    } catch (error) {
      setErro('Erro ao trocar senha. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>🔐 Trocar Senha</h1>
        <p className="login-subtitle">Altere sua senha temporária</p>

        {erro && <div className="erro-mensagem">{erro}</div>}
        {sucesso && <div className="sucesso-mensagem">✅ Senha alterada com sucesso! Redirecionando...</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="senhaAtual">Senha Atual</label>
            <input
              type="password"
              id="senhaAtual"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              placeholder="Digite sua senha atual"
              disabled={carregando || sucesso}
            />
          </div>

          <div className="form-group">
            <label htmlFor="novaSenha">Nova Senha</label>
            <input
              type="password"
              id="novaSenha"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Digite sua nova senha (mín. 6 caracteres)"
              disabled={carregando || sucesso}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmarSenha">Confirmar Nova Senha</label>
            <input
              type="password"
              id="confirmarSenha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Confirme sua nova senha"
              disabled={carregando || sucesso}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={carregando || sucesso}
          >
            {carregando ? 'Trocando...' : sucesso ? '✅ Senha Alterada!' : 'Trocar Senha'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            <a href="#" onClick={() => navigate('/dashboard')}>
              Voltar ao Dashboard
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
