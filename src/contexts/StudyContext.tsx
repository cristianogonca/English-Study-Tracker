import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import SupabaseStudyService from '../services/SupabaseStudyService';
import SupabaseAuthService from '../services/SupabaseAuthService';
import { gerarCronogramaCompleto } from '../services/CronogramaGenerator';
import {
  DiaEstudo,
  Estatisticas,
  ConfigUsuario,
  MetaSemanal,
  CheckSemanal,
  PalavraNova,
  Fase
} from '../types';

interface StudyContextType {
  cronograma: DiaEstudo[];
  estatisticas: Estatisticas | null;
  config: ConfigUsuario | null;
  metaSemanal: MetaSemanal | null;
  checks: CheckSemanal[];
  palavras: PalavraNova[];
  fases: Fase[];
  isConfigured: boolean;
  configurar: (config: ConfigUsuario) => void;
  recarregar: () => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider = ({ children }: { children: ReactNode }) => {
  const [cronograma, setCronograma] = useState<DiaEstudo[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [config, setConfig] = useState<ConfigUsuario | null>(null);
  const [metaSemanal, setMetaSemanal] = useState<MetaSemanal | null>(null);
  const [checks, setChecks] = useState<CheckSemanal[]>([]);
  const [palavras, setPalavras] = useState<PalavraNova[]>([]);
  const [fases, setFases] = useState<Fase[]>([]);
  const [isConfigured, setIsConfigured] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [usuarioLogado, setUsuarioLogado] = useState(false);

  useEffect(() => {
    console.log('[StudyProvider] useEffect iniciado');
    const carregar = async () => {
      try {
        console.log('[StudyProvider] Chamando SupabaseAuthService.getUsuarioAtual()...');
        const usuario = await SupabaseAuthService.getUsuarioAtual();
        console.log('[StudyProvider] Usuário retornado:', usuario);
        
        if (usuario) {
          console.log('[StudyProvider] Usuário logado detectado:', usuario.id);
          setUsuarioLogado(true);
          SupabaseStudyService.setUsuario(usuario.id);
          console.log('[StudyProvider] Iniciando carregamento de dados...');
          await carregarDados();
        } else {
          console.log('[StudyProvider] Nenhum usuário logado.');
          setUsuarioLogado(false);
          setCarregando(false);
        }
      } catch (error) {
        console.error('[StudyProvider] ERRO ao verificar usuário:', error);
        setUsuarioLogado(false);
        setCarregando(false);
      }
    };
    carregar();
  }, []);

  const carregarDados = async () => {
    console.log('[StudyProvider] carregarDados() iniciado');
    try {
      console.log('[StudyProvider] Buscando configuração no Supabase...');
      const configSalva = await SupabaseStudyService.obterConfiguracao();
      console.log('[StudyProvider] Config retornada:', configSalva);
      
      if (configSalva) {
        console.log('[StudyProvider] Config válida encontrada, setando estado...');
        setConfig(configSalva);
        setIsConfigured(true);
        console.log('[StudyProvider] Buscando cronograma...');
        const cronogramaCarregado = await SupabaseStudyService.obterCronograma();
        console.log('[StudyProvider] Cronograma carregado:', cronogramaCarregado.length, 'dias');
        setCronograma(cronogramaCarregado);
      } else {
        console.log('[StudyProvider] Nenhuma config encontrada, usuário precisa fazer setup');
        setConfig(null);
        setIsConfigured(false);
      }
    } catch (error) {
      console.error('[StudyProvider] ERRO ao carregar dados:', error);
      setConfig(null);
      setIsConfigured(false);
    } finally {
      console.log('[StudyProvider] Finalizando carregamento, setando carregando=false');
      setCarregando(false);
    }
  };

  const configurar = async (novaConfig: ConfigUsuario) => {
    console.log('[StudyProvider] configurar() chamado com:', novaConfig);
    await SupabaseStudyService.salvarConfiguracao(novaConfig);
    const cronogramaInicial = gerarCronogramaCompleto(novaConfig.dataInicio);
    await SupabaseStudyService.salvarCronograma(cronogramaInicial);
    await carregarDados();
  };

  const recarregar = async () => {
    console.log('[StudyProvider] recarregar() chamado');
    await carregarDados();
  };

  console.log('[StudyProvider] Estado atual - carregando:', carregando, 'usuarioLogado:', usuarioLogado, 'isConfigured:', isConfigured);

  if (carregando && usuarioLogado) {
    console.log('[StudyProvider] Renderizando loading...');
    return <div style={{ padding: '20px', textAlign: 'center' }}>Carregando configuração...</div>;
  }

  console.log('[StudyProvider] Renderizando children');
  return (
    <StudyContext.Provider
      value={{
        cronograma,
        estatisticas,
        config,
        metaSemanal,
        checks,
        palavras,
        fases,
        isConfigured,
        configurar,
        recarregar
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (context === undefined) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};