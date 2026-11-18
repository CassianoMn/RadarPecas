import { Archive, BatteryCharging, Cog, Disc, Wrench } from 'lucide-react';
import type { EstoqueItem } from '../../types';

export type LojistaTab =
  | 'resumo'
  | 'novo-produto'
  | 'estoque'
  | 'ofertas'
  | 'criar-oferta'
  | 'mais-procurados'
  | 'perfil';

export interface EstoqueItemExtended extends EstoqueItem {
  visualizacoes?: number;
  cliques?: number;
  descricaoCompatibilidade?: string | null;
}

export interface ItemMaisProcuradoRegiao {
  posicao?: number;
  pecaId: number;
  nomePeca: string;
  categoria: string;
  compatibilidadeResumo?: string;
  compatibilidade?: string;
  totalBuscas7d?: number;
  buscasUltimos7Dias?: number;
  crescimentoPercentual: number;
  quantidadeEstoqueLoja?: number;
  quantidadeMeuEstoque?: number;
  estoqueIdLoja?: string | null;
  precoVendaLoja?: number | null;
}

export interface DashboardLojistaResponse {
  lojaId: string;
  nomeLoja?: string;
  nomeFantasia?: string;
  totalProdutosCadastrados?: number;
  totalPecasDistintas?: number;
  totalItensEstoqueBaixo?: number;
  itensEstoqueBaixo?: number;
  totalOfertasAtivas: number;
  buscasRadar24h: number;
  totalVisualizacoesOfertas?: number;
  totalCliquesOfertas?: number;
  mediaAvaliacaoLoja?: number;
  totalAvaliacoes: number;
  maisProcuradosRegiao: ItemMaisProcuradoRegiao[];
}

export const PRODUCT_BANNER_IMAGES = [
  'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
];

export const STORE_GALLERY_DEFAULT = [
  {
    title: 'Fachada Principal',
    url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Corredor de Peças e Acessórios',
    url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Bancada de Atendimento Técnico',
    url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
  },
];

export const CATEGORIAS_PADRAO = [
  'Freios',
  'Transmissão',
  'Motor e Filtros',
  'Suspensão',
  'Elétrica e Bateria',
  'Pneus e Rodas',
  'Lubrificantes',
  'Carenagem e Acessórios',
];

export function getCategoriaEstoque(item: EstoqueItemExtended): string {
  return item.categoriaPeca || item.categoria || '';
}

export function renderCategoryIcon(categoriaNome?: string | null, size = 18) {
  const lower = (categoriaNome || '').toLowerCase();
  if (lower.includes('freio') || lower.includes('pastilha') || lower.includes('disco')) {
    return <Disc size={size} />;
  }
  if (lower.includes('transmiss') || lower.includes('relaç') || lower.includes('corrente')) {
    return <Cog size={size} />;
  }
  if (lower.includes('elétric') || lower.includes('eletric') || lower.includes('bateria')) {
    return <BatteryCharging size={size} />;
  }
  if (lower.includes('motor') || lower.includes('óleo') || lower.includes('oleo') || lower.includes('lubrific')) {
    return <Wrench size={size} />;
  }
  return <Archive size={size} />;
}
