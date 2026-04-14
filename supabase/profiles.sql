-- ============================================================
-- TABELA: profiles
-- Controle de perfis, roles e status de aprovação
-- Execute este arquivo no SQL Editor do Supabase
-- ============================================================

CREATE TABLE profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT        NOT NULL,
  role        TEXT        NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  status      TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  approved_at TIMESTAMPTZ,
  approved_by UUID        REFERENCES profiles(id)
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Usuário vê apenas o próprio perfil
CREATE POLICY "Usuário vê próprio perfil"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Admin vê todos os perfis
CREATE POLICY "Admin vê todos os perfis"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin atualiza qualquer perfil
CREATE POLICY "Admin atualiza perfis"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- TRIGGER: cria perfil automaticamente ao cadastrar
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  user_count INT;
  user_role  TEXT;
  user_status TEXT;
BEGIN
  -- Conta quantos perfis já existem
  SELECT COUNT(*) INTO user_count FROM profiles;

  -- Primeiro usuário = admin aprovado automaticamente
  IF user_count = 0 THEN
    user_role   := 'admin';
    user_status := 'approved';
  ELSE
    user_role   := 'user';
    user_status := 'pending';
  END IF;

  INSERT INTO profiles (id, email, role, status)
  VALUES (NEW.id, NEW.email, user_role, user_status);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- Promove seu usuário existente a admin (execute APÓS criar a tabela)
-- Substitua pelo seu email se já tiver conta criada
-- ============================================================
-- INSERT INTO profiles (id, email, role, status)
-- SELECT id, email, 'admin', 'approved'
-- FROM auth.users
-- WHERE email = 'SEU_EMAIL_AQUI'
-- ON CONFLICT (id) DO UPDATE SET role = 'admin', status = 'approved';
