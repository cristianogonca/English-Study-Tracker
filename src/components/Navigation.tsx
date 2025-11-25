import { Link, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import SupabaseAuthService from '../services/SupabaseAuthService';
import './Navigation.css';

const TIMER_STORAGE_KEY = 'pomodoro_timer_state';

interface TimerState {
  minutos: number;
  segundos: number;
  ativo: boolean;
  pausado: boolean;
  iniciadoEm: number;
  userId: string;
  minutosIniciais: number;
}

function Navigation() {
  const location = useLocation();
  const [sessao, setSessao] = useState<any>(null);
  const [role, setRole] = useState<'aluno' | 'professor' | 'admin' | null>(null);
  const [timerAtivo, setTimerAtivo] = useState<{ minutos: number; segundos: number } | null>(null);

  useEffect(() => {
    async function fetchSessao() {
      const user = await SupabaseAuthService.getUsuarioAtual();
      setSessao(user || null);
      if (user) {
        setRole((user as any).role || 'aluno');
      }
    }
    fetchSessao();
  }, []);
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Monitorar timer do localStorage
  useEffect(() => {
    const checkTimer = () => {
      const saved = localStorage.getItem(TIMER_STORAGE_KEY);
      
      if (saved) {
        try {
          const state: TimerState = JSON.parse(saved);
          
          if (state.ativo && !state.pausado) {
            // Timer ativo - calcular tempo decorrido desde iniciadoEm
            const agora = Date.now();
            const decorrido = Math.floor((agora - state.iniciadoEm) / 1000);
            const totalSegundos = (state.minutosIniciais * 60) - decorrido;
            
            if (totalSegundos > 0) {
              const minutos = Math.floor(totalSegundos / 60);
              const segundos = totalSegundos % 60;
              setTimerAtivo({ minutos, segundos });
            } else {
              // Timer chegou a zero
              setTimerAtivo(null);
            }
          } else {
            // Timer pausado ou parado - esconder
            setTimerAtivo(null);
          }
        } catch (error) {
          setTimerAtivo(null);
        }
      } else {
        setTimerAtivo(null);
      }
    };

    // Verificar inicialmente
    checkTimer();

    // Atualizar a cada segundo
    const interval = setInterval(checkTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickFora = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAberto(false);
      }
    };
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  const linksAluno = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/estudar', label: 'Study Today', icon: '📖' },
    { path: '/check', label: 'Weekly Check', icon: '✅' },
    { path: '/vocabulario', label: 'Vocabulary', icon: '📚' },
    { path: '/cronograma', label: 'Schedule', icon: '📅' },
    { path: '/guia', label: 'Study Guide', icon: '📖' },
    { path: '/provas', label: 'Tests', icon: '📝' }
  ];

  const linksProfessor = [
    { path: '/professor', label: 'My Students', icon: '👨‍🏫' },
    { path: '/professor/provas', label: 'Tests', icon: '📝' }
  ];

  // Não renderiza links até saber o role
  const links = role === null ? [] : (role === 'professor' || role === 'admin') 
    ? linksProfessor 
    : linksAluno;

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      // Clear timer from localStorage
      localStorage.removeItem(TIMER_STORAGE_KEY);
      await SupabaseAuthService.logout();
      window.location.href = '/';
    }
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <h1>🎓 English Study Tracker</h1>
          {timerAtivo && role === 'aluno' && (
            <Link to="/estudar" className="timer-indicator">
              <span className="timer-icon">⏱️</span>
              <span className="timer-time">
                {String(timerAtivo.minutos).padStart(2, '0')}:{String(timerAtivo.segundos).padStart(2, '0')}
              </span>
            </Link>
          )}
        </div>
        
        <ul className="nav-links">
          {links.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={location.pathname === link.path ? 'active' : ''}
              >
                <span className="nav-icon">{link.icon}</span>
                <span className="nav-label">{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {sessao && (
          <div className="nav-user" ref={menuRef}>
            <button 
              className="user-menu-button"
              onClick={() => setMenuAberto(!menuAberto)}
            >
              <span className="user-avatar">👤</span>
              <span className="user-name">{sessao.user_metadata?.nome || sessao.email}</span>
              <span className="menu-arrow">{menuAberto ? '▲' : '▼'}</span>
            </button>
            
            {menuAberto && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <strong>{sessao.user_metadata?.nome || sessao.email}</strong>
                  <small>{sessao.email}</small>
                </div>
                <div className="dropdown-divider"></div>
                <Link 
                  to="/trocar-senha" 
                  className="dropdown-item"
                  onClick={() => setMenuAberto(false)}
                >
                  🔐 Change Password
                </Link>
                <Link 
                  to="/resetar-perfil" 
                  className="dropdown-item"
                  onClick={() => setMenuAberto(false)}
                  style={{ color: '#e74c3c' }}
                >
                  🔄 Reset Profile
                </Link>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="dropdown-item logout">
                  🚺 Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navigation;
