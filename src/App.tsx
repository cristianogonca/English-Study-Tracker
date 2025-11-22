import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { StudyProvider, useStudy } from './contexts/StudyContext';
import SupabaseAuthService from './services/SupabaseAuthService';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import EstudarHoje from './pages/EstudarHoje';
import CheckSemanal from './pages/CheckSemanal';
import Vocabulario from './pages/Vocabulario';
import Cronograma from './pages/Cronograma';
import Navigation from './components/Navigation';

function AppRoutes() {
  const { isConfigured } = useStudy();
  const [logado, setLogado] = useState(false);
  const [carregandoAuth, setCarregandoAuth] = useState(true);
  const [carregandoContexto, setCarregandoContexto] = useState(true);

  // Detecta carregamento do contexto
  const studyContext = useStudy();
  useEffect(() => {
    setCarregandoContexto(studyContext === undefined || studyContext === null);
  }, [studyContext]);

  useEffect(() => {
    const verificarAuth = async () => {
      try {
        const usuario = await SupabaseAuthService.getUsuarioAtual();
        setLogado(!!usuario);
      } catch (error) {
        console.error('[App] Erro ao verificar auth:', error);
        setLogado(false);
      } finally {
        setCarregandoAuth(false);
      }
    };
    verificarAuth();
  }, []);

  // Mostra loading global se contexto ou auth estiver carregando
  if (carregandoAuth || carregandoContexto) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Carregando contexto...</div>;
  }

  return (
    <BrowserRouter>
      {logado && <Navigation />}
      <Routes>
        <Route path="/login" element={!logado ? <Login /> : <Navigate to="/" />} />
        <Route path="/registro" element={!logado ? <Registro /> : <Navigate to="/" />} />
        <Route path="/setup" element={logado ? <Setup /> : <Navigate to="/login" />} />
        <Route path="/" element={
          !logado ? <Navigate to="/login" /> :
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