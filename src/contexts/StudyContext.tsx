import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import SupabaseStudyService from '../services/SupabaseStudyService';
import AuthService from '../services/AuthService';
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
  const [carregandoConfig, setCarregandoConfig] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      const usuario = await SupabaseAuthService.getUsuarioAtual();
      if (usuario) {
        SupabaseStudyService.setUsuario(usuario.id);
        console.log('[StudyProvider] Usuário logado, carregando dados Supabase...');
        await carregarDados();
      } else {
        console.warn('[StudyProvider] Usuário não está logado.');
      }
    };
    carregar();
  }, []);

  const carregarDados = async () => {
    try {
      const configSalva = await SupabaseStudyService.obterConfiguracao();
      console.log('[StudyProvider] Config Supabase carregada:', configSalva);
      if (configSalva) {
        setConfig(configSalva);
        setIsConfigured(true);
        setCronograma(await SupabaseStudyService.obterCronograma());
        // estatisticas, metaSemanal, checks, palavras, fases devem ser implementados no SupabaseStudyService
        // Exemplo:
        // setEstatisticas(await SupabaseStudyService.obterEstatisticas());
        // setMetaSemanal(await SupabaseStudyService.obterMetaSemanal());
        // setChecks(await SupabaseStudyService.obterChecks());
        // setPalavras(await SupabaseStudyService.obterVocabulario());
        // setFases(await SupabaseStudyService.obterFases());
      } else {
        console.warn('[StudyProvider] Nenhuma configuração encontrada no Supabase. Usuário não está configurado.');
        setConfig(null);
        setIsConfigured(false);
      }
    } catch (error) {
      console.error('[StudyProvider] Erro ao carregar dados do contexto Supabase:', error);
      setConfig(null);
      setIsConfigured(false);
    } finally {
      setCarregandoConfig(false);
    }
  };

  const configurar = async (novaConfig: ConfigUsuario) => {
    await SupabaseStudyService.salvarConfiguracao(novaConfig);
    // Gerar cronograma inicial COM A DATA DE INÍCIO
    const cronogramaInicial = gerarCronogramaCompleto(novaConfig.dataInicio);
    await SupabaseStudyService.salvarCronograma(cronogramaInicial);
    await carregarDados();
  };

  const recarregar = async () => {
    await carregarDados();
  };

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
      {carregandoConfig ? <div>Carregando configuração...</div> : children}
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
