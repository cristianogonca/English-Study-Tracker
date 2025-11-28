import React, { useState, useEffect } from 'react';
import { ArquivosService } from '../services/ArquivosService';
import type { ArquivoCompartilhado } from '../types/ArquivoCompartilhado';
import './AlunoArquivos.css';

export function AlunoArquivos() {
  const [arquivos, setArquivos] = useState<ArquivoCompartilhado[]>([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [filtroBaixado, setFiltroBaixado] = useState<'todos' | 'baixados' | 'pendentes'>('todos');

  useEffect(() => {
    carregarArquivos();
  }, []);

  const carregarArquivos = async () => {
    setLoading(true);
    const result = await ArquivosService.listarArquivos();
    if (result.success && result.arquivos) {
      setArquivos(result.arquivos);
    } else {
      console.error('Erro ao carregar arquivos:', result.error);
      setMensagem({ tipo: 'erro', texto: result.error || 'Erro ao carregar arquivos' });
    }
    setLoading(false);
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

      // Perguntar se deseja deletar
      if (confirm('Download concluído! Deseja deletar o arquivo agora?')) {
        await handleDeletar(arquivoId, nomeArquivo);
      } else {
        setMensagem({ tipo: 'sucesso', texto: 'Download realizado com sucesso!' });
        await carregarArquivos(); // Recarregar para atualizar status
      }
    } else {
      setMensagem({ tipo: 'erro', texto: result.error || 'Erro ao baixar arquivo' });
    }
  };

  const handleDeletar = async (arquivoId: string, nomeArquivo: string) => {
    const result = await ArquivosService.deletarArquivo(arquivoId);
    if (result.success) {
      setMensagem({ tipo: 'sucesso', texto: 'Arquivo deletado com sucesso!' });
      await carregarArquivos();
    } else {
      setMensagem({ tipo: 'erro', texto: result.error || 'Erro ao deletar arquivo' });
    }
  };

  const arquivosFiltrados = arquivos.filter(arq => {
    if (filtroBaixado === 'todos') return true;
    if (filtroBaixado === 'baixados') return arq.baixado;
    if (filtroBaixado === 'pendentes') return !arq.baixado;
    return true;
  });

  const arquivosPendentes = arquivos.filter(arq => !arq.baixado).length;

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

      <div className="arquivos-section">
        <div className="arquivos-header">
          <h2>Arquivos Compartilhados ({arquivosFiltrados.length})</h2>
          <div className="filtros">
            <select value={filtroBaixado} onChange={(e) => setFiltroBaixado(e.target.value as any)}>
              <option value="todos">Todos</option>
              <option value="pendentes">Pendentes</option>
              <option value="baixados">Baixados</option>
            </select>
          </div>
        </div>

        {arquivosFiltrados.length === 0 ? (
          <div className="vazio">
            <p>📭 Nenhum arquivo compartilhado ainda.</p>
            <p className="dica">Seu professor pode compartilhar materiais de estudo com você por aqui!</p>
          </div>
        ) : (
          <div className="arquivos-lista">
            {arquivosFiltrados.map(arquivo => (
              <div key={arquivo.id} className={`arquivo-card ${arquivo.baixado ? 'baixado' : 'pendente'}`}>
                <div className="arquivo-icone">
                  {ArquivosService.getIconePorTipo(arquivo.tipo_arquivo)}
                </div>
                <div className="arquivo-info">
                  <h3>{arquivo.nome_arquivo}</h3>
                  <p className="professor">👨‍🏫 {arquivo.professor_nome}</p>
                  <p className="detalhes">
                    📏 {ArquivosService.formatarTamanho(arquivo.tamanho_bytes)} •
                    📅 {new Date(arquivo.data_upload).toLocaleDateString('pt-BR')} às {new Date(arquivo.data_upload).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {arquivo.observacao && (
                    <p className="observacao">💬 {arquivo.observacao}</p>
                  )}
                  <p className="status">
                    {arquivo.baixado ? (
                      <span className="badge baixado">✅ Baixado em {new Date(arquivo.data_baixado!).toLocaleDateString('pt-BR')}</span>
                    ) : (
                      <span className="badge pendente">⏳ Pendente</span>
                    )}
                  </p>
                </div>
                <div className="arquivo-acoes">
                  <button
                    className="btn-primary"
                    onClick={() => handleBaixar(arquivo.id, arquivo.nome_arquivo)}
                    title="Baixar arquivo"
                  >
                    ⬇️ Baixar
                  </button>
                  <button
                    className="btn-deletar"
                    onClick={() => handleDeletar(arquivo.id, arquivo.nome_arquivo)}
                    title="Deletar arquivo"
                  >
                    🗑️ Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="info-section">
        <h3>ℹ️ Como funciona?</h3>
        <ul>
          <li>📥 Seu professor pode compartilhar materiais de estudo, exercícios e outros arquivos com você</li>
          <li>⬇️ Clique em "Baixar" para fazer download do arquivo</li>
          <li>🗑️ Após baixar, você pode deletar o arquivo se desejar</li>
          <li>✅ Arquivos baixados ficam marcados para controle</li>
        </ul>
      </div>
    </div>
  );
}
