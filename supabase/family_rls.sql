-- ============================================================
-- MODO FAMÍLIA: todos os usuários aprovados veem todas as
-- transações, mas cada um só edita/exclui o que criou.
-- Execute este arquivo no SQL Editor do Supabase.
-- ============================================================

-- Remove políticas antigas de isolamento por usuário
DROP POLICY IF EXISTS "Usuários veem apenas suas transações"  ON transactions;
DROP POLICY IF EXISTS "Usuários inserem apenas suas transações" ON transactions;
DROP POLICY IF EXISTS "Usuários atualizam apenas suas transações" ON transactions;
DROP POLICY IF EXISTS "Usuários deletam apenas suas transações"  ON transactions;

-- Adiciona foreign key de transactions.user_id para profiles.id
-- (necessário para o Supabase permitir joins entre as tabelas)
ALTER TABLE transactions
  DROP CONSTRAINT IF EXISTS transactions_user_id_profiles_fkey;

ALTER TABLE transactions
  ADD CONSTRAINT transactions_user_id_profiles_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Função auxiliar: verifica se o usuário está aprovado
CREATE OR REPLACE FUNCTION is_approved()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND status = 'approved'
  );
$$;

-- SELECT: qualquer usuário aprovado vê todas as transações
DROP POLICY IF EXISTS "Aprovados veem todas as transações" ON transactions;
CREATE POLICY "Aprovados veem todas as transações"
  ON transactions FOR SELECT
  USING (is_approved());

-- INSERT: usuário aprovado insere com seu próprio user_id
DROP POLICY IF EXISTS "Aprovados inserem transações" ON transactions;
CREATE POLICY "Aprovados inserem transações"
  ON transactions FOR INSERT
  WITH CHECK (is_approved() AND auth.uid() = user_id);

-- UPDATE: apenas quem criou pode editar (admin também pode)
DROP POLICY IF EXISTS "Criador ou admin atualiza transação" ON transactions;
CREATE POLICY "Criador ou admin atualiza transação"
  ON transactions FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin' AND status = 'approved'
    )
  );

-- DELETE: apenas quem criou pode excluir (admin também pode)
DROP POLICY IF EXISTS "Criador ou admin exclui transação" ON transactions;
CREATE POLICY "Criador ou admin exclui transação"
  ON transactions FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin' AND status = 'approved'
    )
  );
