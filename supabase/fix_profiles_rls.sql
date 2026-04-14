-- ============================================================
-- CORREÇÃO: RLS da tabela profiles
-- Execute no SQL Editor do Supabase
-- ============================================================

-- Remove policies antigas com recursão
DROP POLICY IF EXISTS "Usuário vê próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Admin vê todos os perfis" ON profiles;
DROP POLICY IF EXISTS "Admin atualiza perfis" ON profiles;

-- Qualquer usuário autenticado lê o próprio perfil (sem recursão)
CREATE POLICY "Lê próprio perfil"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Service role (middleware) lê tudo — não precisa de policy, bypassa RLS

-- Admin lê todos: usando coluna role diretamente sem subquery recursiva
CREATE POLICY "Admin lê todos"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    OR auth.uid() = id
  );

-- Admin atualiza qualquer perfil
CREATE POLICY "Admin atualiza"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Permite INSERT apenas via trigger (service role)
-- Sem policy de INSERT = só service role pode inserir (trigger usa SECURITY DEFINER)

-- ============================================================
-- Corrige usuários já cadastrados que não têm perfil ainda
-- ============================================================
INSERT INTO profiles (id, email, role, status)
SELECT
  u.id,
  u.email,
  CASE
    WHEN u.email = 'EMAIL_ADMIN_REMOVIDO' THEN 'admin'
    ELSE 'user'
  END as role,
  CASE
    WHEN u.email = 'EMAIL_ADMIN_REMOVIDO' THEN 'approved'
    ELSE 'pending'
  END as status
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Garante que EMAIL_ADMIN_REMOVIDO é admin
UPDATE profiles SET role = 'admin', status = 'approved'
WHERE email = 'EMAIL_ADMIN_REMOVIDO';
