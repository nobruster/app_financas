-- ============================================================
-- SECURITY HARDENING — Refatora RLS para:
--   1. Fixar search_path em is_approved (aviso do linter)
--   2. Criar is_current_user_admin() SECURITY DEFINER — elimina recursão
--      em policies de profiles (subquery em profiles dentro de policy de profiles)
--   3. Refazer policies de profiles sem recursão + admin SELECT
--      + negar INSERT/DELETE a authenticated (só service_role via trigger)
--   4. Refazer policies UPDATE/DELETE de transactions usando a função nova
--   5. Usar (SELECT auth.uid()) para cachear por linha
-- Execute no SQL Editor do Supabase.
-- ============================================================

-- 1. is_approved com search_path fixo
CREATE OR REPLACE FUNCTION public.is_approved()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND status = 'approved'
  );
$$;

-- 2. is_current_user_admin — SECURITY DEFINER bypassa RLS, evita recursão
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
      AND status = 'approved'
  );
$$;

-- 3. PROFILES — dropa policies antigas e recria sem recursão
DROP POLICY IF EXISTS "select_own_profile"        ON public.profiles;
DROP POLICY IF EXISTS "admin_update_profiles"     ON public.profiles;
DROP POLICY IF EXISTS "Lê próprio perfil"         ON public.profiles;
DROP POLICY IF EXISTS "Admin lê todos"            ON public.profiles;
DROP POLICY IF EXISTS "Admin atualiza"            ON public.profiles;
DROP POLICY IF EXISTS "Usuário vê próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Admin vê todos os perfis"  ON public.profiles;
DROP POLICY IF EXISTS "Admin atualiza perfis"     ON public.profiles;

-- Policy unificada (evita WARN de multiple_permissive_policies)
CREATE POLICY "profiles_select_own_or_admin"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = id
    OR public.is_current_user_admin()
  );

CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

-- Sem policy de INSERT/DELETE → negado a anon/authenticated.
-- Criação de perfil é feita pelo trigger handle_new_user (SECURITY DEFINER).

-- 4. TRANSACTIONS — refaz todas as policies sem subquery recursiva
DROP POLICY IF EXISTS "Criador ou admin atualiza transação" ON public.transactions;
DROP POLICY IF EXISTS "Criador ou admin exclui transação"   ON public.transactions;
DROP POLICY IF EXISTS "Aprovados veem todas as transações"  ON public.transactions;
DROP POLICY IF EXISTS "Aprovados inserem transações"        ON public.transactions;

CREATE POLICY "transactions_select_approved"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (public.is_approved());

CREATE POLICY "transactions_insert_approved"
  ON public.transactions FOR INSERT
  TO authenticated
  WITH CHECK (public.is_approved() AND (SELECT auth.uid()) = user_id);

CREATE POLICY "transactions_update_owner_or_admin"
  ON public.transactions FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id OR public.is_current_user_admin())
  WITH CHECK ((SELECT auth.uid()) = user_id OR public.is_current_user_admin());

CREATE POLICY "transactions_delete_owner_or_admin"
  ON public.transactions FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id OR public.is_current_user_admin());

-- 5. CATEGORIES — escopa ao role authenticated (estava sem role explícito)
DROP POLICY IF EXISTS "Autenticados leem categorias ativas" ON public.categories;

CREATE POLICY "categories_select_active"
  ON public.categories FOR SELECT
  TO authenticated
  USING (active = true);
-- Sem policy de INSERT/UPDATE/DELETE → apenas service_role via Server Actions.
