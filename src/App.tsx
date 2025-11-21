import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StudyProvider, useStudy } from './contexts/StudyContext';
import SupabaseAuthService from './services/SupabaseAuthService';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import EstudarHoje from './pages/EstudarHoje';
import CheckSemanal from './pages/CheckSemanal';
import Vocabulario from './pages/Vocabulario';
import Cronograma from './pages/Cronograma';
import TrocarSenha from './pages/TrocarSenha';
import './App.css';
import { useEffect, useState } from 'react';

function AppRoutes() {
  const { isConfigured } = useStudy();
  const [estaLogado, setEstaLogado] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const verificarAuth = async () => {
      try {
        const logado = await SupabaseAuthService.estaLogado();
        setEstaLogado(logado);
      } catch (error) {
        console.error('Erro ao verificar auth:', error);
        setEstaLogado(false);
      } finally {
        setCarregando(false);
      }
    };
    verificarAuth();
  }, []);

  if (carregando) {
    return <div>Carregando...</div>;
  }

  // se nao esta logado, mostrar apenas rotas publicas
  if (!estaLogado) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // se logado mas nao configurado, mostrar setup
  if (!isConfigured) {
    return (
      <Routes>
        <Route path="/setup" element={<Setup />} />
        <Route path="*" element={<Navigate to="/setup" replace />} />
      </Routes>
    );
  }

  // se logado e configurado, mostrar app completo
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/estudar" element={<EstudarHoje />} />
        <Route path="/check" element={<CheckSemanal />} />
        <Route path="/vocabulario" element={<Vocabulario />} />
        <Route path="/cronograma" element={<Cronograma />} />
        <Route path="/trocar-senha" element={<TrocarSenha />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <StudyProvider>
        <AppRoutes />
      </StudyProvider>
    </BrowserRouter>
  );
}

export default App;