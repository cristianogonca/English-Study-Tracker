export interface ArquivoCompartilhado {
  id: string;
  professor_id: string;
  aluno_id: string;
  nome_arquivo: string;
  tamanho_bytes: number;
  tipo_arquivo: string;
  caminho_storage: string;
  data_upload: string;
  baixado: boolean;
  data_baixado: string | null;
  observacao: string | null;
  
  // Campos auxiliares (joins)
  professor_nome?: string;
  aluno_nome?: string;
}

export interface ArquivoUpload {
  aluno_id: string;
  arquivo: File;
  observacao?: string;
}
