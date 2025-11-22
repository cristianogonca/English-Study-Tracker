import { supabase } from '../lib/supabase';
import SupabaseAuthService from '../services/SupabaseAuthService';

/**
 * Diagnostic script to compare logged-in user_id with all user_ids in user_configs table.
 * Run this file manually in your environment for debugging.
 */
async function runDiagnostic() {
  const usuario = await SupabaseAuthService.getUsuarioAtual();
  const userId = usuario?.id;
  console.log('Usuário logado:', usuario);
  console.log('user_id do usuário logado:', userId);

  const { data, error } = await supabase
    .from('user_configs')
    .select('user_id, nome');

  if (error) {
    console.error('Erro ao buscar user_configs:', error);
    return;
  }

  console.log('user_ids presentes em user_configs:');
  if (data && data.length > 0) {
    data.forEach((row: any) => {
      console.log(`user_id: ${row.user_id} | nome: ${row.nome}`);
    });
    const found = data.some((row: any) => row.user_id === userId);
    if (found) {
      console.log('Configuração encontrada para o usuário logado!');
    } else {
      console.warn('NÃO há configuração para o usuário logado.');
    }
  } else {
    console.warn('Nenhum registro encontrado em user_configs.');
  }
}

runDiagnostic();
