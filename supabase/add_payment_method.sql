-- ============================================================
-- Adiciona coluna payment_method na tabela transactions
-- Execute este arquivo no SQL Editor do Supabase
-- ============================================================

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS payment_method TEXT
  NOT NULL DEFAULT 'dinheiro'
  CHECK (payment_method IN ('dinheiro', 'pix', 'conta', 'debito', 'credito'));
