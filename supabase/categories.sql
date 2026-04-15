-- ============================================================
-- TABELA: categories
-- Categorias de transações gerenciadas pelo admin
-- Execute no SQL Editor do Supabase
-- ============================================================

CREATE TABLE categories (
  id         UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT    NOT NULL,
  slug       TEXT    NOT NULL UNIQUE,
  type       TEXT    NOT NULL CHECK (type IN ('income', 'expense', 'both')),
  active     BOOLEAN NOT NULL DEFAULT true,
  sort_order INT     NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS: qualquer usuário autenticado lê, apenas admin escreve
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados leem categorias ativas"
  ON categories FOR SELECT
  TO authenticated
  USING (active = true);

-- ============================================================
-- DADOS INICIAIS (mesmas categorias do código atual)
-- ============================================================
INSERT INTO categories (name, slug, type, sort_order) VALUES
  ('Alimentação',   'alimentacao',   'expense', 1),
  ('Transporte',    'transporte',    'expense', 2),
  ('Moradia',       'moradia',       'expense', 3),
  ('Saúde',         'saude',         'expense', 4),
  ('Educação',      'educacao',      'expense', 5),
  ('Lazer',         'lazer',         'expense', 6),
  ('Vestuário',     'vestuario',     'expense', 7),
  ('Salário',       'salario',       'income',  8),
  ('Freelance',     'freelance',     'income',  9),
  ('Investimentos', 'investimentos', 'income',  10),
  ('Outros',        'outros',        'both',    11);
