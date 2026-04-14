-- FinançasPessoais — Schema do Banco de Dados
-- Execute este arquivo no SQL Editor do Supabase
-- Projeto: https://SEU-PROJETO.supabase.co

-- ============================================================
-- TABELA: transactions
-- ============================================================
CREATE TABLE transactions (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type        TEXT        CHECK (type IN ('income', 'expense')) NOT NULL,
  amount      NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  description TEXT        NOT NULL,
  category    TEXT        NOT NULL,
  date        DATE        NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Cada usuário só acessa suas próprias transações
-- ============================================================
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem apenas suas transações"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários inserem apenas suas transações"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários atualizam apenas suas transações"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários deletam apenas suas transações"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- ÍNDICES (performance)
-- ============================================================
CREATE INDEX idx_transactions_user_id ON transactions (user_id);
CREATE INDEX idx_transactions_date    ON transactions (date DESC);
CREATE INDEX idx_transactions_type    ON transactions (type);
