import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudy } from '../contexts/StudyContext';
import { ConfigUsuario, DiaSemana, NivelDificuldade } from '../types';
import SupabaseAuthService from '../services/SupabaseAuthService';
import { professorService } from '../services/SupabaseProfessorService';
import './Setup.css';

function Setup() {
  const { configurar } = useStudy();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<ConfigUsuario>({
    nome: '',
    metaDiaria: 60,
    metaSemanal: 420,
    diasEstudo: [DiaSemana.SEGUNDA, DiaSemana.TERCA, DiaSemana.QUARTA, DiaSemana.QUINTA, DiaSemana.SEXTA, DiaSemana.SABADO, DiaSemana.DOMINGO],
    dataInicio: new Date().toISOString().split('T')[0],
    nivelInicial: NivelDificuldade.BASICO
  });

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
    
    // Configurar perfil do usuário
    await configurar(formData);
    
    // Criar guia inicial (12 meses) e rotina semanal para o aluno
    try {
      const usuario = await SupabaseAuthService.getUsuarioAtual();
      if (usuario) {
        await professorService.criarGuiaInicial(usuario.id);
        await professorService.criarRotinaSemanalInicial(usuario.id);
      }
    } catch (error) {
      console.error('Erro ao criar guia inicial:', error);
      // Não bloquear o setup se falhar, apenas logar
    }
    
    navigate('/');
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
              onChange={(e) => setFormData({ ...formData, metaSemanal: Number(e.target.value) })}
              min="210"
              max="2100"
            />
            <small>{formData.metaSemanal} minutes per week = {(formData.metaSemanal / 60).toFixed(1)} hours</small>
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
              <li>✅ 12-month structured curriculum</li>
              <li>✅ 365 days of pre-defined content</li>
              <li>✅ 3 progressive phases (Basic → Intermediate → Advanced)</li>
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
