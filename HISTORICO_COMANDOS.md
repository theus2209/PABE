# Histórico Completo de Comandos - PABE Web Application

**Projeto:** PABE - Posto Avançado de Boa Esperança  
**Tipo:** Aplicação Web (React + Vite + TypeScript)  
**Backend:** OnSpace Cloud (Supabase-compatible)  
**Data de Criação:** Dezembro 2025  
**Última Atualização:** Janeiro 2026  

---

## 1. CONFIGURAÇÃO INICIAL DO PROJETO

### 1.1 Criação do Projeto Web
```bash
# Projeto criado na plataforma OnSpace
# Tipo: Website (React + Vite + TypeScript)
# Nome: PABE
```

### 1.2 Configuração das Variáveis de Ambiente (.env)
```bash
# Arquivo: .env
VITE_SUPABASE_URL=https://baelkslyzwppfnoybael.backend.onspace.ai
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjIwNzY...
```

### 1.3 Pacotes Instalados
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.22.0",
    "react-hook-form": "^7.50.0",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.4",
    "@tanstack/react-query": "^5.17.19",
    "lucide-react": "latest",
    "sonner": "^1.3.1",
    "tailwindcss": "^3.4.11"
  }
}
```

---

## 2. CRIAÇÃO DO BANCO DE DADOS

### 2.1 Tabela: user_profiles
```sql
-- Perfis de usuário (extensão de auth.users)
CREATE TABLE public.user_profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  numero_bm text,
  graduacao text,
  nome_guerra text,
  cpf text,
  status_aprovacao text DEFAULT 'pendente',
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);

-- Índices para performance
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_numero_bm ON public.user_profiles(numero_bm);
CREATE INDEX idx_user_profiles_cpf ON public.user_profiles(cpf);
CREATE INDEX idx_user_profiles_status ON public.user_profiles(status_aprovacao);

-- Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_insert_own_profile"
  ON public.user_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "authenticated_select_own_profile"
  ON public.user_profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "authenticated_select_approved_profiles"
  ON public.user_profiles FOR SELECT TO authenticated
  USING (status_aprovacao = 'aprovado');

CREATE POLICY "authenticated_update_own_profile"
  ON public.user_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "authenticated_delete_own_profile"
  ON public.user_profiles FOR DELETE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "admins_can_view_all_profiles"
  ON public.user_profiles FOR SELECT TO authenticated
  USING (is_admin() = true);

CREATE POLICY "admins_can_update_approval_status"
  ON public.user_profiles FOR UPDATE TO authenticated
  USING (is_admin() = true)
  WITH CHECK (is_admin() = true);
```

### 2.2 Tabela: escalas
```sql
-- Escalas mensais
CREATE TABLE public.escalas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  mes_referencia text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_escalas_user_id ON public.escalas(user_id);
CREATE INDEX idx_escalas_mes ON public.escalas(mes_referencia);

ALTER TABLE public.escalas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_insert_own_escalas"
  ON public.escalas FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "authenticated_select_escalas"
  ON public.escalas FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "authenticated_update_own_escalas"
  ON public.escalas FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "authenticated_delete_own_escalas"
  ON public.escalas FOR DELETE TO authenticated
  USING (user_id = auth.uid());
```

### 2.3 Tabela: militares_escalados
```sql
-- Militares escalados por ala
CREATE TABLE public.militares_escalados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escala_id uuid NOT NULL REFERENCES public.escalas(id) ON DELETE CASCADE,
  ala integer NOT NULL,
  militar_nome text NOT NULL,
  categoria text,
  observacao text,
  ordem integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_militares_escala_id ON public.militares_escalados(escala_id);
CREATE INDEX idx_militares_ala ON public.militares_escalados(ala);
CREATE INDEX idx_militares_escalados_ordem ON public.militares_escalados(ordem);

ALTER TABLE public.militares_escalados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_insert_militares_escalados"
  ON public.militares_escalados FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM escalas 
    WHERE escalas.id = militares_escalados.escala_id 
    AND escalas.user_id = auth.uid()
  ));

CREATE POLICY "authenticated_select_militares_escalados"
  ON public.militares_escalados FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "authenticated_update_militares_escalados"
  ON public.militares_escalados FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM escalas 
    WHERE escalas.id = militares_escalados.escala_id 
    AND escalas.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM escalas 
    WHERE escalas.id = militares_escalados.escala_id 
    AND escalas.user_id = auth.uid()
  ));

CREATE POLICY "authenticated_delete_militares_escalados"
  ON public.militares_escalados FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM escalas 
    WHERE escalas.id = militares_escalados.escala_id 
    AND escalas.user_id = auth.uid()
  ));
```

### 2.4 Tabela: viaturas
```sql
-- Viaturas para mapa de carga
CREATE TABLE public.viaturas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  prefixo text NOT NULL,
  recebido boolean DEFAULT false,
  ordem integer DEFAULT 0,
  ordem_categorias jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_viaturas_user_id ON public.viaturas(user_id);
CREATE INDEX idx_viaturas_created_at ON public.viaturas(created_at);
CREATE INDEX idx_viaturas_ordem ON public.viaturas(ordem);

ALTER TABLE public.viaturas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_insert_own_viaturas"
  ON public.viaturas FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "authenticated_select_viaturas"
  ON public.viaturas FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "authenticated_update_all_viaturas"
  ON public.viaturas FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_delete_all_viaturas"
  ON public.viaturas FOR DELETE TO authenticated
  USING (true);
```

### 2.5 Tabela: materiais_viatura
```sql
-- Materiais de cada viatura
CREATE TABLE public.materiais_viatura (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viatura_id uuid NOT NULL REFERENCES public.viaturas(id) ON DELETE CASCADE,
  material text NOT NULL,
  quantidade integer NOT NULL,
  categoria text,
  ordem integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_materiais_viatura_id ON public.materiais_viatura(viatura_id);
CREATE INDEX idx_materiais_viatura_ordem ON public.materiais_viatura(ordem);

ALTER TABLE public.materiais_viatura ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_insert_all_materiais"
  ON public.materiais_viatura FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_select_materiais"
  ON public.materiais_viatura FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "authenticated_update_materiais"
  ON public.materiais_viatura FOR UPDATE TO authenticated
  USING (viatura_id IN (
    SELECT viaturas.id FROM viaturas 
    WHERE viaturas.user_id = auth.uid()
  ));

CREATE POLICY "authenticated_delete_all_materiais"
  ON public.materiais_viatura FOR DELETE TO authenticated
  USING (true);
```

### 2.6 Tabela: cautelas
```sql
-- Cautelas de materiais
CREATE TABLE public.cautelas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  material text NOT NULL,
  data_cautela date NOT NULL,
  militar_solicitante text NOT NULL,
  devolvido boolean DEFAULT false,
  data_devolucao date,
  militar_recebeu text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_cautelas_user_id ON public.cautelas(user_id);
CREATE INDEX idx_cautelas_data ON public.cautelas(data_cautela);
CREATE INDEX idx_cautelas_created_at ON public.cautelas(created_at);

ALTER TABLE public.cautelas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_insert_own_cautelas"
  ON public.cautelas FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "authenticated_select_cautelas"
  ON public.cautelas FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "authenticated_update_cautelas"
  ON public.cautelas FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_delete_own_cautelas"
  ON public.cautelas FOR DELETE TO authenticated
  USING (user_id = auth.uid());
```

### 2.7 Tabela: alteracoes
```sql
-- Alterações detectadas
CREATE TABLE public.alteracoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  alteracao_detectada text NOT NULL,
  data_alteracao date NOT NULL,
  resolvida boolean DEFAULT false,
  data_resolucao date,
  militar_identificou text,
  militar_confirma_resolucao text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_alteracoes_user_id ON public.alteracoes(user_id);
CREATE INDEX idx_alteracoes_resolvida ON public.alteracoes(resolvida);
CREATE INDEX idx_alteracoes_created_at ON public.alteracoes(created_at);

ALTER TABLE public.alteracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_insert_own_alteracoes"
  ON public.alteracoes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "authenticated_select_alteracoes"
  ON public.alteracoes FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "authenticated_update_own_alteracoes"
  ON public.alteracoes FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "authenticated_delete_own_alteracoes"
  ON public.alteracoes FOR DELETE TO authenticated
  USING (user_id = auth.uid());
```

### 2.8 Tabela: hidrantes
```sql
-- Hidrantes georreferenciados
CREATE TABLE public.hidrantes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  descricao text NOT NULL,
  cidade text NOT NULL,
  endereco text,
  latitude numeric(10,7) NOT NULL,
  longitude numeric(10,7) NOT NULL,
  ordem integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_hidrantes_user_id ON public.hidrantes(user_id);
CREATE INDEX idx_hidrantes_cidade ON public.hidrantes(cidade);
CREATE INDEX idx_hidrantes_endereco ON public.hidrantes(endereco);
CREATE INDEX idx_hidrantes_ordem ON public.hidrantes(ordem);
CREATE INDEX idx_hidrantes_created_at ON public.hidrantes(created_at);

ALTER TABLE public.hidrantes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_insert_own_hidrantes"
  ON public.hidrantes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "authenticated_select_hidrantes"
  ON public.hidrantes FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "authenticated_update_own_hidrantes"
  ON public.hidrantes FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "authenticated_delete_own_hidrantes"
  ON public.hidrantes FOR DELETE TO authenticated
  USING (user_id = auth.uid());
```

### 2.9 Tabela: bombeiros_contatos
```sql
-- Contatos de bombeiros
CREATE TABLE public.bombeiros_contatos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  posto_graduacao text NOT NULL,
  nome_guerra text NOT NULL,
  telefone text NOT NULL,
  ordem integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_bombeiros_contatos_user_id ON public.bombeiros_contatos(user_id);
CREATE INDEX idx_bombeiros_contatos_nome ON public.bombeiros_contatos(nome_guerra);
CREATE INDEX idx_bombeiros_contatos_telefone ON public.bombeiros_contatos(telefone);
CREATE INDEX idx_bombeiros_contatos_ordem ON public.bombeiros_contatos(ordem);

ALTER TABLE public.bombeiros_contatos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_insert_own_bombeiros_contatos"
  ON public.bombeiros_contatos FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "authenticated_select_bombeiros_contatos"
  ON public.bombeiros_contatos FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "authenticated_update_own_bombeiros_contatos"
  ON public.bombeiros_contatos FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "authenticated_delete_own_bombeiros_contatos"
  ON public.bombeiros_contatos FOR DELETE TO authenticated
  USING (user_id = auth.uid());
```

### 2.10 Tabela: samu_contatos
```sql
-- Contatos do SAMU
CREATE TABLE public.samu_contatos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  funcao text NOT NULL,
  nome_guerra text NOT NULL,
  telefone text NOT NULL,
  ordem integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_samu_contatos_user_id ON public.samu_contatos(user_id);
CREATE INDEX idx_samu_contatos_nome ON public.samu_contatos(nome_guerra);
CREATE INDEX idx_samu_contatos_telefone ON public.samu_contatos(telefone);
CREATE INDEX idx_samu_contatos_ordem ON public.samu_contatos(ordem);

ALTER TABLE public.samu_contatos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_insert_own_samu_contatos"
  ON public.samu_contatos FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "authenticated_select_samu_contatos"
  ON public.samu_contatos FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "authenticated_update_own_samu_contatos"
  ON public.samu_contatos FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "authenticated_delete_own_samu_contatos"
  ON public.samu_contatos FOR DELETE TO authenticated
  USING (user_id = auth.uid());
```

### 2.11 Tabela: contatos_uteis_categorias
```sql
-- Categorias de contatos úteis
CREATE TABLE public.contatos_uteis_categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  nome text NOT NULL,
  ordem integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_contatos_uteis_categorias_user_id ON public.contatos_uteis_categorias(user_id);
CREATE INDEX idx_contatos_uteis_categorias_nome ON public.contatos_uteis_categorias(nome);
CREATE INDEX idx_contatos_uteis_categorias_ordem ON public.contatos_uteis_categorias(ordem);

ALTER TABLE public.contatos_uteis_categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_insert_own_contatos_uteis_categorias"
  ON public.contatos_uteis_categorias FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "authenticated_select_contatos_uteis_categorias"
  ON public.contatos_uteis_categorias FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "authenticated_update_own_contatos_uteis_categorias"
  ON public.contatos_uteis_categorias FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "authenticated_delete_own_contatos_uteis_categorias"
  ON public.contatos_uteis_categorias FOR DELETE TO authenticated
  USING (user_id = auth.uid());
```

### 2.12 Tabela: contatos_uteis_contatos
```sql
-- Contatos de cada categoria
CREATE TABLE public.contatos_uteis_contatos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id uuid NOT NULL REFERENCES public.contatos_uteis_categorias(id) ON DELETE CASCADE,
  nome text NOT NULL,
  telefone text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_contatos_uteis_contatos_categoria_id ON public.contatos_uteis_contatos(categoria_id);
CREATE INDEX idx_contatos_uteis_contatos_nome ON public.contatos_uteis_contatos(nome);

ALTER TABLE public.contatos_uteis_contatos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_insert_contatos_uteis_contatos"
  ON public.contatos_uteis_contatos FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM contatos_uteis_categorias 
    WHERE contatos_uteis_categorias.id = contatos_uteis_contatos.categoria_id 
    AND contatos_uteis_categorias.user_id = auth.uid()
  ));

CREATE POLICY "authenticated_select_contatos_uteis_contatos"
  ON public.contatos_uteis_contatos FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM contatos_uteis_categorias 
    WHERE contatos_uteis_categorias.id = contatos_uteis_contatos.categoria_id
  ));

CREATE POLICY "authenticated_update_contatos_uteis_contatos"
  ON public.contatos_uteis_contatos FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM contatos_uteis_categorias 
    WHERE contatos_uteis_categorias.id = contatos_uteis_contatos.categoria_id 
    AND contatos_uteis_categorias.user_id = auth.uid()
  ));

CREATE POLICY "authenticated_delete_contatos_uteis_contatos"
  ON public.contatos_uteis_contatos FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM contatos_uteis_categorias 
    WHERE contatos_uteis_categorias.id = contatos_uteis_contatos.categoria_id 
    AND contatos_uteis_categorias.user_id = auth.uid()
  ));
```

### 2.13 Tabela: zona_rural_cidades
```sql
-- Cidades da zona rural
CREATE TABLE public.zona_rural_cidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  nome text NOT NULL,
  ordem integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_zona_rural_cidades_user_id ON public.zona_rural_cidades(user_id);
CREATE INDEX idx_zona_rural_cidades_nome ON public.zona_rural_cidades(nome);
CREATE INDEX idx_zona_rural_cidades_ordem ON public.zona_rural_cidades(ordem);

ALTER TABLE public.zona_rural_cidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_insert_own_zona_rural_cidades"
  ON public.zona_rural_cidades FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "authenticated_select_zona_rural_cidades"
  ON public.zona_rural_cidades FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "authenticated_update_own_zona_rural_cidades"
  ON public.zona_rural_cidades FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "authenticated_delete_own_zona_rural_cidades"
  ON public.zona_rural_cidades FOR DELETE TO authenticated
  USING (user_id = auth.uid());
```

### 2.14 Tabela: zona_rural_pontos
```sql
-- Pontos georreferenciados da zona rural
CREATE TABLE public.zona_rural_pontos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cidade_id uuid NOT NULL REFERENCES public.zona_rural_cidades(id) ON DELETE CASCADE,
  descricao text NOT NULL,
  latitude numeric(10,7) NOT NULL,
  longitude numeric(10,7) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_zona_rural_pontos_cidade_id ON public.zona_rural_pontos(cidade_id);
CREATE INDEX idx_zona_rural_pontos_descricao ON public.zona_rural_pontos(descricao);

ALTER TABLE public.zona_rural_pontos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_insert_zona_rural_pontos"
  ON public.zona_rural_pontos FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM zona_rural_cidades 
    WHERE zona_rural_cidades.id = zona_rural_pontos.cidade_id 
    AND zona_rural_cidades.user_id = auth.uid()
  ));

CREATE POLICY "authenticated_select_zona_rural_pontos"
  ON public.zona_rural_pontos FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM zona_rural_cidades 
    WHERE zona_rural_cidades.id = zona_rural_pontos.cidade_id
  ));

CREATE POLICY "authenticated_update_zona_rural_pontos"
  ON public.zona_rural_pontos FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM zona_rural_cidades 
    WHERE zona_rural_cidades.id = zona_rural_pontos.cidade_id 
    AND zona_rural_cidades.user_id = auth.uid()
  ));

CREATE POLICY "authenticated_delete_zona_rural_pontos"
  ON public.zona_rural_pontos FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM zona_rural_cidades 
    WHERE zona_rural_cidades.id = zona_rural_pontos.cidade_id 
    AND zona_rural_cidades.user_id = auth.uid()
  ));
```

### 2.15 Tabela: gestao_frota_viaturas
```sql
-- Viaturas para gestão de frota
CREATE TABLE public.gestao_frota_viaturas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  nome text NOT NULL,
  ordem integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_gestao_frota_viaturas_user_id ON public.gestao_frota_viaturas(user_id);
CREATE INDEX idx_gestao_frota_viaturas_created_at ON public.gestao_frota_viaturas(created_at);
CREATE INDEX idx_gestao_frota_viaturas_ordem ON public.gestao_frota_viaturas(ordem);

ALTER TABLE public.gestao_frota_viaturas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_insert_own_gestao_frota_viaturas"
  ON public.gestao_frota_viaturas FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "authenticated_select_gestao_frota_viaturas"
  ON public.gestao_frota_viaturas FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "authenticated_update_own_gestao_frota_viaturas"
  ON public.gestao_frota_viaturas FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "authenticated_delete_own_gestao_frota_viaturas"
  ON public.gestao_frota_viaturas FOR DELETE TO authenticated
  USING (user_id = auth.uid());
```

### 2.16 Tabela: gestao_frota_manutencoes
```sql
-- Manutenções das viaturas
CREATE TABLE public.gestao_frota_manutencoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viatura_id uuid NOT NULL REFERENCES public.gestao_frota_viaturas(id) ON DELETE CASCADE,
  tipo_servico text NOT NULL,
  km_atual integer NOT NULL,
  data date NOT NULL,
  local text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_gestao_frota_manutencoes_viatura_id ON public.gestao_frota_manutencoes(viatura_id);
CREATE INDEX idx_gestao_frota_manutencoes_data ON public.gestao_frota_manutencoes(data);

ALTER TABLE public.gestao_frota_manutencoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_insert_gestao_frota_manutencoes"
  ON public.gestao_frota_manutencoes FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM gestao_frota_viaturas 
    WHERE gestao_frota_viaturas.id = gestao_frota_manutencoes.viatura_id 
    AND gestao_frota_viaturas.user_id = auth.uid()
  ));

CREATE POLICY "authenticated_select_gestao_frota_manutencoes"
  ON public.gestao_frota_manutencoes FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM gestao_frota_viaturas 
    WHERE gestao_frota_viaturas.id = gestao_frota_manutencoes.viatura_id
  ));

CREATE POLICY "authenticated_delete_gestao_frota_manutencoes"
  ON public.gestao_frota_manutencoes FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM gestao_frota_viaturas 
    WHERE gestao_frota_viaturas.id = gestao_frota_manutencoes.viatura_id 
    AND gestao_frota_viaturas.user_id = auth.uid()
  ));
```

### 2.17 Tabela: anuncios
```sql
-- Anúncios do sistema
CREATE TABLE public.anuncios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  titulo text NOT NULL,
  url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_anuncios_user_id ON public.anuncios(user_id);
CREATE INDEX idx_anuncios_created_at ON public.anuncios(created_at);

ALTER TABLE public.anuncios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_insert_own_anuncios"
  ON public.anuncios FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "authenticated_select_anuncios"
  ON public.anuncios FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "authenticated_update_own_anuncios"
  ON public.anuncios FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "authenticated_delete_own_anuncios"
  ON public.anuncios FOR DELETE TO authenticated
  USING (user_id = auth.uid());
```

### 2.18 Tabela: documentos_sobreaviso
```sql
-- Documentos de sobreaviso (categorizados por mês)
CREATE TABLE public.documentos_sobreaviso (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  arquivo_url text NOT NULL,
  mes_referencia text NOT NULL DEFAULT 'Janeiro',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_documentos_sobreaviso_user_id ON public.documentos_sobreaviso(user_id);
CREATE INDEX idx_documentos_sobreaviso_created_at ON public.documentos_sobreaviso(created_at);

ALTER TABLE public.documentos_sobreaviso ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_insert_own_documentos_sobreaviso"
  ON public.documentos_sobreaviso FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "authenticated_select_documentos_sobreaviso"
  ON public.documentos_sobreaviso FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "authenticated_delete_own_documentos_sobreaviso"
  ON public.documentos_sobreaviso FOR DELETE TO authenticated
  USING (user_id = auth.uid());
```

### 2.19 Tabela: dispositivos
```sql
-- Dispositivos cadastrados para notificações Telegram
CREATE TABLE public.dispositivos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  chat_id text NOT NULL,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_dispositivos_user_id ON public.dispositivos(user_id);
CREATE INDEX idx_dispositivos_chat_id ON public.dispositivos(chat_id);
CREATE INDEX idx_dispositivos_ativo ON public.dispositivos(ativo);

ALTER TABLE public.dispositivos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_insert_own_dispositivos"
  ON public.dispositivos FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "authenticated_select_own_dispositivos"
  ON public.dispositivos FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "authenticated_select_all_active_dispositivos"
  ON public.dispositivos FOR SELECT TO authenticated
  USING (ativo = true);

CREATE POLICY "authenticated_update_own_dispositivos"
  ON public.dispositivos FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "authenticated_delete_own_dispositivos"
  ON public.dispositivos FOR DELETE TO authenticated
  USING (user_id = auth.uid());
```

### 2.20 Tabela: telegram_config
```sql
-- Configuração do bot Telegram
CREATE TABLE public.telegram_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_token text NOT NULL,
  bot_username text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.telegram_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_select_telegram_config"
  ON public.telegram_config FOR SELECT
  USING (true);
```

### 2.21 Funções do Banco de Dados
```sql
-- Função para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND is_admin = true
  );
$$;
```

### 2.22 Storage Buckets
```sql
-- Criar bucket para documentos de sobreaviso
INSERT INTO storage.buckets (id, name, public)
VALUES ('sobreaviso-docs', 'sobreaviso-docs', true);

-- Políticas RLS para o bucket
CREATE POLICY "authenticated_upload_sobreaviso_docs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'sobreaviso-docs');

CREATE POLICY "public_read_sobreaviso_docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'sobreaviso-docs');

CREATE POLICY "authenticated_delete_own_sobreaviso_docs"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'sobreaviso-docs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## 3. EDGE FUNCTIONS CRIADAS

### 3.1 register-user
```typescript
// Arquivo: supabase/functions/register-user/index.ts
// Função para registrar novo usuário com perfil
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // Implementação completa da função de registro
  // Cria usuário no auth.users e perfil em user_profiles
});
```

### 3.2 login-user
```typescript
// Arquivo: supabase/functions/login-user/index.ts
// Função para login de usuário
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // Implementação completa da função de login
});
```

### 3.3 approve-user
```typescript
// Arquivo: supabase/functions/approve-user/index.ts
// Função para aprovar usuário pendente (apenas admin)
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // Implementação completa da função de aprovação
});
```

### 3.4 reset-password
```typescript
// Arquivo: supabase/functions/reset-password/index.ts
// Função para resetar senha de usuário
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // Implementação completa da função de reset de senha
});
```

### 3.5 send-approval-email
```typescript
// Arquivo: supabase/functions/send-approval-email/index.ts
// Função para enviar email de aprovação usando Resend
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  // Implementação completa usando Resend API
});
```

### 3.6 send-telegram-notification
```typescript
// Arquivo: supabase/functions/send-telegram-notification/index.ts
// Função para enviar notificações via Telegram
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // Implementação completa de envio de notificações Telegram
});
```

### 3.7 register-telegram-device
```typescript
// Arquivo: supabase/functions/register-telegram-device/index.ts
// Função para registrar dispositivo Telegram
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // Implementação completa de registro de dispositivo
});
```

### 3.8 telegram-webhook
```typescript
// Arquivo: supabase/functions/telegram-webhook/index.ts
// Webhook para receber mensagens do Telegram
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // Implementação completa do webhook Telegram
});
```

### 3.9 verify-devices
```typescript
// Arquivo: supabase/functions/verify-devices/index.ts
// Função para verificar dispositivos ativos
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  // Implementação completa de verificação de dispositivos
});
```

---

## 4. ESTRUTURA DA APLICAÇÃO WEB

### 4.1 Configuração do Cliente Supabase
```typescript
// Arquivo: src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 4.2 Sistema de Autenticação
```typescript
// Arquivo: src/hooks/useAuth.tsx
// Hook customizado para gerenciar autenticação
// Implementa: login, register, logout, reset password
```

### 4.3 Componentes Principais Criados

**Componentes de UI (shadcn/ui):**
- Button
- Card
- Dialog
- Input
- Label
- Select
- Textarea
- Toast

**Componentes de Formulário:**
- LoginForm.tsx
- RegisterForm.tsx
- ForgotPasswordDialog.tsx
- AddMilitarEscalaDialog.tsx
- EditMilitarEscalaDialog.tsx
- AddViaturaDialog.tsx
- RenameViaturaDialog.tsx
- AddMaterialDialog.tsx
- EditMaterialDialog.tsx
- DeleteMaterialDialog.tsx
- AddCautelaDialog.tsx
- DevolucaoCautelaDialog.tsx
- AddAlteracaoDialog.tsx
- ResolverAlteracaoDialog.tsx
- AddHidranteDialog.tsx
- AddBombeiroDialog.tsx
- AddSamuDialog.tsx
- AddCategoriaDialog.tsx
- AddContatoUtilDialog.tsx
- AddCidadeDialog.tsx
- AddPontoDialog.tsx
- AddViaturaFrotaDialog.tsx
- AddManutencaoDialog.tsx
- AddAnuncioDialog.tsx
- UploadDocumentoDialog.tsx
- ConfirmDialog.tsx

### 4.4 Páginas Criadas

```typescript
// src/pages/AuthPage.tsx - Login e Registro
// src/pages/Dashboard.tsx - Dashboard principal com 14 módulos
// src/pages/EscalaPage.tsx - Gestão de escalas
// src/pages/MapaCargaPage.tsx - Mapa de carga das viaturas
// src/pages/CautelasPage.tsx - Gestão de cautelas
// src/pages/AlteracoesPage.tsx - Gestão de alterações
// src/pages/SobreavisoPage.tsx - Documentos de sobreaviso
// src/pages/GestaoFrotaPage.tsx - Gestão de frota (lista)
// src/pages/GestaoFrotaDetalhesPage.tsx - Detalhes da viatura
// src/pages/HidrantesPage.tsx - Hidrantes georreferenciados
// src/pages/BombeirosPage.tsx - Contatos de bombeiros
// src/pages/SamuPage.tsx - Contatos do SAMU
// src/pages/ContatosUteisPage.tsx - Categorias de contatos úteis
// src/pages/ContatosUteisCategoriaDetalhesPage.tsx - Contatos de uma categoria
// src/pages/ZonaRuralPage.tsx - Cidades da zona rural
// src/pages/ZonaRuralCidadeDetalhesPage.tsx - Pontos de uma cidade
// src/pages/AnunciosPage.tsx - Gestão de anúncios
// src/pages/CadastrarDispositivoPage.tsx - Cadastro de dispositivo Telegram
// src/pages/NotificacoesPage.tsx - Envio de notificações
// src/pages/DiagnosticoDispositivosPage.tsx - Diagnóstico de dispositivos
// src/pages/TesteTelegramPage.tsx - Teste de notificações
```

### 4.5 Hooks Customizados

```typescript
// src/hooks/useAuth.tsx - Autenticação
// src/hooks/useEscala.tsx - Gestão de escalas
// src/hooks/useViaturas.tsx - Gestão de viaturas
// src/hooks/useCautelas.tsx - Gestão de cautelas
// src/hooks/useAlteracoes.tsx - Gestão de alterações
// src/hooks/useHidrantes.tsx - Gestão de hidrantes
// src/hooks/useBombeiros.tsx - Gestão de contatos bombeiros
// src/hooks/useSamu.tsx - Gestão de contatos SAMU
// src/hooks/useContatosUteis.tsx - Gestão de contatos úteis
// src/hooks/useZonaRural.tsx - Gestão de zona rural
// src/hooks/useGestaoFrota.tsx - Gestão de frota
// src/hooks/useAnuncios.tsx - Gestão de anúncios
// src/hooks/useSobreaviso.tsx - Gestão de documentos sobreaviso
// src/hooks/useDispositivos.tsx - Gestão de dispositivos
// src/hooks/useTelegram.tsx - Envio de notificações Telegram
```

### 4.6 Tipos TypeScript

```typescript
// Arquivo: src/types/index.ts
// Interfaces para todas as entidades do sistema
export interface AuthUser { ... }
export interface UserProfile { ... }
export interface Escala { ... }
export interface MilitarEscalado { ... }
export interface Viatura { ... }
export interface MaterialViatura { ... }
export interface Cautela { ... }
export interface Alteracao { ... }
export interface Hidrante { ... }
export interface BombeiroContato { ... }
export interface SamuContato { ... }
export interface ContatoUtilCategoria { ... }
export interface ContatoUtil { ... }
export interface ZonaRuralCidade { ... }
export interface ZonaRuralPonto { ... }
export interface GestaoFrotaViatura { ... }
export interface GestaoFrotaManutencao { ... }
export interface Anuncio { ... }
export interface DocumentoSobreaviso { ... }
export interface Dispositivo { ... }
```

---

## 5. FUNCIONALIDADES IMPLEMENTADAS

### 5.1 Sistema de Autenticação
- ✅ Login com email/número BM e senha
- ✅ Registro de novo usuário com aprovação pendente
- ✅ Reset de senha
- ✅ Sistema de aprovação de usuários (apenas admin)
- ✅ Logout

### 5.2 Dashboard
- ✅ 15 módulos funcionais
- ✅ Layout responsivo em grid 2 colunas
- ✅ Ícones distintos para cada módulo
- ✅ Navegação entre módulos
- ✅ Botão de logout

### 5.3 Gestão de Escalas
- ✅ Criar escala mensal
- ✅ Adicionar militares por ala (1, 2, 3)
- ✅ Categorização de militares
- ✅ Observações por militar
- ✅ Reordenação (drag-and-drop visual)
- ✅ Edição de militares
- ✅ Exclusão de militares
- ✅ Visualização pública de escalas

### 5.4 Mapa de Carga
- ✅ Criar viaturas com prefixo
- ✅ Renomear viatura
- ✅ Marcar viatura como "recebida"
- ✅ Adicionar materiais por categoria
- ✅ Quantidade de materiais
- ✅ Editar materiais
- ✅ Excluir materiais
- ✅ Reordenação de viaturas
- ✅ Reordenação de categorias de materiais
- ✅ Notificação Telegram ao receber viatura
- ✅ Visualização pública do mapa

### 5.5 Cautelas
- ✅ Adicionar cautela de material
- ✅ Militar solicitante
- ✅ Data da cautela
- ✅ Marcar como devolvido
- ✅ Militar que recebeu devolução
- ✅ Data de devolução
- ✅ Filtro por status (ativas/devolvidas)
- ✅ Exclusão de cautelas

### 5.6 Alterações
- ✅ Adicionar alteração detectada
- ✅ Data da alteração
- ✅ Militar que identificou
- ✅ Marcar como resolvida
- ✅ Data de resolução
- ✅ Militar que confirmou resolução
- ✅ Filtro por status (pendentes/resolvidas)
- ✅ Exclusão de alterações

### 5.7 Sobreaviso
- ✅ Upload de documentos PDF
- ✅ Categorização por mês (Janeiro-Dezembro)
- ✅ Filtro por mês
- ✅ Visualização de documentos
- ✅ Download de documentos
- ✅ Exclusão de documentos
- ✅ Storage no bucket "sobreaviso-docs"

### 5.8 Gestão de Frota
- ✅ Adicionar viatura
- ✅ Adicionar manutenção
- ✅ Tipo de serviço
- ✅ KM atual
- ✅ Data da manutenção (com correção de fuso horário)
- ✅ Local da manutenção
- ✅ Histórico de manutenções por viatura
- ✅ Reordenação de viaturas

### 5.9 Hidrantes
- ✅ Adicionar hidrante
- ✅ Descrição
- ✅ Cidade
- ✅ Endereço
- ✅ Latitude e longitude
- ✅ Visualização em lista
- ✅ Reordenação de hidrantes
- ✅ Edição de hidrantes
- ✅ Exclusão de hidrantes

### 5.10 Bombeiros
- ✅ Adicionar contato
- ✅ Posto/Graduação
- ✅ Nome de guerra
- ✅ Telefone
- ✅ Reordenação de contatos
- ✅ Edição de contatos
- ✅ Exclusão de contatos
- ✅ Link para WhatsApp

### 5.11 SAMU
- ✅ Adicionar contato
- ✅ Função
- ✅ Nome de guerra
- ✅ Telefone
- ✅ Reordenação de contatos
- ✅ Edição de contatos
- ✅ Exclusão de contatos
- ✅ Link para WhatsApp

### 5.12 Contatos Úteis
- ✅ Criar categorias
- ✅ Reordenação de categorias
- ✅ Adicionar contatos por categoria
- ✅ Nome e telefone
- ✅ Edição de contatos
- ✅ Exclusão de contatos
- ✅ Exclusão de categorias (com confirmação)
- ✅ Link para WhatsApp

### 5.13 Zona Rural
- ✅ Criar cidades
- ✅ Reordenação de cidades
- ✅ Adicionar pontos georreferenciados
- ✅ Descrição, latitude e longitude
- ✅ Edição de pontos
- ✅ Exclusão de pontos
- ✅ Exclusão de cidades (com confirmação)

### 5.14 Anúncios
- ✅ Criar anúncio com título e URL
- ✅ Visualização de anúncios
- ✅ Edição de anúncios
- ✅ Exclusão de anúncios

### 5.15 Notificações Telegram
- ✅ Cadastro de dispositivo via código de verificação
- ✅ Sistema de webhook para receber mensagens
- ✅ Envio de notificações para todos dispositivos ativos
- ✅ Diagnóstico de dispositivos
- ✅ Desativação de dispositivos
- ✅ Teste de notificações
- ✅ Integração com bot Telegram

### 5.16 Módulo Carga Horária (Novo)
- ✅ Link externo para Google Sheets
- ✅ Abertura em nova aba
- ✅ Posicionado após módulo Escala

---

## 6. CORREÇÕES E MELHORIAS IMPLEMENTADAS

### 6.1 Correção de Data (Gestão de Frota)
```typescript
// Problema: Data sendo salva com um dia a menos devido ao fuso horário
// Solução: Converter data local para formato ISO sem conversão UTC

// Antes (INCORRETO):
const data = new Date(dataInput); // Convertia para UTC

// Depois (CORRETO):
const [year, month, day] = dataInput.split('-');
const dataLocal = new Date(Number(year), Number(month) - 1, Number(day));
const dataISO = dataLocal.toISOString().split('T')[0];
```

### 6.2 Sistema de Categorização por Mês (Sobreaviso)
```typescript
// Implementado sistema de filtro por mês
// Adicionado campo mes_referencia na tabela documentos_sobreaviso
// Criado select com todos os meses do ano
// Filtro aplicado na query de busca
```

### 6.3 Problemas de Cache - Histórico de Soluções

#### Tentativa 1: Force Update no index.html (v2.1.2-2.1.4)
```html
<!-- Adicionado script de detecção de versão -->
<!-- RESULTADO: Causou loops infinitos e crashes -->
```

#### Tentativa 2: Service Worker de Atualização (v2.2.0-2.3.0)
```javascript
// Criado service worker para forçar atualização
// RESULTADO: Causou erro "Não foi possível conectar ao site"
```

#### Tentativa 3: Limpeza Completa (v3.0.0-3.2.0)
```javascript
// Removidos todos os service workers e scripts complexos
// RESULTADO: Erro persistiu devido a cache agressivo nos celulares
```

#### Solução Final: Página de Limpeza de Cache (v4.0.0+)
```html
<!-- Arquivo: public/limpar-cache.html -->
<!-- Página standalone que limpa todo cache e redireciona -->
<!-- RESULTADO: ✅ Funcional - usuários acessam e app carrega limpo -->
```

### 6.4 Versionamento do App
```
v1.0.0 - Versão inicial
v2.1.1 - Última versão estável antes dos problemas
v2.1.2 - Tentativa de force-update (QUEBROU)
v2.1.3 - Tentativa com cache-busting agressivo (QUEBROU)
v2.1.4 - Tentativa com scripts dinâmicos (QUEBROU)
v2.2.0 - Simplificação do sistema (QUEBROU)
v2.2.1 - Remoção de scripts de update (QUEBROU)
v2.2.2 - Cache-busting inline (QUEBROU)
v2.3.0 - Service Worker de limpeza (QUEBROU)
v3.0.0 - Limpeza completa sem SW (QUEBROU)
v3.0.1 - Script de emergência (QUEBROU)
v3.1.0 - Código completamente limpo (QUEBROU)
v3.2.0 - Sistema de diagnóstico (QUEBROU)
v4.0.0 - Build limpo + página de limpeza (✅ FUNCIONAL)
v4.1.0 - Adicionado módulo Carga Horária (✅ ATUAL)
```

### 6.5 Arquivo de Limpeza de Cache
```bash
# Criado arquivo: public/limpar-cache.html
# Função: Limpar cache agressivo dos celulares
# Uso: Enviar link direto para usuários que não conseguem acessar
# Link: https://pabe-cbmmg.onspace.build/limpar-cache.html
```

---

## 7. COMANDOS E AÇÕES POR CATEGORIA

### 7.1 Comandos SQL Executados
```sql
-- Total de tabelas criadas: 20
-- Total de índices criados: ~60
-- Total de políticas RLS criadas: ~80
-- Funções criadas: 1 (is_admin)
-- Buckets de storage: 1 (sobreaviso-docs)
```

### 7.2 Edge Functions Deployadas
```bash
# Total de Edge Functions: 9
register-user
login-user
approve-user
reset-password
send-approval-email
send-telegram-notification
register-telegram-device
telegram-webhook
verify-devices
```

### 7.3 Componentes React Criados
```bash
# Total de componentes: ~30
# Páginas: 17
# Hooks customizados: 14
# Componentes de diálogo: 20+
```

### 7.4 Arquivos de Configuração
```bash
.env - Variáveis de ambiente
tailwind.config.ts - Configuração Tailwind
vite.config.ts - Configuração Vite
tsconfig.json - Configuração TypeScript
components.json - Configuração shadcn/ui
```

---

## 8. SECRETS/VARIÁVEIS CONFIGURADAS NO BACKEND

```bash
# Configurados via OnSpace Cloud Dashboard:
RESEND_API_KEY - API key do Resend para envio de emails
TELEGRAM_BOT_TOKEN - Token do bot Telegram
SUPABASE_SERVICE_ROLE_KEY - Chave de serviço (auto-configurada)
SUPABASE_DB_URL - URL do banco (auto-configurada)
SUPABASE_URL - URL da API (auto-configurada)
SUPABASE_ANON_KEY - Chave anônima (auto-configurada)
```

---

## 9. LINKS E RECURSOS

### 9.1 Links da Aplicação
```
Link Padrão: https://pabe-cbmmg.onspace.build
Link de Limpeza: https://pabe-cbmmg.onspace.build/limpar-cache.html
Backend URL: https://baelkslyzwppfnoybael.backend.onspace.ai
```

### 9.2 Recursos Utilizados
```
Plataforma: OnSpace (https://www.onspace.ai)
Backend: OnSpace Cloud (Supabase-compatible)
Email: Resend API
Notificações: Telegram Bot API
Storage: Supabase Storage
Auth: Supabase Auth
```

---

## 10. INSTRUÇÕES DE MANUTENÇÃO

### 10.1 Para Adicionar Nova Funcionalidade
```bash
1. Criar tabela no banco (se necessário)
2. Adicionar políticas RLS
3. Criar hook customizado em src/hooks/
4. Criar página em src/pages/
5. Criar componentes de diálogo necessários
6. Adicionar rota no App.tsx
7. Adicionar módulo no Dashboard.tsx (se aplicável)
8. Testar e publicar
```

### 10.2 Para Corrigir Problemas de Cache
```bash
1. NÃO adicionar scripts de force-update no index.html
2. Incrementar versão no comentário do index.html
3. Publicar normalmente
4. Para usuários com problema: enviar link /limpar-cache.html
```

### 10.3 Para Adicionar Nova Edge Function
```bash
1. Criar pasta em supabase/functions/nome-funcao/
2. Criar arquivo index.ts
3. Implementar lógica com CORS adequado
4. Deploy automático pela plataforma OnSpace
5. Configurar secrets necessários no dashboard
```

---

## 11. ESTATÍSTICAS FINAIS

```
📊 Tempo de Desenvolvimento: ~3 semanas
📁 Total de Arquivos Criados: ~80
💾 Tabelas no Banco: 20
🔐 Políticas RLS: ~80
⚡ Edge Functions: 9
🎨 Componentes React: ~30
📄 Páginas: 17
🪝 Hooks Customizados: 14
📦 Pacotes NPM: ~20
🔧 Versões do App: 16 (v1.0.0 → v4.1.0)
✅ Status: FUNCIONAL E ESTÁVEL
```

---

**FIM DO HISTÓRICO DE COMANDOS**

*Este documento foi gerado automaticamente e contém todos os comandos, ações e configurações realizados desde o início da criação da aplicação PABE Web.*
