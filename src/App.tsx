import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { StudyProvider, useStudy } from './contexts/StudyContext';
import SupabaseAuthService from './services/SupabaseAuthService';
import Login from './pages/Login';
import Registro from './pages/Registro';
import TrocarSenha from './pages/TrocarSenha';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import EstudarHoje from './pages/EstudarHoje';
import CheckSemanal from './pages/CheckSemanal';
import Vocabulario from './pages/Vocabulario';
import Cronograma from './pages/Cronograma';
import GuiaEstudos from './pages/GuiaEstudos';
import ProfessorAlunos from './pages/ProfessorAlunos';
import ProfessorCronograma from './pages/ProfessorCronograma';
import ProfessorGuia from './pages/ProfessorGuia';
import ProfessorRotina from './pages/ProfessorRotina';
import Navigation from './components/Navigation';

function AppRoutes() {
  const { isConfigured, carregando: carregandoConfig } = useStudy();
  const [logado, setLogado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [role, setRole] = useState<'aluno' | 'professor' | 'admin'>('aluno');

  useEffect(() => {
    const verificarAuth = async () => {
      try {
        const usuario = await SupabaseAuthService.getUsuarioAtual();
        setLogado(!!usuario);
        if (usuario) {
          setRole((usuario as any).role || 'aluno');
        }
      } catch (error) {
        // Silencioso: erro esperado quando não logado
        setLogado(false);
      } finally {
        setCarregando(false);
      }
    };
    verificarAuth();
  }, []);

  if (carregando) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Verifying authentication...</div>;
  }

  if (carregandoConfig) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading settings...</div>;
  }

  return (
    <BrowserRouter>
      {logado && <Navigation />}
      <Routes>
        <Route path="/login" element={!logado ? <Login /> : <Navigate to="/" />} />
        <Route path="/registro" element={!logado ? <Registro /> : <Navigate to="/" />} />
        <Route path="/trocar-senha" element={logado ? <TrocarSenha /> : <Navigate to="/login" />} />
        <Route path="/setup" element={logado && role === 'aluno' ? <Setup /> : <Navigate to="/login" />} />
        
        {/* Rotas de Professor */}
        <Route path="/professor" element={
          !logado ? <Navigate to="/login" /> :
          (role === 'professor' || role === 'admin') ? <ProfessorAlunos /> :
          <Navigate to="/" />
        } />
        <Route path="/professor/cronograma/:alunoId" element={
          !logado ? <Navigate to="/login" /> :
          (role === 'professor' || role === 'admin') ? <ProfessorCronograma /> :
          <Navigate to="/" />
        } />
        <Route path="/professor/guia/:alunoId" element={
          !logado ? <Navigate to="/login" /> :
          (role === 'professor' || role === 'admin') ? <ProfessorGuia /> :
          <Navigate to="/" />
        } />
        <Route path="/professor/rotina/:alunoId" element={
          !logado ? <Navigate to="/login" /> :
          (role === 'professor' || role === 'admin') ? <ProfessorRotina /> :
          <Navigate to="/" />
        } />
        
        {/* Rotas de Aluno */}
        <Route path="/" element={
          !logado ? <Navigate to="/login" /> :
          (role === 'professor' || role === 'admin') ? <Navigate to="/professor" /> :
          !isConfigured ? <Navigate to="/setup" /> :
          <Dashboard />
        } />
        <Route path="/estudar" element={
          !logado ? <Navigate to="/login" /> :
          !isConfigured ? <Navigate to="/setup" /> :
          <EstudarHoje />
        } />
        <Route path="/check-semanal" element={
          !logado ? <Navigate to="/login" /> :
          !isConfigured ? <Navigate to="/setup" /> :
          <CheckSemanal />
        } />
        <Route path="/check" element={<Navigate to="/check-semanal" />} />
        <Route path="/vocabulario" element={
          !logado ? <Navigate to="/login" /> :
          !isConfigured ? <Navigate to="/setup" /> :
          <Vocabulario />
        } />
        <Route path="/cronograma" element={
          !logado ? <Navigate to="/login" /> :
          !isConfigured ? <Navigate to="/setup" /> :
          <Cronograma />
        } />
        <Route path="/guia" element={
          !logado ? <Navigate to="/login" /> :
          !isConfigured ? <Navigate to="/setup" /> :
          <GuiaEstudos />
        } />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <StudyProvider>
      <AppRoutes />
    </StudyProvider>
  );
}

export default App;