-- Corrige três achados críticos de RLS confirmados em produção via auditoria
-- (consulta a pg_policies do schema public), executados manualmente no SQL
-- Editor do Supabase e depois versionados aqui para histórico. As três
-- correções foram verificadas em produção reconsultando pg_policies após
-- a execução -- este arquivo reflete o SQL que realmente rodou, não a
-- primeira tentativa.
--
-- Este é o primeiro arquivo de migration do repositório: até agora nenhuma
-- policy de RLS estava versionada em código, só existia como estado do banco.
--
-- Nota sobre os blocos DO $$ ... $$ abaixo: a tentativa inicial de
-- `DROP POLICY "Acesso Público" ON public.products;` (nome digitado/colado
-- direto) falhou com `ERROR: 42704: policy "Acesso Público" for table
-- "products" does not exist` -- o acento em "Público" não batia byte a byte
-- entre o que foi colado no SQL Editor e o que estava armazenado no
-- catálogo. A correção é ler o policyname direto de pg_policies e usar
-- format('DROP POLICY %I ON ...', pol.policyname) -- nunca retypa o nome,
-- então não depende de encoding de quem cola o SQL. Reaplicada também para
-- profiles por segurança, ainda que "Debug Open" não tenha acento.

-- =====================================================================
-- 1. Escalação de privilégio em profiles.is_admin
--
-- A policy "Users can update own profile" tinha USING (auth.uid() = id) e
-- WITH CHECK nulo. Quando WITH CHECK é nulo, o Postgres reusa o USING — e
-- nenhum dos dois examina a coluna is_admin. Qualquer usuário autenticado
-- podia rodar `update({is_admin:true}).eq('id', <próprio id>)` e virar admin.
--
-- O fix trava o valor de is_admin ao que já está salvo para aquele usuário,
-- sem tocar na policy "Admins can update all profiles" (que continua
-- permitindo o toggle de is_admin de outros usuários pelo painel /admin/team).
-- =====================================================================
ALTER POLICY "Users can update own profile" ON public.profiles
WITH CHECK (
  auth.uid() = id
  AND is_admin IS NOT DISTINCT FROM (
    SELECT p.is_admin FROM public.profiles p WHERE p.id = auth.uid()
  )
);

-- =====================================================================
-- 2. Catálogo de produtos sem nenhuma proteção de escrita
--
-- A policy "Acesso Público" era FOR ALL, USING (true), WITH CHECK (true) --
-- cobria SELECT e também INSERT/UPDATE/DELETE, para qualquer cliente com a
-- chave anon, sem exigir login. Qualquer visitante podia apagar o catálogo
-- inteiro pelo devtools do navegador.
--
-- Substituída por leitura pública (mantém o comportamento da vitrine) e
-- escrita restrita a admins, reaproveitando is_admin() já usado em
-- orders/site_settings.
-- =====================================================================
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'products'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.products', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Public can read products" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert products" ON public.products
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE USING (is_admin());

-- =====================================================================
-- 3. PII de todos os clientes exposta em profiles
--
-- Duas policies de SELECT redundantes com USING (true) -- "Debug Open" e
-- "Public profiles are viewable by everyone". Policies permissivas se
-- combinam com OR, então qualquer uma das duas por si só já liberava CPF,
-- endereço, telefone e e-mail de todos os clientes, autenticados ou não.
--
-- Nenhuma página pública do site lê a tabela profiles diretamente (a seção
-- "equipe" do /sobre vem de site_configs), então a remoção não afeta o
-- funcionamento da vitrine.
-- =====================================================================
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
      AND policyname IN ('Debug Open', 'Public profiles are viewable by everyone')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.profiles', pol.policyname);
  END LOOP;
END $$;
