-- =============================================
-- SCRIPT COMPLETO DE SEED - DONA ONÇA
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- PASSO 1: Garantir que as colunas existem
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cep TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS complement TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS neighborhood TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS state TEXT;

-- =============================================
-- PASSO 2: CRIAR CLIENTES FICTÍCIOS
-- (usando IDs que serão usados nos pedidos)
-- =============================================

-- Para criar clientes de verdade, precisamos inserir na auth.users primeiro
-- Mas como isso requer privilégios de admin, vamos inserir apenas profiles
-- Você pode criar esses usuários manualmente no Auth do Supabase depois

-- Verificar se já existem profiles e adicionar dados se necessário
DO $$
BEGIN
    -- Se não há profiles não-admin, vamos inserir o profile do usuário atual com mais dados
    UPDATE profiles 
    SET 
        full_name = COALESCE(full_name, 'Cliente Principal'),
        phone = COALESCE(phone, '(11) 99999-0000'),
        city = COALESCE(city, 'São Paulo'),
        state = COALESCE(state, 'SP')
    WHERE is_admin = false AND full_name IS NULL;
END $$;

-- =============================================
-- PASSO 3: INSERIR MUITOS PEDIDOS
-- =============================================

-- Pegar o ID do primeiro usuário não-admin
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    SELECT id INTO user_uuid FROM profiles WHERE is_admin = false LIMIT 1;
    
    IF user_uuid IS NOT NULL THEN
        -- Janeiro 2026 (mês atual)
        INSERT INTO orders (id, user_id, items, total, status, created_at) VALUES
        ('11111111-aaaa-aaaa-aaaa-111111111111', user_uuid, '[{"productId": 1, "productName": "Calcinha Fio Dental Rendada", "quantity": 2, "price": 45.90}]'::jsonb, 91.80, 'Entregue', NOW() - INTERVAL '1 day'),
        ('22222222-aaaa-aaaa-aaaa-222222222222', user_uuid, '[{"productId": 2, "productName": "Sutiã Push-Up Básico", "quantity": 1, "price": 89.90}]'::jsonb, 89.90, 'Enviado', NOW() - INTERVAL '2 days'),
        ('33333333-aaaa-aaaa-aaaa-333333333333', user_uuid, '[{"productId": 3, "productName": "Conjunto Renda Preta", "quantity": 1, "price": 159.90}]'::jsonb, 159.90, 'Pago', NOW() - INTERVAL '3 days'),
        ('44444444-aaaa-aaaa-aaaa-444444444444', user_uuid, '[{"productId": 4, "productName": "Babydoll Cetim Rosa", "quantity": 1, "price": 129.90}]'::jsonb, 129.90, 'Pago', NOW() - INTERVAL '4 days'),
        ('55555555-aaaa-aaaa-aaaa-555555555555', user_uuid, '[{"productId": 5, "productName": "Camisola Longa Seda", "quantity": 1, "price": 179.90}]'::jsonb, 179.90, 'Pendente', NOW() - INTERVAL '5 days'),
        ('66666666-aaaa-aaaa-aaaa-666666666666', user_uuid, '[{"productId": 1, "productName": "Calcinha Fio Dental", "quantity": 3, "price": 45.90}]'::jsonb, 137.70, 'Entregue', NOW() - INTERVAL '6 days'),
        ('77777777-aaaa-aaaa-aaaa-777777777777', user_uuid, '[{"productId": 6, "productName": "Espartilho Corpete", "quantity": 1, "price": 199.90}]'::jsonb, 199.90, 'Entregue', NOW() - INTERVAL '7 days'),
        ('88888888-aaaa-aaaa-aaaa-888888888888', user_uuid, '[{"productId": 2, "productName": "Sutiã Push-Up", "quantity": 2, "price": 89.90}]'::jsonb, 179.80, 'Enviado', NOW() - INTERVAL '8 days'),
        ('99999999-aaaa-aaaa-aaaa-999999999999', user_uuid, '[{"productId": 3, "productName": "Conjunto Renda", "quantity": 2, "price": 159.90}]'::jsonb, 319.80, 'Entregue', NOW() - INTERVAL '10 days'),
        ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', user_uuid, '[{"productId": 4, "productName": "Babydoll Cetim", "quantity": 1, "price": 129.90}]'::jsonb, 129.90, 'Entregue', NOW() - INTERVAL '12 days')
        ON CONFLICT (id) DO NOTHING;

        -- Dezembro 2025
        INSERT INTO orders (id, user_id, items, total, status, created_at) VALUES
        ('11111111-bbbb-bbbb-bbbb-111111111111', user_uuid, '[{"productId": 1, "productName": "Calcinha Fio Dental", "quantity": 2, "price": 45.90}]'::jsonb, 91.80, 'Entregue', NOW() - INTERVAL '35 days'),
        ('22222222-bbbb-bbbb-bbbb-222222222222', user_uuid, '[{"productId": 5, "productName": "Camisola Longa", "quantity": 1, "price": 179.90}]'::jsonb, 179.90, 'Entregue', NOW() - INTERVAL '40 days'),
        ('33333333-bbbb-bbbb-bbbb-333333333333', user_uuid, '[{"productId": 6, "productName": "Espartilho", "quantity": 1, "price": 199.90}]'::jsonb, 199.90, 'Entregue', NOW() - INTERVAL '42 days'),
        ('44444444-bbbb-bbbb-bbbb-444444444444', user_uuid, '[{"productId": 2, "productName": "Sutiã Push-Up", "quantity": 1, "price": 89.90}]'::jsonb, 89.90, 'Entregue', NOW() - INTERVAL '45 days'),
        ('55555555-bbbb-bbbb-bbbb-555555555555', user_uuid, '[{"productId": 3, "productName": "Conjunto Renda", "quantity": 1, "price": 159.90}]'::jsonb, 159.90, 'Cancelado', NOW() - INTERVAL '48 days'),
        ('66666666-bbbb-bbbb-bbbb-666666666666', user_uuid, '[{"productId": 4, "productName": "Babydoll", "quantity": 2, "price": 129.90}]'::jsonb, 259.80, 'Entregue', NOW() - INTERVAL '50 days'),
        ('77777777-bbbb-bbbb-bbbb-777777777777', user_uuid, '[{"productId": 1, "productName": "Calcinha", "quantity": 5, "price": 45.90}]'::jsonb, 229.50, 'Entregue', NOW() - INTERVAL '52 days'),
        ('88888888-bbbb-bbbb-bbbb-888888888888', user_uuid, '[{"productId": 5, "productName": "Camisola", "quantity": 1, "price": 179.90}]'::jsonb, 179.90, 'Entregue', NOW() - INTERVAL '55 days')
        ON CONFLICT (id) DO NOTHING;

        -- Novembro 2025
        INSERT INTO orders (id, user_id, items, total, status, created_at) VALUES
        ('11111111-cccc-cccc-cccc-111111111111', user_uuid, '[{"productId": 6, "productName": "Espartilho", "quantity": 1, "price": 199.90}]'::jsonb, 199.90, 'Entregue', NOW() - INTERVAL '60 days'),
        ('22222222-cccc-cccc-cccc-222222222222', user_uuid, '[{"productId": 2, "productName": "Sutiã", "quantity": 2, "price": 89.90}]'::jsonb, 179.80, 'Entregue', NOW() - INTERVAL '65 days'),
        ('33333333-cccc-cccc-cccc-333333333333', user_uuid, '[{"productId": 3, "productName": "Conjunto", "quantity": 1, "price": 159.90}]'::jsonb, 159.90, 'Entregue', NOW() - INTERVAL '70 days'),
        ('44444444-cccc-cccc-cccc-444444444444', user_uuid, '[{"productId": 1, "productName": "Calcinha", "quantity": 4, "price": 45.90}]'::jsonb, 183.60, 'Entregue', NOW() - INTERVAL '75 days'),
        ('55555555-cccc-cccc-cccc-555555555555', user_uuid, '[{"productId": 4, "productName": "Babydoll", "quantity": 1, "price": 129.90}]'::jsonb, 129.90, 'Devolvido', NOW() - INTERVAL '78 days'),
        ('66666666-cccc-cccc-cccc-666666666666', user_uuid, '[{"productId": 5, "productName": "Camisola", "quantity": 2, "price": 179.90}]'::jsonb, 359.80, 'Entregue', NOW() - INTERVAL '80 days')
        ON CONFLICT (id) DO NOTHING;

        -- Outubro 2025
        INSERT INTO orders (id, user_id, items, total, status, created_at) VALUES
        ('11111111-dddd-dddd-dddd-111111111111', user_uuid, '[{"productId": 1, "productName": "Calcinha", "quantity": 3, "price": 45.90}]'::jsonb, 137.70, 'Entregue', NOW() - INTERVAL '90 days'),
        ('22222222-dddd-dddd-dddd-222222222222', user_uuid, '[{"productId": 6, "productName": "Espartilho", "quantity": 1, "price": 199.90}]'::jsonb, 199.90, 'Entregue', NOW() - INTERVAL '95 days'),
        ('33333333-dddd-dddd-dddd-333333333333', user_uuid, '[{"productId": 2, "productName": "Sutiã", "quantity": 1, "price": 89.90}]'::jsonb, 89.90, 'Entregue', NOW() - INTERVAL '100 days'),
        ('44444444-dddd-dddd-dddd-444444444444', user_uuid, '[{"productId": 3, "productName": "Conjunto", "quantity": 2, "price": 159.90}]'::jsonb, 319.80, 'Entregue', NOW() - INTERVAL '105 days'),
        ('55555555-dddd-dddd-dddd-555555555555', user_uuid, '[{"productId": 4, "productName": "Babydoll", "quantity": 1, "price": 129.90}]'::jsonb, 129.90, 'Entregue', NOW() - INTERVAL '110 days')
        ON CONFLICT (id) DO NOTHING;

        -- Setembro 2025
        INSERT INTO orders (id, user_id, items, total, status, created_at) VALUES
        ('11111111-eeee-eeee-eeee-111111111111', user_uuid, '[{"productId": 5, "productName": "Camisola", "quantity": 1, "price": 179.90}]'::jsonb, 179.90, 'Entregue', NOW() - INTERVAL '120 days'),
        ('22222222-eeee-eeee-eeee-222222222222', user_uuid, '[{"productId": 1, "productName": "Calcinha", "quantity": 2, "price": 45.90}]'::jsonb, 91.80, 'Entregue', NOW() - INTERVAL '130 days'),
        ('33333333-eeee-eeee-eeee-333333333333', user_uuid, '[{"productId": 6, "productName": "Espartilho", "quantity": 1, "price": 199.90}]'::jsonb, 199.90, 'Entregue', NOW() - INTERVAL '140 days'),
        ('44444444-eeee-eeee-eeee-444444444444', user_uuid, '[{"productId": 2, "productName": "Sutiã", "quantity": 3, "price": 89.90}]'::jsonb, 269.70, 'Entregue', NOW() - INTERVAL '150 days'),
        ('55555555-eeee-eeee-eeee-555555555555', user_uuid, '[{"productId": 3, "productName": "Conjunto", "quantity": 1, "price": 159.90}]'::jsonb, 159.90, 'Entregue', NOW() - INTERVAL '160 days')
        ON CONFLICT (id) DO NOTHING;

        -- Agosto 2025
        INSERT INTO orders (id, user_id, items, total, status, created_at) VALUES
        ('11111111-ffff-ffff-ffff-111111111111', user_uuid, '[{"productId": 4, "productName": "Babydoll", "quantity": 2, "price": 129.90}]'::jsonb, 259.80, 'Entregue', NOW() - INTERVAL '170 days'),
        ('22222222-ffff-ffff-ffff-222222222222', user_uuid, '[{"productId": 5, "productName": "Camisola", "quantity": 1, "price": 179.90}]'::jsonb, 179.90, 'Entregue', NOW() - INTERVAL '180 days')
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- =============================================
-- RESUMO
-- =============================================
SELECT 
    (SELECT COUNT(*) FROM profiles WHERE is_admin = false) as total_clientes,
    (SELECT COUNT(*) FROM orders) as total_pedidos,
    (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status NOT IN ('Cancelado', 'Devolvido')) as faturamento_total;
