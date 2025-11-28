import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArquivosService } from '../services/ArquivosService';
import type { ArquivoCompartilhado } from '../types/ArquivoCompartilhado';
import './AlunoArquivos.css';

export function AlunoArquivos() {
  const [arquivos, setArquivos] = useState<ArquivoCompartilhado[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [userId, setUserId] = useState('');
  const [professorId, setProfessorId] = useState('');
  const [professorNome, setProfessorNome] = useState('');
  
  // Form upload
  const [uploading, setUploading] = useState(false);
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [observacao, setObservacao] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    await Promise.all([carregarProfessor(), carregarArquivos()]);
    setLoading(false);
  };

  const carregarProfessor = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Buscar professor_id direto da user_configs
      const { data: config, error } = await supabase
        .from('user_configs')
        .select('professor_id')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar config:', error);
        return;
      }

      if (config && config.professor_id) {
        console.log('Professor ID encontrado:', config.professor_id);
        setProfessorId(config.professor_id);

        // Buscar nome do professor de users_profile
        const { data: profProfile, error: profError } = await supabase
          .from('users_profile')
          .select('nome')
          .eq('id', config.professor_id)
          .single();

        if (!profError && profProfile) {
          console.log('Nome do professor:', profProfile.nome);
          setProfessorNome(profProfile.nome);
        }
      } else {
        console.log('Nenhum professor vinculado');
      }
    } catch (error) {
      console.error('Erro ao carregar professor:', error);
    }
  };

  const carregarArquivos = async () => {
    const result = await ArquivosService.listarArquivos();
    if (result.success && result.arquivos) {
      setArquivos(result.arquivos);
    } else {
      console.error('Erro ao carregar arquivos:', result.error);
      setMensagem({ tipo: 'erro', texto: result.error || 'Erro ao carregar arquivos' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validacao = ArquivosService.validarTamanho(file);
    if (!validacao.valido) {
      setMensagem({ tipo: 'erro', texto: validacao.erro! });
      e.target.value = '';
      return;
    }

    setArquivoSelecionado(file);
    setMensagem(null);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!professorId || !arquivoSelecionado) {
      setMensagem({ tipo: 'erro', texto: 'Selecione um arquivo' });
      return;
    }

    setUploading(true);
    setMensagem(null);

    const result = await ArquivosService.uploadArquivo({
      destinatario_id: professorId,
      arquivo: arquivoSelecionado,
      observacao: observacao.trim() || undefined
    });

    setUploading(false);

    if (result.success) {
      setMensagem({ tipo: 'sucesso', texto: 'Arquivo enviado com sucesso!' });
      setArquivoSelecionado(null);
      setObservacao('');
      (document.getElementById('arquivo-input-aluno') as HTMLInputElement).value = '';
      await carregarArquivos();
    } else {
      setMensagem({ tipo: 'erro', texto: result.error || 'Erro ao enviar arquivo' });
    }
  };

  const handleBaixar = async (arquivoId: string, nomeArquivo: string) => {
    setMensagem(null);
    
    const result = await ArquivosService.baixarArquivo(arquivoId);
    if (result.success && result.blob) {
      // Criar link temporário para download
      const url = window.URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.nomeArquivo || nomeArquivo;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Deletar automaticamente após download
      const deleteResult = await ArquivosService.deletarArquivo(arquivoId);
      if (deleteResult.success) {
        setMensagem({ tipo: 'sucesso', texto: 'Download concluído e arquivo removido!' });
        await carregarArquivos();
      } else {
        setMensagem({ tipo: 'sucesso', texto: 'Download concluído (arquivo não foi removido)' });
        await carregarArquivos();
      }
    } else {
      setMensagem({ tipo: 'erro', texto: result.error || 'Erro ao baixar arquivo' });
    }
  };

  const arquivosRecebidos = arquivos.filter(arq => arq.destinatario_id === userId);
  const arquivosEnviados = arquivos.filter(arq => arq.remetente_id === userId);
  const arquivosPendentes = arquivosRecebidos.length;

  if (loading) {
    return <div className="aluno-arquivos loading">Carregando...</div>;
  }

  return (
    <div className="aluno-arquivos">
      <h1>📁 Meus Arquivos</h1>

      {mensagem && (
        <div className={`mensagem ${mensagem.tipo}`}>
          {mensagem.texto}
        </div>
      )}

      {arquivosPendentes > 0 && (
        <div className="alerta-pendentes">
          ⚠️ Você tem <strong>{arquivosPendentes}</strong> arquivo{arquivosPendentes > 1 ? 's' : ''} pendente{arquivosPendentes > 1 ? 's' : ''} de download!
        </div>
      )}

      {/* Formulário para enviar arquivo ao professor */}
      {!professorId ? (
        <div className="alerta-sem-professor">
          ⚠️ Você ainda não está vinculado a um professor. Entre em contato com seu professor para ser adicionado ao sistema.
        </div>
      ) : (
        <div className="upload-section">
          <h2>📤 Enviar Arquivo para o Professor</h2>
          <form onSubmit={handleUpload} className="upload-form">
            <div className="form-group">
              <label>Enviar para: <strong>{professorNome || 'Professor'}</strong></label>
            </div>

            <div className="form-group">
              <label htmlFor="arquivo-input-aluno">Arquivo * (máx 50 MB)</label>
              <input
                id="arquivo-input-aluno"
                type="file"
                onChange={handleFileChange}
                required
                disabled={uploading}
                accept=".pdf,.xlsx,.xls,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
              />
              {arquivoSelecionado && (
                <div className="arquivo-info">
                  {ArquivosService.getIconePorTipo(arquivoSelecionado.type)} {arquivoSelecionado.name}
                  <span className="tamanho">({ArquivosService.formatarTamanho(arquivoSelecionado.size)})</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="observacao-aluno">Observação (opcional)</label>
              <textarea
                id="observacao-aluno"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Ex: Trabalho da semana 5"
                rows={3}
                disabled={uploading}
              />
            </div>

            <button type="submit" disabled={uploading || !arquivoSelecionado}>
              {uploading ? '📤 Enviando...' : '📤 Enviar Arquivo'}
            </button>
          </form>
        </div>
      )}

      {/* Arquivos Recebidos */}
      <div className="arquivos-section">
        <div className="arquivos-header">
          <h2>📥 Arquivos Recebidos ({arquivosRecebidos.length})</h2>
        </div>

        {arquivosRecebidos.length === 0 ? (
          <div className="vazio">
            <p>📭 Nenhum arquivo recebido ainda.</p>
            <p className="dica">Seu professor pode compartilhar materiais de estudo com você por aqui!</p>
          </div>
        ) : (
          <div className="arquivos-lista">
            {arquivosRecebidos.map(arquivo => (
              <div key={arquivo.id} className="arquivo-card pendente">
                <div className="arquivo-icone">
                  {ArquivosService.getIconePorTipo(arquivo.tipo_arquivo)}
                </div>
                <div className="arquivo-info">
                  <h3>{arquivo.nome_arquivo}</h3>
                  <p className="professor">👨‍🏫 De: {arquivo.remetente_nome}</p>
                  <p className="detalhes">
                    📏 {ArquivosService.formatarTamanho(arquivo.tamanho_bytes)} •
                    📅 {new Date(arquivo.data_upload).toLocaleDateString('pt-BR')} às {new Date(arquivo.data_upload).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {arquivo.observacao && (
                    <p className="observacao">💬 {arquivo.observacao}</p>
                  )}
                </div>
                <div className="arquivo-acoes">
                  <button
                    className="btn-primary"
                    onClick={() => handleBaixar(arquivo.id, arquivo.nome_arquivo)}
                    title="Baixar arquivo (será deletado automaticamente)"
                  >
                    ⬇️ Baixar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Arquivos Enviados */}
      <div className="arquivos-section">
        <div className="arquivos-header">
          <h2>📤 Arquivos Enviados ({arquivosEnviados.length})</h2>
        </div>

        {arquivosEnviados.length === 0 ? (
          <div className="vazio">
            <p>📭 Nenhum arquivo enviado ainda.</p>
          </div>
        ) : (
          <div className="arquivos-lista">
            {arquivosEnviados.map(arquivo => (
              <div key={arquivo.id} className="arquivo-card enviado">
                <div className="arquivo-icone">
                  {ArquivosService.getIconePorTipo(arquivo.tipo_arquivo)}
                </div>
                <div className="arquivo-info">
                  <h3>{arquivo.nome_arquivo}</h3>
                  <p className="professor">👤 Para: {arquivo.destinatario_nome}</p>
                  <p className="detalhes">
                    📏 {ArquivosService.formatarTamanho(arquivo.tamanho_bytes)} •
                    📅 {new Date(arquivo.data_upload).toLocaleDateString('pt-BR')} às {new Date(arquivo.data_upload).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {arquivo.observacao && (
                    <p className="observacao">💬 {arquivo.observacao}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="info-section">
        <h3>ℹ️ Como funciona?</h3>
        <ul>
          <li>📤 Você pode enviar arquivos para seu professor (trabalhos, exercícios, etc)</li>
          <li>📥 Seu professor pode compartilhar materiais de estudo com você</li>
          <li>⬇️ Clique em "Baixar" para fazer download dos arquivos recebidos</li>
          <li>🗑️ Arquivos são deletados automaticamente após o download</li>
        </ul>
      </div>
    </div>
  );
}
