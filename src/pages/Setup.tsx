import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudy } from '../contexts/StudyContext';
import { ConfigUsuario, DiaSemana, NivelDificuldade } from '../types';
import SupabaseAuthService from '../services/SupabaseAuthService';
import { professorService } from '../services/SupabaseProfessorService';
import { supabase } from '../lib/supabase';
import './Setup.css';

interface Professor {
  id: string;
  nome: string;
  email: string;
}

function Setup() {
  const { configurar } = useStudy();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [professorSelecionado, setProfessorSelecionado] = useState('');
  
  const [formData, setFormData] = useState<ConfigUsuario>({
    nome: '',
    metaDiaria: 60,
    metaSemanal: 420,
    diasEstudo: [DiaSemana.SEGUNDA, DiaSemana.TERCA, DiaSemana.QUARTA, DiaSemana.QUINTA, DiaSemana.SEXTA, DiaSemana.SABADO, DiaSemana.DOMINGO],
    dataInicio: new Date().toISOString().split('T')[0],
    nivelInicial: NivelDificuldade.BASICO,
    duracaoPrograma: 365
  });

  // Carregar professores disponíveis
  useEffect(() => {
    carregarProfessores();
  }, []);

  // Calcular meta semanal automaticamente
  useEffect(() => {
    const metaSemanal = formData.metaDiaria * formData.diasEstudo.length;
    setFormData(prev => ({ ...prev, metaSemanal }));
  }, [formData.metaDiaria, formData.diasEstudo.length]);

  const carregarProfessores = async () => {
    try {
      console.log('Carregando professores de users_profile...');
      
      // Buscar todos os registros de users_profile (todos são professores)
      const { data: profiles, error } = await supabase
        .from('users_profile')
        .select('id, nome, role')
        .order('nome');

      console.log('Resultado da busca:', { data: profiles, error });

      if (error) {
        console.error('Erro ao carregar professores:', error);
        return;
      }

      if (profiles && profiles.length > 0) {
        const profsFormatados = profiles.map(p => ({
          id: p.id,
          nome: p.nome || 'Professor',
          email: '' // Não tem email na tabela
        }));
        
        console.log('Professores formatados:', profsFormatados);
        setProfessores(profsFormatados);
      } else {
        console.warn('Nenhum professor cadastrado ainda. Dados:', profiles);
      }
    } catch (error) {
      console.error('Erro ao buscar professores:', error);
    }
  };

  const toggleDia = (dia: DiaSemana) => {
    if (formData.diasEstudo.includes(dia)) {
      setFormData({
        ...formData,
        diasEstudo: formData.diasEstudo.filter(d => d !== dia)
      });
    } else {
      setFormData({
        ...formData,
        diasEstudo: [...formData.diasEstudo, dia]
      });
    }
  };

  const handleLogout = async () => {
    if (confirm('Exit without setting up? You will need to configure when you return.')) {
      await SupabaseAuthService.logout();
      window.location.href = '/';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome) {
      alert('⚠️ Please fill in your name');
      return;
    }
    if (formData.diasEstudo.length === 0) {
      alert('⚠️ Select at least one study day');
      return;
    }
    if (!professorSelecionado) {
      alert('⚠️ Please select a teacher');
      return;
    }
    
    setLoading(true);
    setProgress(0);
    
    try {
      // Passo 1: Salvar configuração (20%)
      setProgressMessage('Saving your configuration...');
      setProgress(20);
      await configurar(formData);
      
      // Passo 2: Criar guia de estudos (40%)
      setProgressMessage('Creating study guide...');
      setProgress(40);
      const usuario = await SupabaseAuthService.getUsuarioAtual();
      
      if (usuario) {
        // Passo 3: Salvar professor_id em user_configs (50%)
        if (professorSelecionado) {
          setProgressMessage('Linking with your teacher...');
          setProgress(50);
          
          // Salvar na tabela user_configs
          await supabase
            .from('user_configs')
            .update({ professor_id: professorSelecionado })
            .eq('user_id', usuario.id);
        }
        
        // Passo 4: Gerar cronograma personalizado (60%)
        setProgressMessage('Generating personalized schedule...');
        setProgress(60);
        await professorService.criarGuiaInicial(usuario.id, formData.duracaoPrograma || 365);
        
        // Passo 5: Criar rotina semanal (80%)
        setProgressMessage('Setting up weekly routine...');
        setProgress(80);
        await professorService.criarRotinaSemanalInicial(usuario.id, formData.diasEstudo);
      }
      
      // Passo 5: Finalizando (100%)
      setProgressMessage('Ready to start! 🎉');
      setProgress(100);
      
      // Aguardar um pouco para mostrar o 100%
      setTimeout(() => {
        navigate('/');
      }, 500);
      
    } catch (error) {
      console.error('Erro ao configurar:', error);
      alert('Error during setup. Please try again.');
      setLoading(false);
      setProgress(0);
      setProgressMessage('');
    }
  };

  const diasSemana: { label: string; value: DiaSemana }[] = [
    { label: 'Monday', value: DiaSemana.SEGUNDA },
    { label: 'Tuesday', value: DiaSemana.TERCA },
    { label: 'Wednesday', value: DiaSemana.QUARTA },
    { label: 'Thursday', value: DiaSemana.QUINTA },
    { label: 'Friday', value: DiaSemana.SEXTA },
    { label: 'Saturday', value: DiaSemana.SABADO },
    { label: 'Sunday', value: DiaSemana.DOMINGO }
  ];

  return (
    <div className="setup">
      {loading && (
        <div className="progress-overlay">
          <div className="progress-container">
            <h2>⚙️ Setting up your journey...</h2>
            <div className="progress-bar-wrapper">
              <div className="progress-bar" style={{ width: `${progress}%` }}>
                <span className="progress-text">{progress}%</span>
              </div>
            </div>
            <p className="progress-message">{progressMessage}</p>
          </div>
        </div>
      )}
      
      <div className="setup-container">
        <header className="setup-header">
          <h1>🎓 Welcome to English Study Tracker!</h1>
          <p>Set up your profile and start your 12-month journey</p>
        </header>

        <form onSubmit={handleSubmit} className="setup-form">
          <div className="form-group">
            <label>👤 Your Name</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-group">
            <label>👨‍🏫 Select Your Teacher *</label>
            <select
              value={professorSelecionado}
              onChange={(e) => setProfessorSelecionado(e.target.value)}
              required
            >
              <option value="">-- Select a teacher --</option>
              {professores.map(prof => (
                <option key={prof.id} value={prof.id}>
                  {prof.nome}
                </option>
              ))}
            </select>
            <small>
              {professores.length === 0 
                ? '⚠️ No teachers found. Please contact support.' 
                : `${professores.length} teacher(s) available`}
            </small>
          </div>

          <div className="form-group">
            <label>🎯 Daily Goal (minutes)</label>
            <input
              type="number"
              value={formData.metaDiaria}
              onChange={(e) => setFormData({ ...formData, metaDiaria: Number(e.target.value) })}
              min="30"
              max="300"
            />
            <small>{formData.metaDiaria} minutes per day = {(formData.metaDiaria / 60).toFixed(1)} hours</small>
          </div>

          <div className="form-group">
            <label>📊 Weekly Goal (minutes)</label>
            <input
              type="number"
              value={formData.metaSemanal}
              readOnly
              disabled
              style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
            />
            <small>
              {formData.metaSemanal} minutes per week = {(formData.metaSemanal / 60).toFixed(1)} hours
              <br />
              <strong>💡 Auto-calculated: {formData.metaDiaria} min/day × {formData.diasEstudo.length} days</strong>
            </small>
          </div>

          <div className="form-group">
            <label>📅 Study Days</label>
            <div className="dias-grid">
              {diasSemana.map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  className={formData.diasEstudo.includes(value) ? 'active' : ''}
                  onClick={() => toggleDia(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <small>{formData.diasEstudo.length} day(s) selected</small>
          </div>

          <div className="form-group">
            <label>📆 Start Date</label>
            <input
              type="date"
              value={formData.dataInicio}
              onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>⏱️ Program Duration (days)</label>
            <input
              type="number"
              value={formData.duracaoPrograma}
              onChange={(e) => setFormData({ ...formData, duracaoPrograma: Number(e.target.value) })}
              min="30"
              max="730"
            />
            <small>
              {formData.duracaoPrograma} days = {Math.floor(formData.duracaoPrograma / 30)} month(s)
              <br />
              <strong>💡 Recommended: 90 days (3 months), 180 days (6 months), or 365 days (12 months)</strong>
            </small>
          </div>

          <div className="form-group">
            <label>🎚️ Initial Level</label>
            <div className="nivel-buttons">
              <button
                type="button"
                className={formData.nivelInicial === NivelDificuldade.BASICO ? 'active' : ''}
                onClick={() => setFormData({ ...formData, nivelInicial: NivelDificuldade.BASICO })}
              >
                🟢 Basic
              </button>
              <button
                type="button"
                className={formData.nivelInicial === NivelDificuldade.INTERMEDIARIO ? 'active' : ''}
                onClick={() => setFormData({ ...formData, nivelInicial: NivelDificuldade.INTERMEDIARIO })}
              >
                🟡 Intermediate
              </button>
              <button
                type="button"
                className={formData.nivelInicial === NivelDificuldade.AVANCADO ? 'active' : ''}
                onClick={() => setFormData({ ...formData, nivelInicial: NivelDificuldade.AVANCADO })}
              >
                🔴 Advanced
              </button>
            </div>
          </div>

          <div className="info-box">
            <h3>📚 About the program:</h3>
            <ul>
              <li>✅ Personalized curriculum for your level</li>
              <li>✅ {formData.duracaoPrograma} days of pre-defined {formData.nivelInicial} content</li>
              <li>✅ Single focused phase ({formData.nivelInicial} level)</li>
              <li>✅ Weekly check system</li>
              <li>✅ Vocabulary with flashcards</li>
              <li>✅ Integrated Pomodoro timer</li>
            </ul>
          </div>

          <button type="submit" className="btn-start">
            🚀 Start Journey
          </button>

          <button type="button" className="btn-secondary" onClick={handleLogout}>
            ← Back to Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Setup;
