import { supabase } from '../lib/supabase';

async function testUserConfig(userId: string) {
  const { data, error } = await supabase
    .from('user_configs')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) {
    console.error('Erro ao buscar user_config:', error.message);
    return false;
  }
  if (!data) {
    console.log('Nenhuma configuração encontrada para user_id:', userId);
    return false;
  }
  console.log('Configuração encontrada:', data);
  return true;
}

// Exemplo de uso: substitua pelo user_id do usuário logado
const userId = 'COLOQUE_O_USER_ID_AQUI';
testUserConfig(userId).then((result) => {
  if (result) {
    console.log('Teste: Usuário está configurado, não deve abrir setup.');
  } else {
    console.log('Teste: Usuário NÃO está configurado, deve abrir setup.');
  }
});
