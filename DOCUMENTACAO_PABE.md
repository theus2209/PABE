# 📋 DOCUMENTAÇÃO COMPLETA DO SISTEMA PABE
**Posto Avançado de Boa Esperança**  
**Corpo de Bombeiros Militar de Minas Gerais**

---

## 📱 VISÃO GERAL DO SISTEMA

O **PABE** (Posto Avançado de Boa Esperança) é um sistema integrado de gestão operacional desenvolvido para o Corpo de Bombeiros Militar de Minas Gerais. O sistema está disponível em duas versões:

- **Versão Mobile** (React Native) - Para dispositivos iOS e Android
- **Versão Web** (React) - Acessível via navegador

Ambas as versões compartilham o mesmo backend (OnSpace Cloud/Supabase), garantindo sincronização completa de dados entre plataformas.

---

## 🎨 LAYOUT E DESIGN

### Identidade Visual

**Cores Principais:**
- Vermelho CBMMG: `#DC2626` (red-600)
- Vermelho Escuro: `#991B1B` (red-800)
- Gradientes: Do vermelho para vermelho escuro
- Fundo dos Cards: Preto com gradiente (`from-gray-900 to-black`)

**Tipografia:**
- Fonte padrão do sistema
- Títulos: Bold, tamanhos variados (text-3xl, text-2xl, text-xl)
- Corpo: Regular, text-sm e text-base

**Logo:**
- Brasão oficial do CBMMG
- Posicionado centralmente na tela inicial
- Fundo branco circular

### Estrutura de Navegação

```
┌─────────────────────────────┐
│  Header (Vermelho escuro)   │
│  - Título da página          │
│  - Botão voltar             │
│  - Botão atualizar          │
└─────────────────────────────┘
┌─────────────────────────────┐
│                             │
│   Conteúdo Principal        │
│   (Fundo vermelho gradiente)│
│                             │
└─────────────────────────────┘
```

---

## 🔐 SISTEMA DE AUTENTICAÇÃO

### Tela de Login

**Campos:**
1. **Número BM**: Campo de texto para identificação do bombeiro
2. **Senha**: Campo de senha com opção de visualizar/ocultar
3. **Lembrar-me**: Checkbox para manter sessão ativa
4. **Botão "ENTRAR"**: Botão principal de acesso

**Funcionalidades:**
- Validação de campos obrigatórios
- Mensagens de erro específicas
- Proteção de autenticação segura
- Redirecionamento automático ao dashboard após login bem-sucedido

**Link "Cadastre-se":**
- Navega para a tela de cadastro de novos usuários

---

### Tela de Cadastro

**Campos Obrigatórios:**
1. **Email**: Email institucional ou pessoal
2. **CPF**: Validação automática de formato
3. **Número BM**: Número de registro do bombeiro
4. **Graduação**: Seleção de posto/graduação
   - Opções: Cel, Ten Cel, Maj, Cap, 1º Ten, 2º Ten, Sub Ten, 1º Sgt, 2º Sgt, 3º Sgt, Cb, Sd
5. **Nome de Guerra**: Nome de identificação operacional
6. **Senha**: Mínimo 6 caracteres
7. **Confirmar Senha**: Validação de correspondência

**Fluxo de Cadastro:**
1. Usuário preenche o formulário
2. Sistema valida os dados
3. Cria conta no sistema
4. Status inicial: "Pendente de aprovação"
5. Aguarda aprovação de administrador
6. Após aprovação, usuário pode fazer login

**Validações:**
- CPF válido e não duplicado
- Email não duplicado
- Senha forte
- Todos os campos preenchidos

---

## 🏠 DASHBOARD PRINCIPAL

### Layout do Dashboard

**Cabeçalho:**
- Saudação personalizada: "Bem-vindo [Graduação] [Nome de Guerra]"
- Logo CBMMG centralizado
- Título "PABE"
- Subtítulo "Posto Avançado de Boa Esperança"
- Botão "Sair" no canto superior direito

**Grid de Módulos:**
- Layout em 2 colunas
- Total de 14 cards (13 módulos + botão sair)
- Cards com hover effect (zoom + sombra)
- Cada card contém:
  - Ícone em círculo cinza
  - Nome do módulo
  - Cor de fundo escuro com gradiente

---

## 📦 MÓDULOS E FUNCIONALIDADES

### 1. 📢 ANÚNCIOS

**Ícone:** Megafone (Megaphone)  
**Cor:** Azul (`bg-blue-500`)

**Funcionalidades:**
- Visualizar anúncios importantes
- Adicionar novos anúncios (com título e URL)
- Remover anúncios (long press ou clique direito)
- Abrir links em nova aba
- Buscar anúncios por título

**Campos:**
- Título do anúncio
- URL do link

**Notificações:**
- Envia notificação Telegram ao adicionar anúncio
- Todos os dispositivos cadastrados recebem

---

### 2. 🚛 MAPA CARGA

**Ícone:** Caminhão (Truck)  
**Cor:** Verde (`bg-green-500`)

**Funcionalidades:**
- Gerenciar viaturas operacionais
- Cadastrar materiais por viatura
- Categorizar materiais
- Marcar viatura como recebida
- Visualizar inventário completo
- Buscar materiais
- Reordenar viaturas (setas cima/baixo)

**Categorias de Material:**
- Resgate
- Combate a Incêndio
- APH (Atendimento Pré-Hospitalar)
- Equipamento Individual
- Outros

**Interações:**
- Toque no card da viatura: Abre detalhes
- Long press: Exclui viatura
- Setas: Reordena viaturas
- Toggle "Recebido": Marca conferência

---

### 3. 📖 CAUTELAS

**Ícone:** Livro aberto (BookOpen)  
**Cor:** Roxo (`bg-purple-500`)

**Funcionalidades:**
- Registrar cautelas de material
- Controlar empréstimos
- Registrar devoluções
- Filtrar por status (ativas/devolvidas)
- Buscar cautelas
- Notificação automática via Telegram

**Campos - Nova Cautela:**
- Material
- Data da Cautela
- Militar Solicitante

**Campos - Devolução:**
- Data da Devolução
- Militar que Recebeu

**Notificações Telegram:**
- Nova cautela registrada
- Devolução confirmada

---

### 4. 🔄 ALTERAÇÕES

**Ícone:** Setas circulares (RefreshCw)  
**Cor:** Laranja (`bg-orange-500`)

**Funcionalidades:**
- Registrar alterações detectadas
- Marcar alterações como resolvidas
- Filtrar por status (pendentes/resolvidas)
- Buscar alterações
- Notificação Telegram

**Campos - Nova Alteração:**
- Alteração Detectada (descrição)
- Data da Alteração
- Militar que Identificou

**Campos - Resolução:**
- Data da Resolução
- Militar que Confirmou Resolução

**Notificações:**
- Nova alteração detectada
- Alteração resolvida

---

### 5. 📅 ESCALA

**Ícone:** Calendário (Calendar)  
**Cor:** Rosa (`bg-pink-500`)

**Funcionalidades:**
- Gerenciar escalas mensais
- Organizar militares por ala (1, 2, 3, 4)
- Editar informações de militares
- Reordenar militares (setas cima/baixo)
- Adicionar observações
- Categorizar militares
- Exportar escala (futuro)

**Seleção de Mês:**
- Calendário dropdown
- Formato: YYYY-MM
- Criação automática se não existir

**Campos - Militar:**
- Nome do Militar
- Ala (1, 2, 3, 4)
- Categoria (Motorista, Socorrista, Comandante, etc.)
- Observação (opcional)

**Operações:**
- Adicionar militar
- Editar militar (ícone lápis)
- Reordenar (setas cima/baixo)
- Excluir militar (ícone lixeira)

**Avisos:**
- Confirmação antes de sair sem salvar
- Validação de campos obrigatórios

---

### 6. ⏰ SOBREAVISO

**Ícone:** Relógio (Clock)  
**Cor:** Amarelo (`bg-yellow-500`)

**Funcionalidades:**
- Upload de documentos importantes
- Gerenciar documentos de sobreaviso
- Visualizar documentos
- Excluir documentos
- Storage em bucket seguro

**Tipos de Arquivo Suportados:**
- PDF
- Imagens (JPG, PNG)
- Documentos Word (DOC, DOCX)

**Operações:**
- Upload de arquivo
- Visualizar documento (abre em nova aba)
- Excluir documento (long press)

---

### 7. 🚗 GESTÃO DE FROTA

**Ícone:** Carro (Car)  
**Cor:** Vermelho (`bg-red-500`)

**Funcionalidades:**
- Cadastrar viaturas
- Registrar manutenções
- Histórico de serviços
- Controle de quilometragem
- Reordenar viaturas (setas cima/baixo)

**Campos - Viatura:**
- Nome da viatura (ex: "ABT-123")

**Campos - Manutenção:**
- Tipo de Serviço (Troca de óleo, Revisão, Pneus, etc.)
- KM Atual
- Data do Serviço
- Local (oficina/prestador)

**Visualização:**
- Lista de viaturas
- Detalhes por viatura
- Histórico cronológico de manutenções

---

### 8. 🏠 HIDRANTES

**Ícone:** Casa (Home)  
**Cor:** Ciano (`bg-cyan-500`)

**Funcionalidades:**
- Cadastrar hidrantes
- Geolocalização (latitude/longitude)
- Buscar por endereço ou cidade
- Abrir no Google Maps
- Reordenar hidrantes

**Campos:**
- Descrição do hidrante
- Endereço completo
- Cidade
- Latitude
- Longitude

**Interações:**
- Botão de mapa: Abre Google Maps
- Busca: Filtro por endereço/cidade
- Reordenação: Setas cima/baixo

---

### 9. 🔥 BOMBEIROS

**Ícone:** Chama (Flame)  
**Cor:** Vermelho escuro (`bg-red-600`)

**Funcionalidades:**
- Lista de contatos de bombeiros
- Ligação rápida (botão telefone)
- Buscar contatos
- Drag & Drop para reordenar
- Exclusão via long press

**Campos:**
- Posto/Graduação
- Nome de Guerra
- Telefone

**Ordenação Padrão:**
Por hierarquia (Cel → Ten Cel → Maj → ... → Sd)

**Interações:**
- Botão telefone: Inicia ligação
- Arrastar: Reordena contatos
- Long press: Exclui contato

---

### 10. 🏥 SAMU

**Ícone:** Prédio médico (Building2)  
**Cor:** Verde escuro (`bg-green-600`)

**Funcionalidades:**
- Lista de contatos SAMU
- Ligação rápida
- Buscar contatos
- Drag & Drop para reordenar
- Exclusão via long press

**Campos:**
- Função (Médico, Enfermeiro, Técnico, Condutor)
- Nome de Guerra
- Telefone

**Ordenação Padrão:**
Por função (Médico → Enfermeiro → Técnico → Condutor)

**Interações:**
- Idênticas ao módulo Bombeiros

---

### 11. 👥 CONTATOS ÚTEIS

**Ícone:** Pessoas (Users)  
**Cor:** Índigo (`bg-indigo-500`)

**Funcionalidades:**
- Organizar contatos por categorias
- Criar categorias personalizadas
- Adicionar múltiplos contatos por categoria
- Ligação rápida
- Buscar contatos
- Reordenar categorias

**Estrutura:**
- Nível 1: Categorias (ex: Polícia, Hospital, Prefeitura)
- Nível 2: Contatos dentro de cada categoria

**Campos - Categoria:**
- Nome da categoria

**Campos - Contato:**
- Nome
- Telefone

**Interações:**
- Toque na categoria: Abre lista de contatos
- Long press: Exclui categoria ou contato
- Arrastar: Reordena categorias

---

### 12. 📍 ZONA RURAL

**Ícone:** Pin de mapa (MapPin)  
**Cor:** Verde esmeralda (`bg-emerald-500`)

**Funcionalidades:**
- Cadastrar cidades da zona rural
- Registrar pontos de referência
- Geolocalização
- Abrir no Google Maps
- Buscar pontos

**Estrutura:**
- Nível 1: Cidades
- Nível 2: Pontos de referência por cidade

**Campos - Cidade:**
- Nome da cidade

**Campos - Ponto:**
- Descrição do ponto
- Latitude
- Longitude

**Interações:**
- Toque na cidade: Abre pontos
- Botão mapa: Abre Google Maps
- Long press: Exclui

---

### 13. 📱 CADASTRAR DISPOSITIVO

**Ícone:** Smartphone (Smartphone)  
**Cor:** Violeta (`bg-violet-500`)

**Funcionalidades:**
- Vincular dispositivo ao bot Telegram
- Receber notificações do sistema
- Gerenciar dispositivos ativos

**Processo de Cadastro:**
1. Abrir o bot do Telegram: @[nome_do_bot]
2. Enviar o comando `/start`
3. Bot responde com o Chat ID
4. Inserir o Chat ID no campo do app
5. Confirmar cadastro
6. Sistema verifica e ativa dispositivo

**Notificações Recebidas:**
- Novas cautelas
- Devoluções de cautelas
- Novas alterações
- Alterações resolvidas
- Novos anúncios

---

## 🔔 SISTEMA DE NOTIFICAÇÕES

### Telegram Bot

**Configuração:**
- Bot configurado via secret `TELEGRAM_BOT_TOKEN`
- Webhook ativo para receber comandos
- Envio via Edge Function `send-telegram-notification`

**Comandos do Bot:**
- `/start` - Retorna o Chat ID do usuário

**Formato das Mensagens:**
- HTML formatado
- Emojis para categorização
- Informações completas do evento

**Tipos de Notificação:**

1. **Nova Cautela:**
```
📋 Nova Cautela Registrada

📦 Material: [material]
📅 Data: [data]
👤 Solicitante: [militar]
```

2. **Devolução de Cautela:**
```
✅ Devolução de Cautela

📦 Material: [material]
📅 Data Devolução: [data]
👤 Recebido por: [militar]
```

3. **Nova Alteração:**
```
⚠️ Nova Alteração Detectada

📝 Descrição: [alteracao]
📅 Data: [data]
👤 Identificado por: [militar]
```

4. **Alteração Resolvida:**
```
✅ Alteração Resolvida

📝 Descrição: [alteracao]
📅 Data Resolução: [data]
👤 Confirmado por: [militar]
```

5. **Novo Anúncio:**
```
📢 Novo Anúncio

📌 [titulo]
🔗 Link: [url]
```

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### Tabelas Principais

#### `user_profiles`
- `id` (UUID) - PK, FK para auth.users
- `email` (TEXT)
- `numero_bm` (TEXT)
- `graduacao` (TEXT)
- `nome_guerra` (TEXT)
- `cpf` (TEXT)
- `status_aprovacao` (TEXT) - 'pendente', 'aprovado', 'rejeitado'
- `is_admin` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMP)

#### `cautelas`
- `id` (UUID) - PK
- `user_id` (UUID) - FK para user_profiles
- `material` (TEXT)
- `data_cautela` (DATE)
- `militar_solicitante` (TEXT)
- `devolvido` (BOOLEAN)
- `data_devolucao` (DATE)
- `militar_recebeu` (TEXT)

#### `escalas`
- `id` (UUID) - PK
- `user_id` (UUID) - FK
- `mes_referencia` (TEXT) - Formato YYYY-MM

#### `militares_escalados`
- `id` (UUID) - PK
- `escala_id` (UUID) - FK para escalas
- `ala` (INTEGER) - 1, 2, 3, 4
- `militar_nome` (TEXT)
- `categoria` (TEXT)
- `observacao` (TEXT)
- `ordem` (INTEGER)

#### `dispositivos`
- `id` (UUID) - PK
- `user_id` (UUID) - FK (nullable)
- `chat_id` (TEXT) - Chat ID do Telegram
- `ativo` (BOOLEAN)

*(Mais 20+ tabelas para outros módulos)*

---

## 🔒 SEGURANÇA E PERMISSÕES

### Row Level Security (RLS)

**Todas as tabelas têm RLS habilitado**

**Políticas Comuns:**

1. **Leitura de Dados Públicos:**
   - Todos usuários autenticados podem ver
   - Exemplo: Contatos, Hidrantes, Escalas

2. **Inserção de Dados:**
   - Usuário autenticado pode inserir
   - `user_id` automaticamente preenchido

3. **Atualização/Exclusão:**
   - Apenas proprietário (`user_id = auth.uid()`)
   - Ou administradores

### Autenticação

- **JWT Tokens** via Supabase Auth
- **Session persistente** opcional
- **Timeout** configurable
- **Email verification** (desabilitado por padrão)

---

## 📊 FUNCIONALIDADES ESPECIAIS

### 1. Busca Global
- Todos os módulos têm busca integrada
- Busca em tempo real (filtro local)
- Busca por múltiplos campos

### 2. Ordenação Customizada
- Drag & Drop (desktop)
- Setas cima/baixo (mobile/desktop)
- Persistência no banco de dados

### 3. Long Press Actions
- Mobile: Segurar 800ms para excluir
- Desktop: Clique direito do mouse
- Feedback visual (escala + opacidade)

### 4. Validação de Formulários
- Todos campos obrigatórios validados
- Mensagens de erro específicas
- Prevenção de duplicatas

### 5. Confirmações
- Diálogos de confirmação para exclusões
- Avisos antes de perder alterações
- Toasts informativos

---

## 🌐 COMPATIBILIDADE

### Navegadores Suportados
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Dispositivos Móveis
- iOS 14+ (Safari)
- Android 8+ (Chrome)

### Responsividade
- Mobile First Design
- Breakpoints: sm, md, lg, xl
- Grid adaptativo (1-2-3 colunas)

---

## 📱 INTEGRAÇÃO MOBILE/WEB

### Backend Compartilhado

**URL do Backend:**
```
https://dbukdthyxgpwicgqdbuk.backend.onspace.ai
```

**Autenticação:**
- Mesmas credenciais em ambas plataformas
- Sincronização automática de dados
- Sessões independentes

**Dados:**
- Todas alterações sincronizam instantaneamente
- Sem necessidade de refresh manual
- Conflitos resolvidos por timestamp

---

## 🛠️ TECNOLOGIAS UTILIZADAS

### Frontend (Web)
- **React** 18.3
- **TypeScript** 5.x
- **Vite** 5.x
- **Tailwind CSS** 3.x
- **shadcn/ui** - Componentes
- **React Router** - Navegação
- **Sonner** - Toasts
- **Lucide React** - Ícones
- **Recharts** - Gráficos (futuro)

### Backend
- **OnSpace Cloud** (Supabase-compatible)
- **PostgreSQL** - Database
- **Edge Functions** - Serverless
- **Storage** - Arquivos

### Integrações
- **Telegram Bot API**
- **Google Maps API** (via URL)

---

## 📞 SUPORTE E CONTATO

### Administradores do Sistema
Contate os administradores através do canal oficial do CBMMG.

### Problemas Técnicos
1. Verifique sua conexão com internet
2. Limpe cache do navegador
3. Tente fazer logout/login novamente
4. Entre em contato com TI

### Reportar Bugs
Reporte bugs ou sugestões aos administradores do sistema.

---

## 📝 CHANGELOG

### Versão 1.0.0 (Atual)
- ✅ Sistema de login e cadastro
- ✅ 13 módulos operacionais
- ✅ Notificações Telegram
- ✅ Sincronização mobile/web
- ✅ RLS completo
- ✅ Busca e ordenação

### Próximas Funcionalidades (Roadmap)
- 📊 Dashboard estatístico
- 📤 Exportação de relatórios (PDF/Excel)
- 🔔 Push notifications (mobile)
- 👥 Chat interno
- 📸 Upload de fotos em ocorrências
- 🗺️ Mapa interativo de recursos

---

## ⚠️ OBSERVAÇÕES IMPORTANTES

1. **Backup de Dados:**
   - Sistema não possui backup automático visível
   - Recomenda-se exportar dados importantes periodicamente

2. **Privacidade:**
   - Todos os dados são criptografados
   - Apenas usuários autorizados têm acesso
   - Logs de auditoria (futuro)

3. **Performance:**
   - Sistema otimizado para conexões 3G+
   - Cache local para melhor experiência
   - Lazy loading de imagens

4. **Manutenção:**
   - Sistema atualizado regularmente
   - Manutenções programadas com aviso prévio
   - Tempo de inatividade mínimo

---

**Documento gerado em:** {{ data_atual }}  
**Versão do Sistema:** 1.0.0  
**CBMMG - Posto Avançado de Boa Esperança**

---

*Este documento é confidencial e destinado exclusivamente ao uso interno do Corpo de Bombeiros Militar de Minas Gerais.*
