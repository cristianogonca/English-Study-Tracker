import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import StudyService from '../services/StudyService';
import AuthService from '../services/AuthService';
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

  useEffect(() => {
    // Só carregar dados se estiver logado
    if (AuthService.estaLogado()) {
      carregarDados();
    }
  }, []);

  const carregarDados = () => {
    try {
      const configSalva = StudyService.getConfig();
      
      if (configSalva) {
        setConfig(configSalva);
        setIsConfigured(true);
        
        setCronograma(StudyService.getCronograma());
        setEstatisticas(StudyService.calcularEstatisticas());
        
        setMetaSemanal(StudyService.getMetaAtual() || null);
        
        setChecks(StudyService.getChecks());
        setPalavras(StudyService.getVocabulario());
        setFases(StudyService.getFases());
      } else {
        setIsConfigured(false);
      }
    } catch (error) {
      // Usuário não autenticado ou erro ao carregar
      setIsConfigured(false);
    }
  };

  const configurar = (novaConfig: ConfigUsuario) => {
    StudyService.salvarConfig(novaConfig);
    
    // Gerar cronograma inicial COM A DATA DE INÍCIO
    const cronogramaInicial = gerarCronogramaCompleto(novaConfig.dataInicio);
    StudyService.salvarCronograma(cronogramaInicial);
    
    // Inicializar fases
    const fasesIniciais: Fase[] = [
      {
        id: 'fase-1',
        numero: 1,
        nome: 'Básico',
        descricao: 'Fundamentos da língua inglesa',
        nivel: 'basico' as any,
        mesInicio: 1,
        mesFim: 4,
        horasTotal: 120,
        concluida: false,
        progresso: 0
      },
      {
        id: 'fase-2',
        numero: 2,
        nome: 'Intermediário',
        descricao: 'Fluência e narrativa complexa',
        nivel: 'intermediario' as any,
        mesInicio: 5,
        mesFim: 8,
        horasTotal: 120,
        concluida: false,
        progresso: 0
      },
      {
        id: 'fase-3',
        numero: 3,
        nome: 'Avançado',
        descricao: 'Proficiência e refinamento',
        nivel: 'avancado' as any,
        mesInicio: 9,
        mesFim: 12,
        horasTotal: 125,
        concluida: false,
        progresso: 0
      }
    ];
    
    StudyService.salvarFases(fasesIniciais);
    
    carregarDados();
  };

  const recarregar = () => {
    carregarDados();
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
