import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArquivosService } from '../services/ArquivosService';
import type { ArquivoCompartilhado } from '../types/ArquivoCompartilhado';
import './ProfessorArquivos.css';

interface Aluno {
  id: string;
  nome: string;
  email: string;
}

export function ProfessorArquivos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [arquivos, setArquivos] = useState<ArquivoCompartilhado[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [alunoSelecionado, setAlunoSelecionado] = useState('');
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);
  const [observacao, setObservacao] = useState('');
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Filtros
  const [filtroAluno, setFiltroAluno] = useState('');
  const [filtroBaixado, setFiltroBaixado] = useState<'todos' | 'baixados' | 'pendentes'>('todos');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    await Promise.all([carregarAlunos(), carregarArquivos()]);
    setLoading(false);
  };

  const carregarAlunos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('usuarios_professor_aluno')
        .select(`
          aluno_id,
          perfis!usuarios_professor_aluno_aluno_id_fkey (
            id,
            nome,
            email
          )
        `)
        .eq('professor_id', user.id);

      if (error) {
        console.error('Erro ao carregar alunos:', error);
        return;
      }

      const alunosFormatados = (data || [])
        .map((item: any) => ({
          id: item.perfis.id,
          nome: item.perfis.nome,
          email: item.perfis.email
        }))
        .filter((aluno: Aluno) => aluno.id && aluno.nome);

      setAlunos(alunosFormatados);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
    }
  };

  const carregarArquivos = async () => {
    const result = await ArquivosService.listarArquivos();
    if (result.success && result.arquivos) {
      setArquivos(result.arquivos);
    } else {
      console.error('Erro ao carregar arquivos:', result.error);
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

    if (!alunoSelecionado || !arquivoSelecionado) {
      setMensagem({ tipo: 'erro', texto: 'Selecione um aluno e um arquivo' });
      return;
    }

    setUploading(true);
    setMensagem(null);

    const result = await ArquivosService.uploadArquivo({
      aluno_id: alunoSelecionado,
      arquivo: arquivoSelecionado,
      observacao: observacao.trim() || undefined
    });

    setUploading(false);

    if (result.success) {
      setMensagem({ tipo: 'sucesso', texto: 'Arquivo enviado com sucesso!' });
      setAlunoSelecionado('');
      setArquivoSelecionado(null);
      setObservacao('');
      (document.getElementById('arquivo-input') as HTMLInputElement).value = '';
      await carregarArquivos();
    } else {
      setMensagem({ tipo: 'erro', texto: result.error || 'Erro ao enviar arquivo' });
    }
  };

  const handleDeletar = async (arquivoId: string, nomeArquivo: string) => {
    if (!confirm(`Deseja realmente deletar o arquivo "${nomeArquivo}"?`)) {
      return;
    }

    const result = await ArquivosService.deletarArquivo(arquivoId);
    if (result.success) {
      setMensagem({ tipo: 'sucesso', texto: 'Arquivo deletado com sucesso!' });
      await carregarArquivos();
    } else {
      setMensagem({ tipo: 'erro', texto: result.error || 'Erro ao deletar arquivo' });
    }
  };

  const handleBaixar = async (arquivoId: string, nomeArquivo: string) => {
    const result = await ArquivosService.baixarArquivo(arquivoId);
    if (result.success && result.blob) {
      const url = window.URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.nomeArquivo || nomeArquivo;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      setMensagem({ tipo: 'erro', texto: result.error || 'Erro ao baixar arquivo' });
    }
  };

  const arquivosFiltrados = arquivos.filter(arq => {
    const matchAluno = !filtroAluno || arq.aluno_id === filtroAluno;
    const matchBaixado = 
      filtroBaixado === 'todos' ||
      (filtroBaixado === 'baixados' && arq.baixado) ||
      (filtroBaixado === 'pendentes' && !arq.baixado);
    return matchAluno && matchBaixado;
  });

  if (loading) {
    return <div className="professor-arquivos loading">Carregando...</div>;
  }

  return (
    <div className="professor-arquivos">
      <h1>📁 Compartilhar Arquivos</h1>

      {mensagem && (
        <div className={`mensagem ${mensagem.tipo}`}>
          {mensagem.texto}
        </div>
      )}

      {/* Formulário de Upload */}
      <div className="upload-section">
        <h2>Enviar Novo Arquivo</h2>
        <form onSubmit={handleUpload} className="upload-form">
          <div className="form-group">
            <label htmlFor="aluno-select">Aluno *</label>
            <select
              id="aluno-select"
              value={alunoSelecionado}
              onChange={(e) => setAlunoSelecionado(e.target.value)}
              required
              disabled={uploading}
            >
              <option value="">Selecione um aluno</option>
              {alunos.map(aluno => (
                <option key={aluno.id} value={aluno.id}>
                  {aluno.nome} ({aluno.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="arquivo-input">Arquivo * (máx 50 MB)</label>
            <input
              id="arquivo-input"
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
            <label htmlFor="observacao">Observação (opcional)</label>
            <textarea
              id="observacao"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex: Material para a prova da semana que vem"
              rows={3}
              disabled={uploading}
            />
          </div>

          <button type="submit" disabled={uploading || !alunoSelecionado || !arquivoSelecionado}>
            {uploading ? '📤 Enviando...' : '📤 Enviar Arquivo'}
          </button>
        </form>
      </div>

      {/* Lista de Arquivos */}
      <div className="arquivos-section">
        <div className="arquivos-header">
          <h2>Arquivos Enviados ({arquivosFiltrados.length})</h2>
          <div className="filtros">
            <select value={filtroAluno} onChange={(e) => setFiltroAluno(e.target.value)}>
              <option value="">Todos os alunos</option>
              {alunos.map(aluno => (
                <option key={aluno.id} value={aluno.id}>{aluno.nome}</option>
              ))}
            </select>

            <select value={filtroBaixado} onChange={(e) => setFiltroBaixado(e.target.value as any)}>
              <option value="todos">Todos</option>
              <option value="pendentes">Pendentes</option>
              <option value="baixados">Baixados</option>
            </select>
          </div>
        </div>

        {arquivosFiltrados.length === 0 ? (
          <p className="vazio">Nenhum arquivo encontrado.</p>
        ) : (
          <div className="arquivos-lista">
            {arquivosFiltrados.map(arquivo => (
              <div key={arquivo.id} className={`arquivo-card ${arquivo.baixado ? 'baixado' : 'pendente'}`}>
                <div className="arquivo-icone">
                  {ArquivosService.getIconePorTipo(arquivo.tipo_arquivo)}
                </div>
                <div className="arquivo-info">
                  <h3>{arquivo.nome_arquivo}</h3>
                  <p className="aluno">👤 {arquivo.aluno_nome}</p>
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
                    className="btn-secundario"
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
    </div>
  );
}
