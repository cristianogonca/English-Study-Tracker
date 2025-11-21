import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Limpar dados antigos do sistema de matrículas
const keysToRemove = [
  'alunos',
  'professores', 
  'disciplinas',
  'turmas',
  'matriculas',
  'currentUser',
  'users'
];

keysToRemove.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`🧹 Removido: ${key}`);
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)