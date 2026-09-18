export interface GaragemItem {
  id: string;
  usuarioId: string;
  modeloMotoId: number;
  marca: string;
  modelo: string;
  anoInicio?: number | null;
  anoFim?: number | null;
  anoFabricacao: number;
  apelido?: string | null;
  fotoMotoUrl?: string | null;
}

export interface ModeloMoto {
  id: number;
  marca: string;
  modelo: string;
  anoInicio?: number | null;
  anoFim?: number | null;
  nomeExibicao: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface OfertaBuscaItem {
  estoqueId: string;
  pecaId: number;
  nomePeca: string;
  categoria: string;
  fotoPecaUrl?: string | null;
  sku?: string | null;
  codigoEan?: string | null;
  especificacoes?: string | null;
  lojaId: string;
  nomeLoja: string;
  enderecoCompleto: string;
  telefoneContato?: string | null;
  latitude: number;
  longitude: number;
  mediaAvaliacaoLoja: number;
  totalAvaliacoesLoja: number;
  precoVenda: number;
  emPromocao: boolean;
  precoPromocional?: number | null;
  precoEfetivo: number;
  promocaoAtiva: boolean;
  quantidadeEstoque: number;
  distanciaKm?: number | null;
  compativel: boolean;
  scoreRecomendacao: number;
}

export interface BuscaResultado {
  ofertas: PagedResult<OfertaBuscaItem>;
  motoFiltroModeloId?: number | null;
  motoFiltroDescricao?: string | null;
  filtroCompatibilidadeAtivo: boolean;
  raioKmAplicado?: number | null;
  ordenacaoAplicada: string;
}

export interface Peca {
  id: number;
  sku?: string | null;
  codigoEan?: string | null;
  nome: string;
  descricao?: string | null;
  categoria: string;
  fotoPecaUrl?: string | null;
  especificacoes?: string | null;
}

export interface Loja {
  id: string;
  usuarioId: string;
  nomeFantasia: string;
  cnpj?: string | null;
  enderecoCompleto: string;
  latitude: number;
  longitude: number;
  telefoneContato?: string | null;
  emailContato?: string | null;
  horariosFuncionamento?: string | null;
  fotoPerfilUrl?: string | null;
  galeriaFotosUrls?: string[] | null;
  ativa: boolean;
  mediaAvaliacao: number;
  totalAvaliacoes: number;
  distanciaKm?: number | null;
}

export interface OfertaDetalhe {
  estoqueId: string;
  peca: Peca;
  loja: Loja;
  compatibilidades: ModeloMoto[];
  quantidadeEstoque: number;
  precoVenda: number;
  emPromocao: boolean;
  precoPromocional?: number | null;
  precoEfetivo: number;
  promocaoAtiva: boolean;
  dataInicioPromocao?: string | null;
  dataFimPromocao?: string | null;
  distanciaKm?: number | null;
  visualizacoes: number;
  cliques: number;
}

export interface Avaliacao {
  id: string;
  lojaId: string;
  usuarioId: string;
  nomeUsuario: string;
  nota: number;
  comentario?: string | null;
  recomenda: boolean;
  dataAvaliacao: string;
}

export interface AvaliacoesResumo {
  lojaId: string;
  mediaNotas: number;
  totalAvaliacoes: number;
  percentualRecomendacao: number;
  avaliacoes: Avaliacao[];
}

export interface EstoqueItem {
  id: string;
  lojaId: string;
  pecaId: number;
  nomePeca: string;
  categoria: string;
  sku?: string | null;
  fotoPecaUrl?: string | null;
  quantidadeEstoque: number;
  precoVenda: number;
  emPromocao: boolean;
  precoPromocional?: number | null;
  precoEfetivo: number;
  promocaoAtiva: boolean;
  dataInicioPromocao?: string | null;
  dataFimPromocao?: string | null;
  atualizadoEm: string;
}
