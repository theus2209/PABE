export interface Cautela {
  id: string;
  user_id: string;
  material: string;
  data_cautela: string;
  militar_solicitante: string;
  devolvido: boolean;
  data_devolucao?: string;
  militar_recebeu?: string;
  created_at: string;
  updated_at: string;
}

export interface Viatura {
  id: string;
  user_id: string;
  prefixo: string;
  recebido: boolean;
  ordem?: number;
  created_at: string;
  updated_at: string;
  materiais: Material[];
}

export interface Material {
  id: string;
  viatura_id: string;
  material: string;
  quantidade: number;
  categoria?: string;
  created_at: string;
}

export interface MaterialViatura {
  id: string;
  viatura_id: string;
  material: string;
  quantidade: number;
  categoria?: string;
  created_at: string;
}

export interface Anuncio {
  id: string;
  user_id: string;
  titulo: string;
  url: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentoSobreaviso {
  id: string;
  user_id: string;
  titulo: string;
  arquivo_url: string;
  mes_referencia: string;
  created_at: string;
}

export interface Dispositivo {
  id: string;
  user_id?: string;
  chat_id: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Alteracao {
  id: string;
  user_id: string;
  alteracao_detectada: string;
  data_alteracao: string;
  militar_identificou: string;
  resolvida: boolean;
  data_resolucao?: string;
  militar_confirma_resolucao?: string;
  created_at: string;
  updated_at: string;
}

export interface Escala {
  id: string;
  user_id: string;
  mes_referencia: string; // formato: "YYYY-MM"
  created_at: string;
  updated_at: string;
  militares?: MilitarEscalado[];
}

export interface MilitarEscalado {
  id: string;
  escala_id: string;
  ala: number; // 1, 2, 3 ou 4
  militar_nome: string;
  categoria?: string;
  observacao?: string;
  ordem?: number;
  created_at: string;
}

export interface GestaoFrotaViatura {
  id: string;
  user_id: string;
  nome: string;
  created_at: string;
}

export interface GestaoFrotaManutencao {
  id: string;
  viatura_id: string;
  tipo_servico: string;
  km_atual: number;
  data: string;
  local: string;
  created_at: string;
}

export interface BombeiroContato {
  id: string;
  user_id: string;
  posto_graduacao: string;
  nome_guerra: string;
  telefone: string;
  ordem?: number;
  created_at: string;
  updated_at: string;
}

export interface SamuContato {
  id: string;
  user_id: string;
  funcao: string;
  nome_guerra: string;
  telefone: string;
  ordem?: number;
  created_at: string;
  updated_at: string;
}

export interface Hidrante {
  id: string;
  user_id: string;
  descricao: string;
  cidade: string;
  endereco?: string;
  latitude: number;
  longitude: number;
  ordem?: number;
  created_at: string;
  updated_at: string;
}

export interface ContatosUteisCategoria {
  id: string;
  user_id: string;
  nome: string;
  created_at: string;
  updated_at: string;
}

export interface ContatosUteisContato {
  id: string;
  categoria_id: string;
  nome: string;
  telefone: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  numero_bm?: string;
  graduacao?: string;
  nome_guerra?: string;
  cpf?: string;
  status_aprovacao?: 'pendente' | 'aprovado' | 'rejeitado';
  is_admin?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (numeroBm: string, password: string) => Promise<void>;
  register: (email: string, password: string, graduacao: string, nomeGuerra: string, numeroBm: string, cpf: string) => Promise<void>;
  signOut: () => Promise<void>;
}
