import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import SupabaseAuthService from '../services/SupabaseAuthService';
import SupabaseStudyService from '../services/SupabaseStudyService';
import { gerarCronogramaCompleto } from '../services/CronogramaGenerator';
import { supabase } from '../lib/supabase';
import {
  DiaEstudo,
  Estatisticas,
  ConfigUsuario,
  MetaSemanal,
  CheckSemanal,
  PalavraNova,
  Fase,
  NivelDificuldade
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
    const carregar = async () => {
      try {
        const usuario = await SupabaseAuthService.getUsuarioAtual();
        const userId = usuario?.id;
        // Diagnóstico: compara user_id logado com user_ids do Supabase
        try {
          const { data: allConfigs, error: allConfigsError } = await supabase
            .from('user_configs')
            .select('user_id, nome');
          console.log('[Diagnóstico] Usuário logado:', usuario);
          console.log('[Diagnóstico] user_id do usuário logado:', userId);
          if (allConfigsError) {
            console.error('[Diagnóstico] Erro ao buscar user_configs:', allConfigsError);
          } else if (allConfigs && allConfigs.length > 0) {
            console.log('[Diagnóstico] user_ids presentes em user_configs:');
            allConfigs.forEach((row: any) => {
              console.log(`user_id: ${row.user_id} | nome: ${row.nome}`);
            });
            const found = allConfigs.some((row: any) => row.user_id === userId);
            if (found) {
              console.log('[Diagnóstico] Configuração encontrada para o usuário logado!');
            } else {
              console.warn('[Diagnóstico] NÃO há configuração para o usuário logado.');
            }
          } else {
            console.warn('[Diagnóstico] Nenhum registro encontrado em user_configs.');
          }
        } catch (diagError) {
          console.error('[Diagnóstico] Erro ao executar diagnóstico:', diagError);
        }

        if (userId) {
          setUsuarioLogado(true);
          SupabaseStudyService.setUsuario(userId);
          // Busca config apenas por user_id
          const { data, error } = await supabase
            .from('user_configs')
            .select('*')
            .eq('user_id', userId)
            .single();
          if (data && !error) {
            setConfig({
              nome: data.nome,
              metaDiaria: data.meta_diaria,
              metaSemanal: data.meta_semanal,
              diasEstudo: data.dias_estudo,
              dataInicio: data.data_inicio,
              nivelInicial: data.nivel_inicial,
            });
            setIsConfigured(true);
            setCronograma(await SupabaseStudyService.obterCronograma());
            setPalavras(await SupabaseStudyService.obterVocabulario());
            setChecks(await SupabaseStudyService.obterChecks());
            setFases(await SupabaseStudyService.obterFases());
          } else {
            setConfig({
              nome: '',
              metaDiaria: 0,
              metaSemanal: 0,
              diasEstudo: [],
              dataInicio: '',
              nivelInicial: NivelDificuldade.BASICO,
            });
            setIsConfigured(false);
            setCronograma([]);
            setPalavras([]);
            setChecks([]);
            setFases([]);
          }
        } else {
          setUsuarioLogado(false);
          setConfig(null);
          setIsConfigured(false);
          setCronograma([]);
          setPalavras([]);
          setChecks([]);
          setFases([]);
        }
      } catch (error) {
        setUsuarioLogado(false);
        setConfig(null);
        setIsConfigured(false);
        setCronograma([]);
        setPalavras([]);
        setChecks([]);
        setFases([]);
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, []);

  const carregarDados = async () => {
    console.log('[StudyProvider] carregarDados() iniciado');
    try {
      console.log('[StudyProvider] Buscando configuração no Supabase...');
      const configSalva = await SupabaseStudyService.obterConfiguracao(); // Ensure only SupabaseStudyService is used
      console.log('[StudyProvider] Config retornada:', configSalva);
      
      if (configSalva) {
        console.log('[StudyProvider] Config válida encontrada, setando estado...');
        setConfig(configSalva);
        setIsConfigured(true);
        console.log('[StudyProvider] Buscando cronograma...');
        const cronogramaCarregado = await SupabaseStudyService.obterCronograma(); // Ensure only SupabaseStudyService is used
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