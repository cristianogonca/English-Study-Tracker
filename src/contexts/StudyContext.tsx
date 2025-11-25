import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import SupabaseAuthService from '../services/SupabaseAuthService';
import SupabaseStudyService from '../services/SupabaseStudyService';
import { gerarCronogramaCompleto } from '../services/CronogramaGenerator';
import { gerarFasePersonalizada } from '../services/FasesGeneratorPersonalizado';
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
  carregando: boolean;
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

  useEffect(() => {
    const carregar = async () => {
      try {
        const usuario = await SupabaseAuthService.getUsuarioAtual();
        const userId = usuario?.id;

        if (userId) {
          SupabaseStudyService.setUsuario(userId);
          // Busca config apenas por user_id
          const { data, error } = await supabase
            .from('user_configs')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle(); // não causa erro 406 se não existir
          if (data && !error) {
            // Buscar cronograma primeiro (validação + regeneração se necessário)
            const cronogramaCarregado = await SupabaseStudyService.obterCronograma();
            const dia1 = cronogramaCarregado.find(d => d.numero === 1);
            const dataInicioFormatada = data.data_inicio;
            
            let cronogramaFinal = cronogramaCarregado;
            let fasesFinal = await SupabaseStudyService.obterFases();
            
            if (cronogramaCarregado.length === 0 || !dia1 || !dia1.data || dia1.data.split('T')[0] !== dataInicioFormatada) {
              console.log('[StudyProvider] Cronograma inválido ou desatualizado. Regenerando...');
              const duracaoPrograma = data.duracao_programa || 365;
              const cronogramaNovo = gerarCronogramaCompleto(dataInicioFormatada, data.nivel_inicial, duracaoPrograma);
              await SupabaseStudyService.salvarCronograma(cronogramaNovo);
              
              const fasesNovas = gerarFasePersonalizada(data.nivel_inicial, duracaoPrograma);
              await SupabaseStudyService.salvarFases(fasesNovas);
              cronogramaFinal = cronogramaNovo;
              fasesFinal = fasesNovas;
            }
            
            // Buscar todos os dados em paralelo
            const [palavrasCarregadas, checksCarregados] = await Promise.all([
              SupabaseStudyService.obterVocabulario(),
              SupabaseStudyService.obterChecks()
            ]);
            
            // Atualizar estados DEPOIS de tudo carregado
            setConfig({
              nome: data.nome,
              metaDiaria: data.meta_diaria,
              metaSemanal: data.meta_semanal,
              diasEstudo: data.dias_estudo,
              dataInicio: data.data_inicio,
              nivelInicial: data.nivel_inicial,
              duracaoPrograma: data.duracao_programa || 365
            });
            setIsConfigured(true);
            setCronograma(cronogramaFinal);
            setFases(fasesFinal);
            setPalavras(palavrasCarregadas);
            setChecks(checksCarregados);
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
          setConfig(null);
          setIsConfigured(false);
          setCronograma([]);
          setPalavras([]);
          setChecks([]);
          setFases([]);
        }
      } catch (error) {
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
      // Silencioso: erro esperado quando não há config ainda
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
    
    const duracaoPrograma = novaConfig.duracaoPrograma || 365;
    const metaDiaria = novaConfig.metaDiaria || 60;
    const diasEstudo = novaConfig.diasEstudo || [1, 2, 3, 4, 5];
    const cronogramaInicial = gerarCronogramaCompleto(novaConfig.dataInicio, novaConfig.nivelInicial, duracaoPrograma, metaDiaria, diasEstudo);
    await SupabaseStudyService.salvarCronograma(cronogramaInicial);
    
    const fasesIniciais = gerarFasePersonalizada(novaConfig.nivelInicial, duracaoPrograma, metaDiaria);
    await SupabaseStudyService.salvarFases(fasesIniciais);
    // Atualizar estados locais diretamente (não recarregar tudo)
    setConfig(novaConfig);
    setIsConfigured(true);
    setCronograma(cronogramaInicial);
    setFases(fasesIniciais);
    setPalavras([]);
    setChecks([]);
  };

  const recarregar = async () => {
    console.log('[StudyProvider] recarregar() chamado');
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
        carregando,
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