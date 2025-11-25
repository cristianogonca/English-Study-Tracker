import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SupabaseAuthService from '../services/SupabaseAuthService';
import { supabase } from '../lib/supabase';
import './Login.css'; // Reutilizar os mesmos estilos

export default function ResetarPerfil() {
  const navigate = useNavigate();
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso(false);

    // Validação
    if (confirmacao.toLowerCase() !== 'resetar') {
      setErro('Type "resetar" to confirm');
      return;
    }

    if (!confirm('⚠️ WARNING: This will delete ALL your study data (schedule, vocabulary, checks, etc.). This action CANNOT be undone. Continue?')) {
      return;
    }

    setCarregando(true);

    try {
      const user = await SupabaseAuthService.getUsuarioAtual();
      if (!user) {
        setErro('User not logged in');
        setCarregando(false);
        return;
      }

      // Deletar dados do usuário em todas as tabelas
      const userId = user.id;

      // 1. Deletar cronograma
      const { error: cronogramaError } = await supabase
        .from('cronograma')
        .delete()
        .eq('user_id', userId);

      if (cronogramaError) throw cronogramaError;

      // 2. Deletar vocabulário
      const { error: vocabularioError } = await supabase
        .from('vocabulario')
        .delete()
        .eq('user_id', userId);

      if (vocabularioError) throw vocabularioError;

      // 3. Deletar checks semanais
      const { error: checksError } = await supabase
        .from('checks_semanais')
        .delete()
        .eq('user_id', userId);

      if (checksError) throw checksError;

      // 4. Deletar rotina semanal
      const { error: rotinaError } = await supabase
        .from('rotina_semanal')
        .delete()
        .eq('user_id', userId);

      if (rotinaError) throw rotinaError;

      // 5. Deletar provas
      const { error: provasError } = await supabase
        .from('provas')
        .delete()
        .eq('aluno_id', userId);

      if (provasError) throw provasError;

      // 6. Deletar user_configs
      const { error: configError } = await supabase
        .from('user_configs')
        .delete()
        .eq('user_id', userId);

      if (configError) throw configError;

      // Sucesso!
      setSucesso(true);
      
      // Aguardar 2 segundos e redirecionar para setup
      setTimeout(() => {
        navigate('/setup');
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao resetar perfil:', error);
      setErro(error.message || 'Error resetting profile. Please try again.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>🔄 Reset Profile</h1>
        <p className="login-subtitle">Delete all your study data and start over</p>

        {erro && <div className="erro-mensagem">{erro}</div>}
        {sucesso && (
          <div className="sucesso-mensagem">
            ✅ Profile reset successfully! Redirecting to setup...
          </div>
        )}

        <div style={{ 
          background: '#fee', 
          border: '2px solid #e74c3c', 
          borderRadius: '10px', 
          padding: '1rem', 
          marginBottom: '1.5rem' 
        }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: '#e74c3c' }}>
            ⚠️ WARNING: This action is IRREVERSIBLE!
          </p>
          <p style={{ margin: '0', fontSize: '0.9rem', color: '#333' }}>
            This will permanently delete:
          </p>
          <ul style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#333' }}>
            <li>Your 365-day study schedule</li>
            <li>All vocabulary words</li>
            <li>Weekly checks and evaluations</li>
            <li>Study routines</li>
            <li>Tests and exam results</li>
            <li>Profile settings</li>
          </ul>
        </div>

        <form onSubmit={handleReset}>
          <div className="form-group">
            <label htmlFor="confirmacao">
              Type <strong>resetar</strong> to confirm:
            </label>
            <input
              type="text"
              id="confirmacao"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              placeholder="Type: resetar"
              disabled={carregando || sucesso}
              autoComplete="off"
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            style={{ background: '#e74c3c' }}
            disabled={carregando || sucesso || confirmacao.toLowerCase() !== 'resetar'}
          >
            {carregando ? '🔄 Resetting...' : sucesso ? '✅ Reset Complete!' : '🗑️ Reset Profile'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            <a href="#" onClick={() => navigate('/dashboard')}>
              ← Back to Dashboard
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
