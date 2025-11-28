export interface ArquivoCompartilhado {
  id: string;
  remetente_id: string;
  destinatario_id: string;
  nome_arquivo: string;
  tamanho_bytes: number;
  tipo_arquivo: string;
  caminho_storage: string;
  data_upload: string;
  observacao: string | null;
  
  // Campos auxiliares (joins)
  remetente_nome?: string;
  destinatario_nome?: string;
}

export interface ArquivoUpload {
  destinatario_id: string;
  arquivo: File;
  observacao?: string;
}
