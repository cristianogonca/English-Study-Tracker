import { supabase } from '../lib/supabase';
import SupabaseAuthService from '../services/SupabaseAuthService';

async function debugUserConfig() {
  const usuario = await SupabaseAuthService.getUsuarioAtual();
  if (!usuario) {
    console.log('Nenhum usuário logado.');
    return;
  }
  const userId = usuario.id;
  console.log('Usuário logado:', userId);
  const { data, error } = await supabase
    .from('user_configs')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) {
    console.error('Erro ao buscar user_config:', error.message);
    return;
  }
  if (!data) {
    console.log('Nenhuma configuração encontrada para user_id:', userId);
    return;
  }
  console.log('Configuração encontrada:', data);
}

debugUserConfig();
