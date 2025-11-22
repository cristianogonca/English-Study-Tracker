-- Adicionar políticas de DELETE para todas as tabelas

-- user_configs
CREATE POLICY "Users can delete their own config"
ON user_configs FOR DELETE
USING (auth.uid() = user_id);

-- cronograma
CREATE POLICY "Users can delete their own cronograma"
ON cronograma FOR DELETE
USING (auth.uid() = user_id);

-- vocabulario
CREATE POLICY "Users can delete their own vocabulario"
ON vocabulario FOR DELETE
USING (auth.uid() = user_id);

-- checks_semanais
CREATE POLICY "Users can delete their own checks"
ON checks_semanais FOR DELETE
USING (auth.uid() = user_id);

-- progresso_tarefas
CREATE POLICY "Users can delete their own progresso"
ON progresso_tarefas FOR DELETE
USING (auth.uid() = user_id);

-- fases
CREATE POLICY "Users can delete their own fases"
ON fases FOR DELETE
USING (auth.uid() = user_id);
