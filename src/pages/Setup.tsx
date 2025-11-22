import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudy } from '../contexts/StudyContext';
import { ConfigUsuario, DiaSemana, NivelDificuldade } from '../types';
import AuthService from '../services/AuthService';
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

  const handleLogout = () => {
    if (confirm('Deseja sair sem configurar? Você precisará configurar quando voltar.')) {
      AuthService.logout();
      window.location.href = '/login';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome) {
      alert('⚠️ Por favor, preencha seu nome');
      return;
    }
    if (formData.diasEstudo.length === 0) {
      alert('⚠️ Selecione pelo menos um dia de estudo');
      return;
    }
    await configurar(formData);
    navigate('/');
  };

  const diasSemana: { label: string; value: DiaSemana }[] = [
    { label: 'Segunda', value: DiaSemana.SEGUNDA },
    { label: 'Terça', value: DiaSemana.TERCA },
    { label: 'Quarta', value: DiaSemana.QUARTA },
    { label: 'Quinta', value: DiaSemana.QUINTA },
    { label: 'Sexta', value: DiaSemana.SEXTA },
    { label: 'Sábado', value: DiaSemana.SABADO },
    { label: 'Domingo', value: DiaSemana.DOMINGO }
  ];

  return (
    <div className="setup">
      <div className="setup-container">
        <header className="setup-header">
          <h1>🎓 Bem-vindo ao English Study Tracker!</h1>
          <p>Configure seu perfil e comece sua jornada de 12 meses</p>
        </header>

        <form onSubmit={handleSubmit} className="setup-form">
          <div className="form-group">
            <label>👤 Seu Nome</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Digite seu nome"
              required
            />
          </div>

          <div className="form-group">
            <label>🎯 Meta Diária (minutos)</label>
            <input
              type="number"
              value={formData.metaDiaria}
              onChange={(e) => setFormData({ ...formData, metaDiaria: Number(e.target.value) })}
              min="30"
              max="300"
            />
            <small>{formData.metaDiaria} minutos por dia = {(formData.metaDiaria / 60).toFixed(1)} horas</small>
          </div>

          <div className="form-group">
            <label>📊 Meta Semanal (minutos)</label>
            <input
              type="number"
              value={formData.metaSemanal}
              onChange={(e) => setFormData({ ...formData, metaSemanal: Number(e.target.value) })}
              min="210"
              max="2100"
            />
            <small>{formData.metaSemanal} minutos por semana = {(formData.metaSemanal / 60).toFixed(1)} horas</small>
          </div>

          <div className="form-group">
            <label>📅 Dias de Estudo</label>
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
            <small>{formData.diasEstudo.length} dia(s) selecionado(s)</small>
          </div>

          <div className="form-group">
            <label>📆 Data de Início</label>
            <input
              type="date"
              value={formData.dataInicio}
              onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>🎚️ Nível Inicial</label>
            <div className="nivel-buttons">
              <button
                type="button"
                className={formData.nivelInicial === NivelDificuldade.BASICO ? 'active' : ''}
                onClick={() => setFormData({ ...formData, nivelInicial: NivelDificuldade.BASICO })}
              >
                🟢 Básico
              </button>
              <button
                type="button"
                className={formData.nivelInicial === NivelDificuldade.INTERMEDIARIO ? 'active' : ''}
                onClick={() => setFormData({ ...formData, nivelInicial: NivelDificuldade.INTERMEDIARIO })}
              >
                🟡 Intermediário
              </button>
              <button
                type="button"
                className={formData.nivelInicial === NivelDificuldade.AVANCADO ? 'active' : ''}
                onClick={() => setFormData({ ...formData, nivelInicial: NivelDificuldade.AVANCADO })}
              >
                🔴 Avançado
              </button>
            </div>
          </div>

          <div className="info-box">
            <h3>📚 Sobre o programa:</h3>
            <ul>
              <li>✅ 12 meses de currículo estruturado</li>
              <li>✅ 365 dias de conteúdo pré-definido</li>
              <li>✅ 3 fases progressivas (Básico → Intermediário → Avançado)</li>
              <li>✅ Sistema de checks semanais</li>
              <li>✅ Vocabulário com flashcards</li>
              <li>✅ Timer Pomodoro integrado</li>
            </ul>
          </div>

          <button type="submit" className="btn-start">
            🚀 Começar Jornada
          </button>

          <button type="button" className="btn-secondary" onClick={handleLogout}>
            ← Voltar ao Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Setup;
