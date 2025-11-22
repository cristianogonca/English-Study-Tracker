import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import SupabaseAuthService from '../services/SupabaseAuthService';
import './Navigation.css';

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sessao, setSessao] = useState<any>(null);

  useEffect(() => {
    async function fetchSessao() {
      const s = await SupabaseAuthService.obterSessao();
      setSessao(s?.user || null);
    }
    fetchSessao();
  }, []);
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const links = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/estudar', label: 'Estudar Hoje', icon: '📖' },
    { path: '/check', label: 'Check Semanal', icon: '✅' },
    { path: '/vocabulario', label: 'Vocabulário', icon: '📚' },
    { path: '/cronograma', label: 'Cronograma', icon: '📅' }
  ];

  const handleLogout = async () => {
    if (confirm('Deseja realmente sair?')) {
      try {
        await SupabaseAuthService.logout();
        navigate('/login', { replace: true });
        window.location.reload();
      } catch (error) {
        console.error('[Navigation] Erro no logout:', error);
        alert('Erro ao fazer logout. Tente novamente.');
      }
    }
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <h1>🎓 English Study Tracker</h1>
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
              <span className="user-name">{sessao.nome}</span>
              <span className="menu-arrow">{menuAberto ? '▲' : '▼'}</span>
            </button>
            
            {menuAberto && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <strong>{sessao.nome}</strong>
                  <small>{sessao.email}</small>
                </div>
                <div className="dropdown-divider"></div>
                <Link 
                  to="/trocar-senha" 
                  className="dropdown-item"
                  onClick={() => setMenuAberto(false)}
                >
                  🔐 Trocar Senha
                </Link>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="dropdown-item logout">
                  🚪 Sair
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
