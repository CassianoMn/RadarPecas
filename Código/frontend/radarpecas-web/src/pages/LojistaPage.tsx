import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  BarChart2,
  BatteryCharging,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cog,
  Disc,
  Download,
  Eye,
  ImagePlus,
  Info,
  LayoutGrid,
  Loader2,
  Mail,
  MapPin,
  MoreVertical,
  MousePointerClick,
  PackageCheck,
  Pencil,
  Phone,
  Plus,
  PlusCircle,
  Radar,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Store,
  Tag,
  Trash2,
  TrendingUp,
  Wrench,
} from 'lucide-react';
import { api, ApiError } from '../lib/api';
import { useAuth } from '../auth/useAuth';
import { Button, ErrorState, Field, TextInput } from '../components/ui';
import type { EstoqueItem, Loja, ModeloMoto, Peca } from '../types';

type LojistaTab =
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

interface HorarioDia {
  dia: string;
  abre: string;
  fecha: string;
  fechado: boolean;
}

const DEFAULT_HORARIOS: HorarioDia[] = [
  { dia: 'Segunda', abre: '08:00', fecha: '18:00', fechado: false },
  { dia: 'Terça', abre: '08:00', fecha: '18:00', fechado: false },
  { dia: 'Quarta', abre: '08:00', fecha: '18:00', fechado: false },
  { dia: 'Quinta', abre: '08:00', fecha: '18:00', fechado: false },
  { dia: 'Sexta', abre: '08:00', fecha: '18:00', fechado: false },
  { dia: 'Sábado', abre: '08:00', fecha: '13:00', fechado: false },
  { dia: 'Domingo', abre: '00:00', fecha: '00:00', fechado: true },
];

const PRODUCT_BANNER_IMAGES = [
  'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
];

const STORE_GALLERY_DEFAULT = [
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

const CATEGORIAS_PADRAO = [
  'Freios',
  'Transmissão',
  'Motor e Filtros',
  'Suspensão',
  'Elétrica e Bateria',
  'Pneus e Rodas',
  'Lubrificantes',
  'Carenagem e Acessórios',
];

function parseHorarios(raw?: string | null): HorarioDia[] {
  if (!raw) return DEFAULT_HORARIOS;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === 7) {
      return parsed;
    }
  } catch {
    // fallback to default
  }
  return DEFAULT_HORARIOS;
}

function renderCategoryIcon(categoriaNome?: string | null, size = 18) {
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

export function LojistaPage() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<LojistaTab>('resumo');

  const [loja, setLoja] = useState<Loja | null>(null);
  const [estoque, setEstoque] = useState<EstoqueItemExtended[]>([]);
  const [dashboard, setDashboard] = useState<DashboardLojistaResponse | null>(null);
  const [pecasCatalogo, setPecasCatalogo] = useState<Peca[]>([]);
  const [modelosMoto, setModelosMoto] = useState<ModeloMoto[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filtros de Gestão de Estoque
  const [buscaEstoque, setBuscaEstoque] = useState('');
  const [filtroCategoriaEstoque, setFiltroCategoriaEstoque] = useState('');
  const [filtroStatusEstoque, setFiltroStatusEstoque] = useState<'todos' | 'alto' | 'baixo' | 'zerado' | 'promo'>('todos');
  const [paginaEstoque, setPaginaEstoque] = useState(1);

  // Filtros de Ofertas Ativas
  const [filtroOfertasTab, setFiltroOfertasTab] = useState<'todas' | 'populares' | 'finalizando'>('todas');
  const [buscaOfertas, setBuscaOfertas] = useState('');

  // Filtros de Mais Procurados
  const [filtroProcuradosTab, setFiltroProcuradosTab] = useState<'tudo' | 'buscados' | 'tendencias' | 'sem-estoque'>('tudo');
  const [buscaProcurados, setBuscaProcurados] = useState('');
  const [raioProcurados, setRaioProcurados] = useState('15');
  const [periodoProcurados, setPeriodoProcurados] = useState('7');

  // Form Novo Produto
  const [npNomePeca, setNpNomePeca] = useState('');
  const [npCategoria, setNpCategoria] = useState('Freios');
  const [npNovaCategoria, setNpNovaCategoria] = useState('');
  const [npMarca, setNpMarca] = useState('Cobreq');
  const [npCodigoSku, setNpCodigoSku] = useState('');
  const [npDescricao, setNpDescricao] = useState('');
  const [npModelosSelecionados, setNpModelosSelecionados] = useState<string[]>([
    'Honda CB 500F (2014-2019)',
    'Honda CB 500X (2014-2019)',
  ]);
  const [npTagMotoInput, setNpTagMotoInput] = useState('');
  const [npQuantidade, setNpQuantidade] = useState('15');
  const [npAlertaMinimo, setNpAlertaMinimo] = useState('3');
  const [npPreco, setNpPreco] = useState('150.00');
  const [npEmPromocao, setNpEmPromocao] = useState(false);
  const [npPrecoPromo, setNpPrecoPromo] = useState('');
  const [npSaving, setNpSaving] = useState(false);

  // Form Criar Nova Oferta
  const [ofertaEstoqueId, setOfertaEstoqueId] = useState<string>('');
  const [ofertaBuscaProduto, setOfertaBuscaProduto] = useState('');
  const [ofertaDescontoPct, setOfertaDescontoPct] = useState('20');
  const [ofertaPrecoPromo, setOfertaPrecoPromo] = useState('');
  const [ofertaDataInicio, setOfertaDataInicio] = useState(() => new Date().toISOString().slice(0, 10));
  const [ofertaDataFim, setOfertaDataFim] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [ofertaDestaqueMapa, setOfertaDestaqueMapa] = useState(true);
  const [ofertaSaving, setOfertaSaving] = useState(false);

  // Form Perfil da Loja
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [pfNomeFantasia, setPfNomeFantasia] = useState('');
  const [pfTelefone, setPfTelefone] = useState('');
  const [pfEmailContato, setPfEmailContato] = useState('');
  const [pfEndereco, setPfEndereco] = useState('');
  const [pfHorarios, setPfHorarios] = useState<HorarioDia[]>(DEFAULT_HORARIOS);
  const [pfFotos, setPfFotos] = useState(STORE_GALLERY_DEFAULT);
  const [pfSaving, setPfSaving] = useState(false);

  const notifySuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const carregarTudo = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const [minhaLojaRes, lojasRes, pecasPaged, modelosData] = await Promise.all([
        api<Loja>('/lojas/minha-loja').catch(() => null),
        api<Loja[]>('/lojas').catch(() => [] as Loja[]),
        api<{ items?: Peca[] } | Peca[]>('/pecas?page=1&pageSize=100').catch(() => [] as Peca[]),
        api<{ items?: ModeloMoto[] } | ModeloMoto[]>('/garagem/modelos').catch(() => [] as ModeloMoto[]),
      ]);

      const listaPecas = Array.isArray(pecasPaged) ? pecasPaged : pecasPaged?.items || [];
      const listaModelos = Array.isArray(modelosData) ? modelosData : modelosData?.items || [];
      const listaLojas = Array.isArray(lojasRes) ? lojasRes : [];

      setPecasCatalogo(listaPecas);
      setModelosMoto(listaModelos);

      let minhaLoja =
        minhaLojaRes ||
        listaLojas.find((l) => user?.lojaId && l.id === user.lojaId) ||
        listaLojas.find((l) => user?.id && l.usuarioId === user.id) ||
        null;

      if (!minhaLoja && user) {
        minhaLoja = await api<Loja>('/lojas', {
          method: 'POST',
          body: JSON.stringify({
            nomeFantasia: user.nome || 'MotoPeças Expresso',
            cnpj: '12.345.678/0001-99',
            telefoneContato: '(11) 98765-4321',
            emailContato: user.email,
            enderecoCompleto: 'Av. dos Bandeirantes, 1450 - Vila Olímpia, São Paulo - SP',
            latitude: -23.5951,
            longitude: -46.687,
            horariosFuncionamento: JSON.stringify(DEFAULT_HORARIOS),
          }),
        });
        await refreshUser().catch(() => {});
      }

      if (minhaLoja) {
        setLoja(minhaLoja);
        setPfNomeFantasia(minhaLoja.nomeFantasia || '');
        setPfTelefone(minhaLoja.telefoneContato || '(11) 98765-4321');
        setPfEmailContato(minhaLoja.emailContato || user?.email || '');
        setPfEndereco(minhaLoja.enderecoCompleto || '');
        setPfHorarios(parseHorarios(minhaLoja.horariosFuncionamento));

        const [estPaged, dashRes] = await Promise.all([
          api<{ items: EstoqueItemExtended[] }>(`/lojas/${minhaLoja.id}/estoque?page=1&pageSize=100`).catch(() => ({ items: [] as EstoqueItemExtended[] })),
          api<DashboardLojistaResponse>(`/lojas/${minhaLoja.id}/dashboard`).catch(() => null),
        ]);

        const items = estPaged?.items || [];
        setEstoque(items);
        setDashboard(dashRes);

        if (items.length > 0) {
          setOfertaEstoqueId((prev) => prev || items[0].id);
          setOfertaPrecoPromo((prev) => prev || String(Number((items[0].precoVenda * 0.8).toFixed(2))));
        }
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar dados do painel do lojista.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [user?.id, user?.lojaId, user?.nome, user?.email, refreshUser]);

  useEffect(() => {
    void carregarTudo();
  }, [carregarTudo]);

  async function handleQuickUpdateItem(
    item: EstoqueItemExtended,
    novaQuantidade: number,
    novoPreco: number,
    emPromocao: boolean,
    precoPromocional: number | null,
  ) {
    if (!loja) return;
    try {
      const promoFinal = emPromocao
        ? precoPromocional && precoPromocional < novoPreco
          ? precoPromocional
          : Number((novoPreco * 0.85).toFixed(2))
        : null;

      const todayStr = new Date().toISOString().slice(0, 10);
      const nextWeekStr = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

      await api(`/estoque/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          quantidadeEstoque: Math.max(0, novaQuantidade),
          alertaEstoqueMinimo: 3,
          precoVenda: Math.max(0.01, novoPreco),
        }),
      });

      await api(`/estoque/${item.id}/promocao`, {
        method: 'PUT',
        body: JSON.stringify({
          emPromocao,
          precoPromocional: promoFinal,
          dataInicioPromocao: emPromocao ? todayStr : null,
          dataFimPromocao: emPromocao ? nextWeekStr : null,
        }),
      });

      const [estPaged, dashRes] = await Promise.all([
        api<{ items: EstoqueItemExtended[] }>(`/lojas/${loja.id}/estoque?page=1&pageSize=100`),
        api<DashboardLojistaResponse>(`/lojas/${loja.id}/dashboard`),
      ]);
      setEstoque(estPaged?.items || []);
      setDashboard(dashRes);
      notifySuccess(`Item "${item.nomePeca}" atualizado com sucesso.`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível atualizar o item.');
    }
  }

  async function handleSalvarNovoProduto(e: FormEvent) {
    e.preventDefault();
    if (!loja) return;
    setError('');
    setNpSaving(true);

    try {
      const categoriaFinal = npNovaCategoria.trim() || npCategoria || 'Freios';
      const skuFinal = npCodigoSku.trim() || `BRK-${Date.now().toString().slice(-4)}`;
      const compatText = npModelosSelecionados.length > 0 ? npModelosSelecionados.join(', ') : 'Universal';

      const idsModelosCompativeis = modelosMoto
        .filter((m) =>
          npModelosSelecionados.some(
            (tag) =>
              tag.toLowerCase().includes(m.modelo.toLowerCase()) ||
              m.nomeExibicao.toLowerCase().includes(tag.toLowerCase()),
          ),
        )
        .map((m) => m.id);

      let pecaExistente = pecasCatalogo.find(
        (p) =>
          p.nome.toLowerCase() === npNomePeca.trim().toLowerCase() ||
          (p.sku && p.sku.toLowerCase() === skuFinal.toLowerCase()),
      );

      if (!pecaExistente) {
        const specsJson = JSON.stringify({ compativel: compatText, marca: npMarca });
        try {
          pecaExistente = await api<Peca>('/pecas', {
            method: 'POST',
            body: JSON.stringify({
              sku: skuFinal,
              nome: npNomePeca.trim(),
              descricao: [npDescricao.trim(), `Marca: ${npMarca}`, `Compatível: ${compatText}`]
                .filter(Boolean)
                .join(' • '),
              categoria: categoriaFinal,
              especificacoes: specsJson,
              modelosMotoIds:
                idsModelosCompativeis.length > 0
                  ? idsModelosCompativeis
                  : modelosMoto.slice(0, 2).map((m) => m.id),
            }),
          });
        } catch {
          pecaExistente = await api<Peca>('/pecas', {
            method: 'POST',
            body: JSON.stringify({
              sku: `${skuFinal}-${Date.now().toString().slice(-4)}`,
              nome: npNomePeca.trim(),
              descricao: [npDescricao.trim(), `Marca: ${npMarca}`, `Compatível: ${compatText}`]
                .filter(Boolean)
                .join(' • '),
              categoria: categoriaFinal,
              especificacoes: specsJson,
              modelosMotoIds: modelosMoto.slice(0, 2).map((m) => m.id),
            }),
          });
        }
      }

      const precoNum = Number(npPreco) || 150;
      const promoNum = npEmPromocao
        ? Number(npPrecoPromo) || Number((precoNum * 0.85).toFixed(2))
        : null;
      const todayStr = new Date().toISOString().slice(0, 10);
      const nextWeekStr = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

      await api('/estoque', {
        method: 'POST',
        body: JSON.stringify({
          lojaId: loja.id,
          pecaId: pecaExistente.id,
          quantidadeEstoque: Math.max(0, Number(npQuantidade) || 0),
          alertaEstoqueMinimo: Math.max(1, Number(npAlertaMinimo) || 3),
          precoVenda: precoNum,
          emPromocao: npEmPromocao,
          precoPromocional: promoNum,
          dataInicioPromocao: npEmPromocao ? todayStr : null,
          dataFimPromocao: npEmPromocao ? nextWeekStr : null,
        }),
      });

      setNpNomePeca('');
      setNpCodigoSku('');
      setNpDescricao('');
      setNpQuantidade('15');
      setNpPreco('150.00');
      setNpEmPromocao(false);
      setNpPrecoPromo('');

      await carregarTudo(true);
      notifySuccess('Produto cadastrado e publicado no Radar com sucesso.');
      setActiveTab('estoque');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao cadastrar novo produto.');
    } finally {
      setNpSaving(false);
    }
  }

  const itemSelecionadoOferta = useMemo(
    () => estoque.find((i) => i.id === ofertaEstoqueId) || estoque[0] || null,
    [estoque, ofertaEstoqueId],
  );

  function handleOfertaDescontoChange(pctStr: string) {
    setOfertaDescontoPct(pctStr);
    const pct = Number(pctStr);
    if (itemSelecionadoOferta && !Number.isNaN(pct) && pct > 0 && pct < 95) {
      const novoPreco = Number((itemSelecionadoOferta.precoVenda * (1 - pct / 100)).toFixed(2));
      setOfertaPrecoPromo(String(novoPreco));
    }
  }

  function handleOfertaPrecoChange(precoStr: string) {
    setOfertaPrecoPromo(precoStr);
    const novoPreco = Number(precoStr);
    if (
      itemSelecionadoOferta &&
      !Number.isNaN(novoPreco) &&
      novoPreco > 0 &&
      novoPreco < itemSelecionadoOferta.precoVenda
    ) {
      const pct = Math.round((1 - novoPreco / itemSelecionadoOferta.precoVenda) * 100);
      setOfertaDescontoPct(String(pct));
    }
  }

  async function handlePublicarOferta(e: FormEvent) {
    e.preventDefault();
    if (!itemSelecionadoOferta || !loja) return;
    setOfertaSaving(true);
    setError('');

    try {
      const precoPromoFinal = Number(ofertaPrecoPromo);
      if (!precoPromoFinal || precoPromoFinal >= itemSelecionadoOferta.precoVenda) {
        setError('O preço promocional deve ser menor que o preço original.');
        setOfertaSaving(false);
        return;
      }

      await api(`/estoque/${itemSelecionadoOferta.id}/promocao`, {
        method: 'PUT',
        body: JSON.stringify({
          emPromocao: true,
          precoPromocional: precoPromoFinal,
          dataInicioPromocao: ofertaDataInicio,
          dataFimPromocao: ofertaDataFim,
        }),
      });

      await carregarTudo(true);
      notifySuccess(`Oferta publicada para "${itemSelecionadoOferta.nomePeca}".`);
      setActiveTab('ofertas');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao publicar oferta.');
    } finally {
      setOfertaSaving(false);
    }
  }

  async function handleSalvarPerfil(e: FormEvent) {
    e.preventDefault();
    if (!loja) return;
    setPfSaving(true);
    setError('');
    try {
      const updated = await api<Loja>(`/lojas/${loja.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          nomeFantasia: pfNomeFantasia.trim() || loja.nomeFantasia,
          cnpj: loja.cnpj,
          telefoneContato: pfTelefone.trim(),
          emailContato: pfEmailContato.trim() || user?.email,
          enderecoCompleto: pfEndereco.trim(),
          latitude: loja.latitude,
          longitude: loja.longitude,
          horariosFuncionamento: JSON.stringify(pfHorarios),
          galeriaFotosUrls: pfFotos.map((f) => f.url),
        }),
      });
      setLoja(updated);
      setEditandoPerfil(false);
      notifySuccess('Perfil da loja atualizado com sucesso.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao atualizar perfil da loja.');
    } finally {
      setPfSaving(false);
    }
  }

  function exportarInventarioCsv() {
    const headers = ['ID,Produto,Categoria,SKU,Estoque,Preco,EmPromocao,PrecoPromocional'];
    const rows = estoque.map(
      (i) =>
        `${i.id},"${i.nomePeca.replace(/"/g, '""')}","${i.categoria || ''}","${i.sku || ''}",${i.quantidadeEstoque},${i.precoVenda},${i.emPromocao},${i.precoPromocional ?? ''}`,
    );
    const blob = new Blob([headers.concat(rows).join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventario-${loja?.nomeFantasia || 'loja'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const categoriasDisponiveis = useMemo(() => {
    const fromItems = estoque.map((i) => i.categoria).filter(Boolean);
    return Array.from(new Set([...CATEGORIAS_PADRAO, ...fromItems]));
  }, [estoque]);

  const estoqueFiltrado = useMemo(() => {
    return estoque.filter((item) => {
      const matchTermo =
        !buscaEstoque.trim() ||
        item.nomePeca.toLowerCase().includes(buscaEstoque.toLowerCase()) ||
        (item.sku || '').toLowerCase().includes(buscaEstoque.toLowerCase()) ||
        (item.descricaoCompatibilidade || '').toLowerCase().includes(buscaEstoque.toLowerCase());

      const matchCat =
        !filtroCategoriaEstoque ||
        (item.categoria || '').toLowerCase() === filtroCategoriaEstoque.toLowerCase();

      let matchStatus = true;
      if (filtroStatusEstoque === 'alto') matchStatus = item.quantidadeEstoque > 10;
      if (filtroStatusEstoque === 'baixo') matchStatus = item.quantidadeEstoque > 0 && item.quantidadeEstoque <= 3;
      if (filtroStatusEstoque === 'zerado') matchStatus = item.quantidadeEstoque === 0;
      if (filtroStatusEstoque === 'promo') matchStatus = item.emPromocao;

      return matchTermo && matchCat && matchStatus;
    });
  }, [estoque, buscaEstoque, filtroCategoriaEstoque, filtroStatusEstoque]);

  const ofertasAtivasList = useMemo(() => {
    const base = estoque.filter((i) => i.emPromocao);
    const filtered = base.filter(
      (i) =>
        !buscaOfertas.trim() ||
        i.nomePeca.toLowerCase().includes(buscaOfertas.toLowerCase()) ||
        (i.categoria || '').toLowerCase().includes(buscaOfertas.toLowerCase()),
    );
    if (filtroOfertasTab === 'populares') {
      return [...filtered].sort((a, b) => (b.visualizacoes || 0) - (a.visualizacoes || 0));
    }
    return filtered;
  }, [estoque, buscaOfertas, filtroOfertasTab]);

  const maisProcuradosNormalizados = useMemo(() => {
    const lista = dashboard?.maisProcuradosRegiao || [];
    return lista.map((item, idx) => ({
      ...item,
      posicao: item.posicao ?? idx + 1,
      compatibilidade: item.compatibilidadeResumo || item.compatibilidade || 'Universal',
      buscasUltimos7Dias: item.totalBuscas7d ?? item.buscasUltimos7Dias ?? 140,
      quantidadeMeuEstoque: item.quantidadeEstoqueLoja ?? item.quantidadeMeuEstoque ?? 0,
    }));
  }, [dashboard]);

  const maisProcuradosFiltrados = useMemo(() => {
    return maisProcuradosNormalizados.filter((item) => {
      const matchBusca =
        !buscaProcurados.trim() ||
        item.nomePeca.toLowerCase().includes(buscaProcurados.toLowerCase()) ||
        item.compatibilidade.toLowerCase().includes(buscaProcurados.toLowerCase());
      if (!matchBusca) return false;
      if (filtroProcuradosTab === 'sem-estoque') return item.quantidadeMeuEstoque === 0;
      if (filtroProcuradosTab === 'tendencias') return item.crescimentoPercentual >= 20;
      return true;
    });
  }, [maisProcuradosNormalizados, buscaProcurados, filtroProcuradosTab]);

  if (loading) {
    return (
      <div style={{ padding: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#64748b' }}>
        <Loader2 size={20} color="#006375" />
        <span style={{ fontWeight: 600 }}>Carregando Painel de Gestão Lojista...</span>
      </div>
    );
  }

  return (
    <div className="lojista-shell">
      {/* SIDEBAR GESTÃO LOJISTA (Fiel aos Protótipos 2 a 6) */}
      <aside className="lojista-sidebar">
        <div
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: '#64748b',
            padding: '0 12px 10px',
            textTransform: 'uppercase',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          }}
        >
          GESTÃO LOJISTA
        </div>

        <div className="lojista-sidebar-nav-list">
          {[
            { id: 'resumo', label: 'Resumo', icon: LayoutGrid },
            { id: 'estoque', label: 'Estoque e Preços', icon: Archive },
            { id: 'ofertas', label: 'Ofertas Ativas', icon: Tag },
            { id: 'mais-procurados', label: 'Mais Procurados', icon: BarChart2 },
            { id: 'perfil', label: 'Perfil da Loja', icon: Store },
          ].map((nav) => {
            const IconComponent = nav.icon;
            const isSelected =
              activeTab === nav.id ||
              (nav.id === 'estoque' && activeTab === 'novo-produto') ||
              (nav.id === 'ofertas' && activeTab === 'criar-oferta');

            return (
              <button
                key={nav.id}
                type="button"
                onClick={() => setActiveTab(nav.id as LojistaTab)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: 'none',
                  background: isSelected ? '#c8e6f0' : 'transparent',
                  color: isSelected ? '#006375' : '#475569',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <IconComponent size={18} strokeWidth={isSelected ? 2.3 : 1.9} />
                <span>{nav.label}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ÁREA PRINCIPAL (100% fluida sem vão vazio no canto direito quando maximizada) */}
      <div className="lojista-main">
        {error && (
          <div style={{ marginBottom: 16 }}>
            <ErrorState text={error} />
          </div>
        )}
        {successMsg && (
          <div
            style={{
              marginBottom: 16,
              padding: '12px 16px',
              borderRadius: 8,
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontWeight: 600,
              fontSize: '0.88rem',
            }}
          >
            <CheckCircle2 size={18} color="#059669" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* =========================================================
            TELA 2: DASHBOARD DA LOJA (RESUMO)
           ========================================================= */}
        {activeTab === 'resumo' && (
          <div>
            <div className="lojista-page-header">
              <div>
                <h1 style={{ fontSize: '1.85rem', margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  Dashboard da Loja
                </h1>
                <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '0.92rem' }}>
                  Gerencie seu inventário e acompanhe tendências da região.
                </p>
              </div>
              <Button
                type="button"
                onClick={() => setActiveTab('novo-produto')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', marginLeft: 'auto' }}
              >
                <Plus size={16} />
                Novo Produto
              </Button>
            </div>

            {/* 4 KPI Cards com tipografia técnica monospace nos títulos */}
            <div className="lojista-kpi-grid">
              <div className="card" style={{ padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.76rem', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                  <span>Total Produtos</span>
                  <PackageCheck size={16} color="#94a3b8" />
                </div>
                <div style={{ fontSize: '2.1rem', fontWeight: 800, marginTop: 10, color: '#0f172a', lineHeight: 1 }}>
                  {dashboard?.totalProdutosCadastrados ?? dashboard?.totalPecasDistintas ?? estoque.length}
                </div>
              </div>

              <div className="card" style={{ padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.76rem', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                  <span>Itens Baixo Estoque</span>
                  <AlertTriangle size={16} color="#dc2626" />
                </div>
                <div style={{ fontSize: '2.1rem', fontWeight: 800, marginTop: 10, color: '#b91c1c', lineHeight: 1 }}>
                  {dashboard?.totalItensEstoqueBaixo ?? dashboard?.itensEstoqueBaixo ?? estoque.filter((i) => i.quantidadeEstoque <= 3).length}
                </div>
              </div>

              <div className="card" style={{ padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.76rem', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                  <span>Buscas no Radar (24h)</span>
                  <Radar size={16} color="#006375" />
                </div>
                <div style={{ fontSize: '2.1rem', fontWeight: 800, marginTop: 10, color: '#006375', lineHeight: 1 }}>
                  {dashboard?.buscasRadar24h ?? 148}
                </div>
              </div>

              <div className="card" style={{ padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.76rem', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                  <span>Ofertas Ativas</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('ofertas')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#006375',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.76rem',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    }}
                  >
                    Gerenciar
                  </button>
                </div>
                <div style={{ fontSize: '2.1rem', fontWeight: 800, marginTop: 10, color: '#0f172a', lineHeight: 1 }}>
                  {dashboard?.totalOfertasAtivas ?? ofertasAtivasList.length}
                </div>
              </div>
            </div>

            {/* Grid Gestão Rápida + Em Alta no Radar */}
            <div className="lojista-split-grid">
              <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none', minWidth: 0 }}>
                <div
                  style={{
                    padding: '18px 22px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 10,
                  }}
                >
                  <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>Gestão Rápida</strong>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <button
                      type="button"
                      onClick={() => setActiveTab('estoque')}
                      style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
                    >
                      Filtrar
                    </button>
                    <button
                      type="button"
                      onClick={exportarInventarioCsv}
                      style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
                    >
                      Exportar
                    </button>
                  </div>
                </div>

                {estoque.length === 0 ? (
                  <div style={{ padding: 36, textAlign: 'center', color: '#64748b' }}>
                    Nenhum produto cadastrado ainda. Clique em <strong>+ Novo Produto</strong> para começar!
                  </div>
                ) : (
                  <div className="lojista-table-scroll">
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', textAlign: 'left', color: '#475569', fontSize: '0.75rem', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                        <th style={{ padding: '12px 22px' }}>Produto</th>
                        <th style={{ padding: '12px' }}>Estoque</th>
                        <th style={{ padding: '12px' }}>Preço (R$)</th>
                        <th style={{ padding: '12px 22px', textAlign: 'center' }}>Promo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estoque.slice(0, 5).map((item) => {
                        const isLowStock = item.quantidadeEstoque <= 3;
                        return (
                          <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '14px 22px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div
                                  style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 8,
                                    background: '#e2e8f0',
                                    color: '#334155',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                  }}
                                >
                                  {renderCategoryIcon(item.categoria, 18)}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.nomePeca}</div>
                                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                                    SKU: {item.sku || `SKU-${item.pecaId}`} • {item.descricaoCompatibilidade || 'Universal'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '14px 12px' }}>
                              <input
                                type="number"
                                min={0}
                                defaultValue={item.quantidadeEstoque}
                                onBlur={(e) => {
                                  const val = Number(e.target.value);
                                  if (val !== item.quantidadeEstoque) {
                                    void handleQuickUpdateItem(item, val, item.precoVenda, item.emPromocao, item.precoPromocional ?? null);
                                  }
                                }}
                                style={{
                                  width: 66,
                                  padding: '7px 8px',
                                  borderRadius: 6,
                                  border: isLowStock ? '1px solid #fca5a5' : '1px solid #cbd5e1',
                                  background: isLowStock ? '#fee2e2' : '#ffffff',
                                  color: isLowStock ? '#b91c1c' : '#0f172a',
                                  fontWeight: 700,
                                  textAlign: 'center',
                                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                                }}
                              />
                            </td>
                            <td style={{ padding: '14px 12px' }}>
                              <input
                                type="number"
                                step="0.01"
                                min={0.01}
                                defaultValue={item.precoVenda}
                                onBlur={(e) => {
                                  const val = Number(e.target.value);
                                  if (val > 0 && val !== item.precoVenda) {
                                    void handleQuickUpdateItem(item, item.quantidadeEstoque, val, item.emPromocao, item.precoPromocional ?? null);
                                  }
                                }}
                                style={{
                                  width: 96,
                                  padding: '7px 10px',
                                  borderRadius: 6,
                                  border: '1px solid #cbd5e1',
                                  fontWeight: 600,
                                  color: '#0f172a',
                                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                                }}
                              />
                            </td>
                            <td style={{ padding: '14px 22px', textAlign: 'center' }}>
                              <button
                                type="button"
                                role="switch"
                                aria-checked={item.emPromocao}
                                onClick={() =>
                                  void handleQuickUpdateItem(
                                    item,
                                    item.quantidadeEstoque,
                                    item.precoVenda,
                                    !item.emPromocao,
                                    item.precoPromocional ?? Number((item.precoVenda * 0.85).toFixed(2)),
                                  )
                                }
                                style={{
                                  width: 42,
                                  height: 22,
                                  borderRadius: 999,
                                  border: 'none',
                                  background: item.emPromocao ? '#006375' : '#cbd5e1',
                                  position: 'relative',
                                  cursor: 'pointer',
                                  transition: 'background 0.2s',
                                }}
                              >
                                <span
                                  style={{
                                    position: 'absolute',
                                    top: 3,
                                    left: item.emPromocao ? 23 : 3,
                                    width: 16,
                                    height: 16,
                                    borderRadius: '50%',
                                    background: '#ffffff',
                                    transition: 'left 0.2s',
                                  }}
                                />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  </div>
                )}

                <div style={{ padding: '14px 22px', textAlign: 'center', borderTop: '1px solid #e2e8f0', background: '#ffffff' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('estoque')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#006375',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    }}
                  >
                    Ver todo o inventário
                  </button>
                </div>
              </div>

              {/* Card Em Alta no Radar (Sua Região) */}
              <div className="card" style={{ padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TrendingUp size={18} color="#006375" />
                  <strong style={{ fontSize: '0.98rem', color: '#0f172a' }}>Em Alta no Radar (Sua Região)</strong>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '6px 0 16px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                  Itens mais buscados num raio de 15km
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {maisProcuradosNormalizados.slice(0, 4).map((rank) => (
                    <div
                      key={rank.posicao}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 8,
                        background: '#f1f5f9',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        <span
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: rank.posicao === 1 ? '#006375' : '#e2e8f0',
                            color: rank.posicao === 1 ? '#ffffff' : '#475569',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            flexShrink: 0,
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                          }}
                        >
                          {rank.posicao}
                        </span>
                        <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {rank.nomePeca}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#006375', flexShrink: 0, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                        {rank.buscasUltimos7Dias} buscas
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('mais-procurados')}
                  style={{
                    marginTop: 18,
                    width: '100%',
                    padding: '8px',
                    border: 'none',
                    background: 'transparent',
                    color: '#006375',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  }}
                >
                  <span>Ver Relatório Completo</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TELA 2.1: ADICIONAR NOVO PRODUTO
           ========================================================= */}
        {activeTab === 'novo-produto' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <button
                type="button"
                onClick={() => setActiveTab('resumo')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '0.84rem',
                  padding: 0,
                  marginBottom: 8,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <ArrowLeft size={15} />
                <span>Voltar para o Dashboard</span>
              </button>
              <h1 style={{ fontSize: '1.8rem', margin: 0, color: '#0f172a' }}>Adicionar Novo Produto</h1>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.92rem' }}>
                Cadastre uma nova peça no seu inventário e disponibilize no Radar.
              </p>
            </div>

            <form onSubmit={handleSalvarNovoProduto}>
              <div className="lojista-split-grid">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
                  <div className="card" style={{ padding: 24, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 18, fontSize: '1.05rem', color: '#0f172a' }}>Informações Básicas</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <Field label="Nome da Peça *">
                        <TextInput
                          required
                          placeholder="Ex: Pastilha de Freio Dianteira Cobreq"
                          value={npNomePeca}
                          onChange={(e) => setNpNomePeca(e.target.value)}
                        />
                      </Field>

                      <div className="lojista-form-grid-2">
                        <Field label="Categoria *">
                          <select
                            className="input"
                            value={npCategoria}
                            onChange={(e) => setNpCategoria(e.target.value)}
                          >
                            {categoriasDisponiveis.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </Field>

                        <Field label="Ou Nova Categoria">
                          <TextInput
                            placeholder="Ex: Freios / Transmissão"
                            value={npNovaCategoria}
                            onChange={(e) => setNpNovaCategoria(e.target.value)}
                          />
                        </Field>
                      </div>

                      <div className="lojista-form-grid-2">
                        <Field label="Marca / Fabricante">
                          <TextInput
                            placeholder="Ex: Cobreq, DID, Motul"
                            value={npMarca}
                            onChange={(e) => setNpMarca(e.target.value)}
                          />
                        </Field>

                        <Field label="Código SKU (Interno)">
                          <TextInput
                            placeholder="Ex: BRK-CB500-01"
                            value={npCodigoSku}
                            onChange={(e) => setNpCodigoSku(e.target.value)}
                          />
                        </Field>
                      </div>

                      <Field label="Descrição Técnica">
                        <textarea
                          className="input"
                          rows={3}
                          placeholder="Especificações, materiais, detalhes de aplicação ou observações da peça..."
                          value={npDescricao}
                          onChange={(e) => setNpDescricao(e.target.value)}
                          style={{ resize: 'vertical' }}
                        />
                      </Field>
                    </div>
                  </div>

                  {/* Compatibilidade de Motos */}
                  <div className="card" style={{ padding: 24, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>Compatibilidade de Motos</h3>
                      <span style={{ fontSize: '0.8rem', color: '#006375', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Plus size={14} /> Adicionar Modelo
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                      <TextInput
                        placeholder="Ex: Honda CG 160 Titan (2018-2024)"
                        value={npTagMotoInput}
                        onChange={(e) => setNpTagMotoInput(e.target.value)}
                        list="modelos-moto-datalist"
                      />
                      <datalist id="modelos-moto-datalist">
                        {modelosMoto.map((m) => (
                          <option key={m.id} value={m.nomeExibicao} />
                        ))}
                      </datalist>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          if (npTagMotoInput.trim()) {
                            setNpModelosSelecionados((prev) => [...prev, npTagMotoInput.trim()]);
                            setNpTagMotoInput('');
                          }
                        }}
                      >
                        Incluir
                      </Button>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {npModelosSelecionados.map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '6px 12px',
                            borderRadius: 6,
                            background: '#f1f5f9',
                            border: '1px solid #e2e8f0',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            color: '#334155',
                          }}
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() =>
                              setNpModelosSelecionados((prev) => prev.filter((_, i) => i !== idx))
                            }
                            style={{
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                              color: '#64748b',
                              fontWeight: 800,
                            }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Coluna Direita: Imagem + Estoque e Preço */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div className="card" style={{ padding: 22, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 14, fontSize: '1rem', color: '#0f172a' }}>Imagem do Produto</h3>
                    <div
                      style={{
                        border: '2px dashed #cbd5e1',
                        borderRadius: 10,
                        padding: '32px 16px',
                        textAlign: 'center',
                        background: '#f8fafc',
                        color: '#64748b',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <ImagePlus size={30} color="#64748b" />
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155' }}>
                        Clique para fazer upload ou arraste a imagem
                      </div>
                      <small style={{ fontSize: '0.75rem', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>PNG, JPG até 5MB</small>
                    </div>
                  </div>

                  <div className="card" style={{ padding: 22, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 14, fontSize: '1rem', color: '#0f172a' }}>Estoque e Preço</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <Field label="Quantidade em Estoque *">
                          <TextInput
                            type="number"
                            min={0}
                            required
                            value={npQuantidade}
                            onChange={(e) => setNpQuantidade(e.target.value)}
                          />
                        </Field>
                        <Field label="Alerta Estoque Baixo">
                          <TextInput
                            type="number"
                            min={1}
                            value={npAlertaMinimo}
                            onChange={(e) => setNpAlertaMinimo(e.target.value)}
                          />
                        </Field>
                      </div>

                      <Field label="Preço de Venda (R$) *">
                        <TextInput
                          type="number"
                          step="0.01"
                          min={0.01}
                          required
                          value={npPreco}
                          onChange={(e) => setNpPreco(e.target.value)}
                        />
                      </Field>

                      <div
                        style={{
                          paddingTop: 12,
                          borderTop: '1px solid #e2e8f0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.88rem', color: '#0f172a' }}>Em Promoção</strong>
                          <small style={{ color: '#64748b' }}>Destacar oferta no Radar</small>
                        </div>
                        <input
                          type="checkbox"
                          checked={npEmPromocao}
                          onChange={(e) => setNpEmPromocao(e.target.checked)}
                          style={{ width: 18, height: 18, accentColor: '#006375' }}
                        />
                      </div>

                      {npEmPromocao && (
                        <Field label="Preço Promocional (R$)">
                          <TextInput
                            type="number"
                            step="0.01"
                            placeholder="Ex: 119.90"
                            value={npPrecoPromo}
                            onChange={(e) => setNpPrecoPromo(e.target.value)}
                          />
                        </Field>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 24,
                  paddingTop: 18,
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 12,
                }}
              >
                <Button type="button" variant="ghost" onClick={() => setActiveTab('resumo')}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={npSaving}>
                  {npSaving ? 'Publicando...' : 'Salvar e Publicar no Radar'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* =========================================================
            TELA 3: GESTÃO DE ESTOQUE (ESTOQUE E PREÇOS)
           ========================================================= */}
        {activeTab === 'estoque' && (
          <div>
            <div className="lojista-page-header">
              <div>
                <h1 style={{ fontSize: '1.85rem', margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  Gestão de Estoque
                </h1>
                <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '0.92rem' }}>
                  Controle completo do seu inventário, preços e disponibilidade.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginLeft: 'auto' }}>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={exportarInventarioCsv}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#ffffff', border: '1px solid #cbd5e1' }}
                >
                  <Download size={15} />
                  Exportar CSV
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveTab('novo-produto')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  <Plus size={16} />
                  Novo Produto
                </Button>
              </div>
            </div>

            {/* Barra de Busca e Filtros fiel ao Protótipo 3 (100% responsiva) */}
            <div
              className="card lojista-filter-bar"
              style={{
                padding: '14px 18px',
                marginBottom: 20,
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                boxShadow: 'none',
              }}
            >
              <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 200 }}>
                <Search size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <TextInput
                  placeholder="Buscar por nome, código SKU ou moto compatível..."
                  value={buscaEstoque}
                  onChange={(e) => setBuscaEstoque(e.target.value)}
                  style={{ paddingLeft: 38, background: '#ffffff' }}
                />
              </div>
              <select
                className="input"
                value={filtroCategoriaEstoque}
                onChange={(e) => setFiltroCategoriaEstoque(e.target.value)}
                style={{ background: '#ffffff', flex: '0 1 210px', minWidth: 160 }}
              >
                <option value="">Todas Categorias</option>
                {categoriasDisponiveis.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                className="input"
                value={filtroStatusEstoque}
                onChange={(e) => setFiltroStatusEstoque(e.target.value as typeof filtroStatusEstoque)}
                style={{ background: '#ffffff', flex: '0 1 190px', minWidth: 150 }}
              >
                <option value="todos">Status: Todos</option>
                <option value="alto">Estoque Alto (&gt;10)</option>
                <option value="baixo">Estoque Baixo (1-3)</option>
                <option value="zerado">Zerado (0)</option>
                <option value="promo">Em Promoção</option>
              </select>
              <button
                type="button"
                title="Filtros Avançados"
                style={{
                  width: 42,
                  height: 40,
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <SlidersHorizontal size={16} />
              </button>
            </div>

            {/* Tabela Completa de Estoque */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
              <div className="lojista-table-scroll">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', textAlign: 'left', color: '#475569', fontSize: '0.75rem', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                    <th style={{ padding: '14px 22px' }}>PRODUTO</th>
                    <th style={{ padding: '14px 12px' }}>SKU</th>
                    <th style={{ padding: '14px 12px' }}>ESTOQUE</th>
                    <th style={{ padding: '14px 12px' }}>PREÇO (R$)</th>
                    <th style={{ padding: '14px 22px', textAlign: 'right' }}>PROMO (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {estoqueFiltrado.map((item) => {
                    const statusBadge =
                      item.quantidadeEstoque === 0
                        ? { text: 'Zerado', bg: '#e2e8f0', color: '#475569' }
                        : item.quantidadeEstoque <= 3
                          ? { text: 'Baixo', bg: '#fee2e2', color: '#b91c1c' }
                          : item.quantidadeEstoque > 10
                            ? { text: 'Alto', bg: '#c8e6f0', color: '#006375' }
                            : { text: 'Ok', bg: '#c8e6f0', color: '#006375' };

                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '16px 22px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: 8,
                                background: '#e2e8f0',
                                color: '#334155',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {renderCategoryIcon(item.categoria, 18)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.nomePeca}</div>
                              <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: 2 }}>
                                {item.descricaoCompatibilidade || 'Universal'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 12px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', color: '#475569', fontSize: '0.82rem' }}>
                          {item.sku || `SKU-${item.pecaId}`}
                        </td>
                        <td style={{ padding: '16px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input
                              type="number"
                              min={0}
                              defaultValue={item.quantidadeEstoque}
                              onBlur={(e) => {
                                const val = Number(e.target.value);
                                if (val !== item.quantidadeEstoque) {
                                  void handleQuickUpdateItem(item, val, item.precoVenda, item.emPromocao, item.precoPromocional ?? null);
                                }
                              }}
                              style={{
                                width: 64,
                                padding: '6px 8px',
                                borderRadius: 6,
                                border: item.quantidadeEstoque <= 3 ? '1px solid #fca5a5' : '1px solid #cbd5e1',
                                fontWeight: 700,
                                textAlign: 'center',
                                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                              }}
                            />
                            <span
                              style={{
                                padding: '3px 9px',
                                borderRadius: 999,
                                background: statusBadge.bg,
                                color: statusBadge.color,
                                fontSize: '0.72rem',
                                fontWeight: 700,
                              }}
                            >
                              {statusBadge.text}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '16px 12px' }}>
                          <input
                            type="number"
                            step="0.01"
                            defaultValue={item.precoVenda}
                            onBlur={(e) => {
                              const val = Number(e.target.value);
                              if (val > 0 && val !== item.precoVenda) {
                                void handleQuickUpdateItem(item, item.quantidadeEstoque, val, item.emPromocao, item.precoPromocional ?? null);
                              }
                            }}
                            style={{
                              width: 96,
                              padding: '6px 10px',
                              borderRadius: 6,
                              border: '1px solid #cbd5e1',
                              fontWeight: 600,
                              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                            }}
                          />
                        </td>
                        <td style={{ padding: '16px 22px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                            {item.emPromocao && item.precoPromocional ? (
                              <span style={{ fontWeight: 800, color: '#006375', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                                {item.precoPromocional.toFixed(2).replace('.', ',')}
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>--</span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setOfertaEstoqueId(item.id);
                                setOfertaPrecoPromo(
                                  String(item.precoPromocional ?? Number((item.precoVenda * 0.8).toFixed(2))),
                                );
                                setActiveTab('criar-oferta');
                              }}
                              title="Configurar oferta"
                              style={{
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                borderRadius: 6,
                                padding: '6px 8px',
                                cursor: 'pointer',
                                color: '#334155',
                                display: 'inline-flex',
                                alignItems: 'center',
                              }}
                            >
                              <Tag size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>

              <div
                style={{
                  padding: '14px 22px',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 10,
                  fontSize: '0.8rem',
                  color: '#64748b',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                }}
              >
                <span>
                  Mostrando 1-{estoqueFiltrado.length} de {estoque.length} produtos cadastrados
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => setPaginaEstoque(1)}
                    style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #cbd5e1', background: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {[1, 2, 3].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPaginaEstoque(p)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        border: paginaEstoque === p ? 'none' : '1px solid #cbd5e1',
                        background: paginaEstoque === p ? '#006375' : '#ffffff',
                        color: paginaEstoque === p ? '#ffffff' : '#475569',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPaginaEstoque((p) => Math.min(3, p + 1))}
                    style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #cbd5e1', background: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TELA 4: OFERTAS ATIVAS (Grid de 3 Colunas Visual Fiel ao Protótipo 4)
           ========================================================= */}
        {activeTab === 'ofertas' && (
          <div>
            <div className="lojista-page-header">
              <div>
                <h1 style={{ fontSize: '1.85rem', margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  Ofertas Ativas
                </h1>
                <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '0.92rem' }}>
                  Promova peças do seu estoque e atraia mais motociclistas pelo Radar.
                </p>
              </div>
              <Button
                type="button"
                onClick={() => setActiveTab('criar-oferta')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', marginLeft: 'auto' }}
              >
                <Tag size={16} />
                + Criar Nova Oferta
              </Button>
            </div>

            {/* 4 KPI Cards de Ofertas */}
            <div className="lojista-kpi-grid">
              <div className="card" style={{ padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                  <span>Total em Oferta</span>
                  <Tag size={15} color="#006375" />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 10 }}>
                  <span style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a' }}>{ofertasAtivasList.length}</span>
                  <span style={{ fontSize: '0.72rem', background: '#c8e6f0', color: '#006375', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                    +3 essa semana
                  </span>
                </div>
              </div>

              <div className="card" style={{ padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                  <span>Visualizações (Ofertas)</span>
                  <Eye size={15} color="#64748b" />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 10 }}>
                  <span style={{ fontSize: '1.9rem', fontWeight: 800, color: '#006375' }}>
                    {ofertasAtivasList.reduce((acc, i) => acc + (i.visualizacoes || 140), 0)}
                  </span>
                  <span style={{ fontSize: '0.72rem', background: '#c8e6f0', color: '#006375', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                    +12%
                  </span>
                </div>
              </div>

              <div className="card" style={{ padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                  <span>Cliques no WhatsApp/Rota</span>
                  <MousePointerClick size={15} color="#64748b" />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 10 }}>
                  <span style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a' }}>
                    {ofertasAtivasList.reduce((acc, i) => acc + (i.cliques || 36), 0)}
                  </span>
                  <span style={{ fontSize: '0.72rem', background: '#c8e6f0', color: '#006375', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                    +18%
                  </span>
                </div>
              </div>

              <div className="card" style={{ padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                  <span>Expirando em Breve</span>
                  <AlertTriangle size={15} color="#dc2626" />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 10 }}>
                  <span style={{ fontSize: '1.9rem', fontWeight: 800, color: '#b91c1c' }}>
                    {Math.min(2, ofertasAtivasList.length)}
                  </span>
                  <span style={{ fontSize: '0.72rem', background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                    &lt; 48h
                  </span>
                </div>
              </div>
            </div>

            {/* Barra de Filtros de Ofertas (Pills à esquerda + Search à direita) */}
            <div
              className="card"
              style={{
                padding: '10px 14px',
                marginBottom: 22,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                boxShadow: 'none',
              }}
            >
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { id: 'todas', label: `Todas (${ofertasAtivasList.length})` },
                  { id: 'populares', label: 'Mais Populares' },
                  { id: 'finalizando', label: 'Finalizando' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFiltroOfertasTab(tab.id as typeof filtroOfertasTab)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 6,
                      border: 'none',
                      background: filtroOfertasTab === tab.id ? '#ffffff' : 'transparent',
                      color: filtroOfertasTab === tab.id ? '#0f172a' : '#64748b',
                      fontWeight: filtroOfertasTab === tab.id ? 700 : 500,
                      boxShadow: filtroOfertasTab === tab.id ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: '0 1 320px', marginLeft: 'auto' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
                  <Search size={15} color="#64748b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <TextInput
                    placeholder="Buscar oferta ativa..."
                    value={buscaOfertas}
                    onChange={(e) => setBuscaOfertas(e.target.value)}
                    style={{ paddingLeft: 36, background: '#ffffff', height: 36 }}
                  />
                </div>
                <button
                  type="button"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <SlidersHorizontal size={15} />
                </button>
              </div>
            </div>

            {/* Grid de 3 Colunas com Cards Visuais de Ofertas Ativas (Fiel ao Protótipo 4) */}
            {ofertasAtivasList.length === 0 ? (
              <div className="card" style={{ padding: 48, textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <Tag size={32} color="#94a3b8" style={{ marginBottom: 10 }} />
                <h3 style={{ marginTop: 0 }}>Nenhuma oferta ativa no momento</h3>
                <p style={{ color: '#64748b', marginBottom: 18 }}>
                  Destaque peças do seu estoque para aparecer na aba Promoções dos motociclistas da sua região.
                </p>
                <Button type="button" onClick={() => setActiveTab('criar-oferta')}>
                  Criar Primeira Oferta
                </Button>
              </div>
            ) : (
              <div className="lojista-cards-grid-3">
                {ofertasAtivasList.map((oferta, index) => {
                  const precoPromo = oferta.precoPromocional ?? Number((oferta.precoVenda * 0.8).toFixed(2));
                  const pctDesconto = Math.max(
                    5,
                    Math.round((1 - precoPromo / oferta.precoVenda) * 100),
                  );
                  const views = oferta.visualizacoes || 142;
                  const clicks = oferta.cliques || 38;
                  const convPct = Math.round((clicks / Math.max(1, views)) * 100);
                  const isExpiringSoon = index === 1;
                  const bannerImg = PRODUCT_BANNER_IMAGES[index % PRODUCT_BANNER_IMAGES.length];

                  return (
                    <div
                      key={oferta.id}
                      className="card"
                      style={{
                        padding: 0,
                        overflow: 'hidden',
                        border: isExpiringSoon ? '1.5px solid #fca5a5' : '1px solid #e2e8f0',
                        boxShadow: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      {/* Imagem de Topo 170px com Badges */}
                      <div
                        style={{
                          height: 170,
                          position: 'relative',
                          backgroundImage: `linear-gradient(to bottom, rgba(15,23,42,0.15), rgba(15,23,42,0.75)), url(${bannerImg})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            background: '#b91c1c',
                            color: '#ffffff',
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontWeight: 800,
                            fontSize: '0.78rem',
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                          }}
                        >
                          -{pctDesconto}%
                        </span>

                        <div
                          style={{
                            position: 'absolute',
                            bottom: 10,
                            left: 12,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            color: isExpiringSoon ? '#fecaca' : '#f8fafc',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                          }}
                        >
                          {isExpiringSoon ? <AlertTriangle size={14} color="#f87171" /> : <Clock size={14} />}
                          <span>{isExpiringSoon ? 'Expira em 18 horas' : 'Expira em 3 dias'}</span>
                        </div>
                      </div>

                      {/* Corpo do Card */}
                      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                            {oferta.categoria || 'PEÇAS'}
                          </span>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              type="button"
                              title="Editar oferta"
                              onClick={() => {
                                setOfertaEstoqueId(oferta.id);
                                setOfertaPrecoPromo(String(precoPromo));
                                setActiveTab('criar-oferta');
                              }}
                              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              title="Encerrar oferta"
                              onClick={() =>
                                void handleQuickUpdateItem(oferta, oferta.quantidadeEstoque, oferta.precoVenda, false, null)
                              }
                              style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', padding: 4 }}
                            >
                              <Trash2 size={14} />
                            </button>
                            <MoreVertical size={14} color="#94a3b8" />
                          </div>
                        </div>

                        <strong style={{ fontSize: '1.02rem', color: '#0f172a', lineHeight: 1.35, marginBottom: 14 }}>
                          {oferta.nomePeca}
                        </strong>

                        <div style={{ marginTop: 'auto' }}>
                          <div style={{ fontSize: '0.78rem', color: '#94a3b8', textDecoration: 'line-through', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                            De R$ {oferta.precoVenda.toFixed(2).replace('.', ',')}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                            <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#006375' }}>
                              R$ {precoPromo.toFixed(2).replace('.', ',')}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                              à vista
                            </span>
                          </div>
                        </div>

                        <div
                          style={{
                            marginTop: 16,
                            paddingTop: 14,
                            borderTop: '1px solid #f1f5f9',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div style={{ display: 'flex', gap: 18 }}>
                            <div>
                              <span style={{ display: 'block', fontSize: '0.68rem', color: '#64748b', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                                Visualizações
                              </span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 700, fontSize: '0.84rem', color: '#0f172a', marginTop: 2 }}>
                                <Eye size={13} color="#64748b" /> {views}
                              </span>
                            </div>
                            <div>
                              <span style={{ display: 'block', fontSize: '0.68rem', color: '#64748b', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                                Cliques
                              </span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 700, fontSize: '0.84rem', color: '#0f172a', marginTop: 2 }}>
                                <MousePointerClick size={13} color="#64748b" /> {clicks}
                              </span>
                            </div>
                          </div>

                          <span
                            style={{
                              padding: '4px 9px',
                              borderRadius: 6,
                              background: '#c8e6f0',
                              color: '#006375',
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                            }}
                          >
                            {convPct}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            TELA 4.1: CRIAR NOVA OFERTA (Fiel ao Protótipo 4.1)
           ========================================================= */}
        {activeTab === 'criar-oferta' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <button
                type="button"
                onClick={() => setActiveTab('ofertas')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '0.84rem',
                  padding: 0,
                  marginBottom: 8,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <ArrowLeft size={15} />
                <span>Voltar para Ofertas Ativas</span>
              </button>
              <h1 style={{ fontSize: '1.85rem', margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Criar Nova Oferta
              </h1>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.92rem' }}>
                Selecione um produto do seu inventário e defina condições especiais para destacar no Radar.
              </p>
            </div>

            <form onSubmit={handlePublicarOferta}>
              <div className="lojista-split-grid">
                {/* Passos 1, 2 e 3 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
                  <div className="card" style={{ padding: 24, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 14, fontSize: '1.05rem', color: '#0f172a' }}>
                      1. Selecionar Produto do Estoque
                    </h3>
                    <div style={{ position: 'relative', marginBottom: 12 }}>
                      <Search size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      <TextInput
                        placeholder="Buscar peça no seu inventário por nome ou SKU..."
                        value={ofertaBuscaProduto}
                        onChange={(e) => setOfertaBuscaProduto(e.target.value)}
                        style={{ paddingLeft: 38 }}
                      />
                    </div>
                    <select
                      className="input"
                      value={ofertaEstoqueId}
                      onChange={(e) => {
                        const id = e.target.value;
                        setOfertaEstoqueId(id);
                        const found = estoque.find((i) => i.id === id);
                        if (found) {
                          const pct = Number(ofertaDescontoPct) || 20;
                          setOfertaPrecoPromo(String(Number((found.precoVenda * (1 - pct / 100)).toFixed(2))));
                        }
                      }}
                    >
                      {estoque
                        .filter(
                          (i) =>
                            !ofertaBuscaProduto.trim() ||
                            i.nomePeca.toLowerCase().includes(ofertaBuscaProduto.toLowerCase()) ||
                            (i.sku || '').toLowerCase().includes(ofertaBuscaProduto.toLowerCase()),
                        )
                        .map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.nomePeca} — Estoque: {i.quantidadeEstoque} un. — R$ {i.precoVenda.toFixed(2)}
                          </option>
                        ))}
                    </select>

                    {itemSelecionadoOferta && (
                      <div
                        style={{
                          marginTop: 14,
                          padding: '14px 16px',
                          borderRadius: 10,
                          background: '#f8fafc',
                          border: '1.5px solid #006375',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 12,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 8,
                              background: '#e2e8f0',
                              color: '#006375',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {renderCategoryIcon(itemSelecionadoOferta.categoria, 20)}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <strong style={{ color: '#0f172a', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{itemSelecionadoOferta.nomePeca}</strong>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                              SKU: {itemSelecionadoOferta.sku || `SKU-${itemSelecionadoOferta.pecaId}`} • Estoque: {itemSelecionadoOferta.quantidadeEstoque} un. • Preço Atual: R$ {itemSelecionadoOferta.precoVenda.toFixed(2).replace('.', ',')}
                            </div>
                          </div>
                        </div>
                        <span style={{ color: '#006375', fontWeight: 700, fontSize: '0.82rem' }}>Selecionado</span>
                      </div>
                    )}
                  </div>

                  {/* Passo 2: Configurar Desconto e Preço */}
                  <div className="card" style={{ padding: 24, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: '1.05rem', color: '#0f172a' }}>
                      2. Configurar Desconto e Preço
                    </h3>
                    <div className="lojista-form-grid-3">
                      <Field label="Preço Original">
                        <TextInput
                          disabled
                          value={
                            itemSelecionadoOferta
                              ? `R$ ${itemSelecionadoOferta.precoVenda.toFixed(2).replace('.', ',')}`
                              : 'R$ 0,00'
                          }
                        />
                      </Field>
                      <Field label="Desconto (%)">
                        <TextInput
                          type="number"
                          min={1}
                          max={90}
                          value={ofertaDescontoPct}
                          onChange={(e) => handleOfertaDescontoChange(e.target.value)}
                        />
                      </Field>
                      <Field label="Preço Promocional *">
                        <TextInput
                          type="number"
                          step="0.01"
                          required
                          value={ofertaPrecoPromo}
                          onChange={(e) => handleOfertaPrecoChange(e.target.value)}
                          style={{ borderColor: '#006375', fontWeight: 800, color: '#006375' }}
                        />
                      </Field>
                    </div>

                    {itemSelecionadoOferta && Number(ofertaPrecoPromo) > 0 && (
                      <div
                        style={{
                          marginTop: 14,
                          padding: '10px 14px',
                          borderRadius: 8,
                          background: '#f1f5f9',
                          color: '#006375',
                          fontSize: '0.84rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <CheckCircle2 size={16} color="#006375" />
                        <span>
                          O cliente economizará{' '}
                          <strong>
                            R${' '}
                            {Math.max(0, itemSelecionadoOferta.precoVenda - Number(ofertaPrecoPromo))
                              .toFixed(2)
                              .replace('.', ',')}
                          </strong>{' '}
                          nesta oferta.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Passo 3: Duração e Visibilidade */}
                  <div className="card" style={{ padding: 24, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: '1.05rem', color: '#0f172a' }}>
                      3. Duração e Visibilidade
                    </h3>
                    <div className="lojista-form-grid-2" style={{ marginBottom: 16 }}>
                      <Field label="Data de Início">
                        <div style={{ position: 'relative' }}>
                          <Calendar size={15} color="#64748b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                          <TextInput
                            type="date"
                            value={ofertaDataInicio}
                            onChange={(e) => setOfertaDataInicio(e.target.value)}
                            style={{ paddingLeft: 36 }}
                          />
                        </div>
                      </Field>
                      <Field label="Data de Término">
                        <div style={{ position: 'relative' }}>
                          <Calendar size={15} color="#64748b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                          <TextInput
                            type="date"
                            value={ofertaDataFim}
                            onChange={(e) => setOfertaDataFim(e.target.value)}
                            style={{ paddingLeft: 36 }}
                          />
                        </div>
                      </Field>
                    </div>

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: 8,
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        cursor: 'pointer',
                      }}
                    >
                      <div>
                        <strong style={{ display: 'block', fontSize: '0.88rem', color: '#0f172a' }}>
                          Destaque Especial no Mapa
                        </strong>
                        <small style={{ color: '#64748b' }}>
                          Exibir pino promocional da loja para buscas compatíveis num raio de 15km
                        </small>
                      </div>
                      <input
                        type="checkbox"
                        checked={ofertaDestaqueMapa}
                        onChange={(e) => setOfertaDestaqueMapa(e.target.checked)}
                        style={{ width: 18, height: 18, accentColor: '#006375' }}
                      />
                    </label>
                  </div>
                </div>

                {/* Coluna Direita: Pré-Visualização no Radar */}
                <div className="card" style={{ padding: 22, position: 'sticky', top: 24, border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      color: '#64748b',
                      textTransform: 'uppercase',
                      marginBottom: 12,
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    }}
                  >
                    PRÉ-VISUALIZAÇÃO NO RADAR
                  </div>

                  <div
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: 12,
                      overflow: 'hidden',
                      background: '#ffffff',
                    }}
                  >
                    <div
                      style={{
                        height: 135,
                        backgroundImage: `linear-gradient(to bottom, rgba(15,23,42,0.2), rgba(15,23,42,0.75)), url(${PRODUCT_BANNER_IMAGES[0]})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        padding: 12,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <span
                        style={{
                          background: '#c8e6f0',
                          color: '#006375',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        }}
                      >
                        OFERTA EM DESTAQUE
                      </span>
                      <span
                        style={{
                          background: '#b91c1c',
                          color: '#ffffff',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        }}
                      >
                        -{ofertaDescontoPct || 20}%
                      </span>
                    </div>

                    <div style={{ padding: 16 }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                        <Store size={13} color="#006375" />
                        <span>{loja?.nomeFantasia || 'Sua Loja'} • a 2.4 km</span>
                      </div>
                      <strong style={{ display: 'block', marginTop: 6, fontSize: '0.96rem', color: '#0f172a' }}>
                        {itemSelecionadoOferta?.nomePeca || 'Produto Selecionado'}
                      </strong>
                      <div style={{ marginTop: 10 }}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                          R$ {(itemSelecionadoOferta?.precoVenda ?? 150).toFixed(2).replace('.', ',')}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#006375' }}>
                            R$ {Number(ofertaPrecoPromo || 119.9).toFixed(2).replace('.', ',')}
                          </span>
                          <span
                            style={{
                              padding: '5px 10px',
                              borderRadius: 6,
                              background: '#c8e6f0',
                              color: '#006375',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                            }}
                          >
                            Ver no Mapa
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 14,
                      padding: 12,
                      borderRadius: 8,
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.78rem',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                    }}
                  >
                    <Info size={16} color="#006375" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>
                      Produtos com descontos a partir de <strong>15%</strong> recebem até <strong>3x mais cliques</strong> na busca regional.
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                    <Button type="submit" block disabled={ofertaSaving}>
                      {ofertaSaving ? 'Publicando...' : 'Publicar Oferta'}
                    </Button>
                    <Button type="button" variant="ghost" block onClick={() => setActiveTab('ofertas')}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* =========================================================
            TELA 5: MAIS PROCURADOS NA REGIÃO (Fiel ao Protótipo 5)
           ========================================================= */}
        {activeTab === 'mais-procurados' && (
          <div>
            <div className="lojista-page-header">
              <div>
                <h1 style={{ fontSize: '1.85rem', margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  Mais Procurados na Região
                </h1>
                <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '0.92rem' }}>
                  Descubra o que os motociclistas estão buscando perto de você (Raio de {raioProcurados}km) nos últimos {periodoProcurados} dias.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginLeft: 'auto' }}>
                <select
                  className="input"
                  value={raioProcurados}
                  onChange={(e) => setRaioProcurados(e.target.value)}
                  style={{ width: 145, background: '#ffffff' }}
                >
                  <option value="5">Raio: 5 km</option>
                  <option value="15">Raio: 15 km</option>
                  <option value="30">Raio: 30 km</option>
                </select>
                <select
                  className="input"
                  value={periodoProcurados}
                  onChange={(e) => setPeriodoProcurados(e.target.value)}
                  style={{ width: 155, background: '#ffffff' }}
                >
                  <option value="7">Últimos 7 dias</option>
                  <option value="15">Últimos 15 dias</option>
                  <option value="30">Últimos 30 dias</option>
                </select>
              </div>
            </div>

            {/* 4 KPI Cards de Inteligência Regional */}
            <div className="lojista-kpi-grid">
              <div className="card" style={{ padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                  <span>Total de Buscas na Região</span>
                  <Search size={15} color="#006375" />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 10 }}>
                  <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>3.420</span>
                  <span style={{ fontSize: '0.72rem', background: '#c8e6f0', color: '#006375', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                    +15%
                  </span>
                </div>
              </div>

              <div className="card" style={{ padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                  <span>Motos Mais Buscadas</span>
                  <TrendingUp size={15} color="#64748b" />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 10 }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#006375' }}>Honda CG 160</span>
                  <span style={{ fontSize: '0.72rem', background: '#e2e8f0', color: '#475569', padding: '2px 8px', borderRadius: 6, fontWeight: 700, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                    28%
                  </span>
                </div>
              </div>

              <div className="card" style={{ padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                  <span>Horário de Pico</span>
                  <Clock size={15} color="#64748b" />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 10 }}>
                  <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>14h - 18h</span>
                  <span style={{ fontSize: '0.72rem', background: '#e2e8f0', color: '#475569', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
                    Seg a Sex
                  </span>
                </div>
              </div>

              <div className="card" style={{ padding: '18px 20px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                  <span>Oportunidades Perdidas</span>
                  <AlertTriangle size={15} color="#dc2626" />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 10 }}>
                  <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#b91c1c' }}>
                    {maisProcuradosNormalizados.filter((i) => i.quantidadeMeuEstoque === 0).length} Peças
                  </span>
                  <span style={{ fontSize: '0.72rem', background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                    Sem Estoque
                  </span>
                </div>
              </div>
            </div>

            {/* Barra de Filtros Mais Procurados */}
            <div
              className="card"
              style={{
                padding: '10px 14px',
                marginBottom: 22,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                boxShadow: 'none',
              }}
            >
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { id: 'tudo', label: 'Tudo' },
                  { id: 'buscados', label: 'Mais Buscados' },
                  { id: 'tendencias', label: 'Tendências' },
                  { id: 'sem-estoque', label: 'Sem Estoque (Oportunidades)' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFiltroProcuradosTab(tab.id as typeof filtroProcuradosTab)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 6,
                      border: 'none',
                      background: filtroProcuradosTab === tab.id ? '#ffffff' : 'transparent',
                      color: filtroProcuradosTab === tab.id ? '#0f172a' : '#64748b',
                      fontWeight: filtroProcuradosTab === tab.id ? 700 : 500,
                      boxShadow: filtroProcuradosTab === tab.id ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: '0 1 320px', marginLeft: 'auto' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
                  <Search size={15} color="#64748b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <TextInput
                    placeholder="Filtrar peça ou moto..."
                    value={buscaProcurados}
                    onChange={(e) => setBuscaProcurados(e.target.value)}
                    style={{ paddingLeft: 36, background: '#ffffff', height: 36 }}
                  />
                </div>
                <button
                  type="button"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <SlidersHorizontal size={15} />
                </button>
              </div>
            </div>

            {/* TOP 3 CARDS VISUAIS EM 3 COLUNAS (Fiel ao Protótipo 5) */}
            <div className="lojista-cards-grid-3">
              {maisProcuradosFiltrados.slice(0, 3).map((item, idx) => {
                const semEstoque = item.quantidadeMeuEstoque === 0;
                const baixoEstoque = item.quantidadeMeuEstoque > 0 && item.quantidadeMeuEstoque <= 3;
                const bannerImg = PRODUCT_BANNER_IMAGES[(idx + 1) % PRODUCT_BANNER_IMAGES.length];

                return (
                  <div
                    key={item.posicao}
                    className="card"
                    style={{
                      padding: 0,
                      overflow: 'hidden',
                      border: semEstoque ? '1.5px solid #fca5a5' : '1px solid #e2e8f0',
                      boxShadow: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div
                      style={{
                        height: 170,
                        position: 'relative',
                        backgroundImage: `linear-gradient(to bottom, rgba(15,23,42,0.15), rgba(15,23,42,0.78)), url(${bannerImg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          background: item.posicao === 1 ? '#006375' : '#f8fafc',
                          color: item.posicao === 1 ? '#ffffff' : '#0f172a',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.88rem',
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        }}
                      >
                        {item.posicao}º
                      </span>

                      <div
                        style={{
                          position: 'absolute',
                          bottom: 10,
                          left: 12,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          color: '#a5f3fc',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        }}
                      >
                        <TrendingUp size={14} />
                        <span>+{item.crescimentoPercentual}% em buscas</span>
                      </div>
                    </div>

                    <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                          {item.categoria}
                        </span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            background: '#f1f5f9',
                            color: '#475569',
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontWeight: 600,
                            maxWidth: 150,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                          }}
                        >
                          {item.compatibilidade}
                        </span>
                      </div>

                      <strong style={{ fontSize: '1.02rem', color: '#0f172a', lineHeight: 1.35, marginBottom: 14 }}>
                        {item.nomePeca}
                      </strong>

                      <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                            Volume de Buscas (7d)
                          </span>
                          <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#006375', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                            {item.buscasUltimos7Dias}
                          </span>
                        </div>

                        <div
                          style={{
                            padding: '8px 12px',
                            borderRadius: 8,
                            background: semEstoque || baixoEstoque ? '#fee2e2' : '#f1f5f9',
                            border: semEstoque || baixoEstoque ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: semEstoque || baixoEstoque ? '#b91c1c' : '#006375',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            <span
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                background: semEstoque || baixoEstoque ? '#dc2626' : '#006375',
                              }}
                            />
                            {semEstoque
                              ? 'Sem Estoque (0 un.)'
                              : baixoEstoque
                                ? `Baixo Estoque (${item.quantidadeMeuEstoque} un.)`
                                : `Em Estoque (${item.quantidadeMeuEstoque} un.)`}
                          </span>

                          {semEstoque ? (
                            <button
                              type="button"
                              onClick={() => {
                                setNpNomePeca(item.nomePeca);
                                setActiveTab('novo-produto');
                              }}
                              style={{
                                background: '#006375',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: 6,
                                padding: '5px 10px',
                                fontSize: '0.73rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              + Cadastrar Peça
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setActiveTab(baixoEstoque ? 'estoque' : 'criar-oferta')}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: baixoEstoque ? '#b91c1c' : '#006375',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 2,
                              }}
                            >
                              <span>{baixoEstoque ? 'Repor' : 'Criar Oferta'}</span>
                              <ChevronRight size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Demais Itens no Ranking da Região (Com proteção de flexbox contra quebra de linha) */}
            {maisProcuradosFiltrados.length > 3 && (
              <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                <div style={{ padding: '14px 20px', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                  <strong style={{ fontSize: '0.88rem', color: '#334155', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                    DEMAIS ITENS NO RANKING REGIONAL
                  </strong>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {maisProcuradosFiltrados.slice(3).map((item) => {
                    const semEstoque = item.quantidadeMeuEstoque === 0;
                    return (
                      <div
                        key={item.posicao}
                        className="lojista-ranking-row"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 260px', minWidth: 0 }}>
                          <span
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 6,
                              background: '#e2e8f0',
                              color: '#334155',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.78rem',
                              flexShrink: 0,
                              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                            }}
                          >
                            {item.posicao}º
                          </span>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <strong style={{ display: 'block', fontSize: '0.92rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.nomePeca}
                            </strong>
                            <div
                              style={{
                                fontSize: '0.78rem',
                                color: '#64748b',
                                marginTop: 2,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={`${item.categoria} • Compatível: ${item.compatibilidade}`}
                            >
                              {item.categoria} • Compatível: {item.compatibilidade}
                            </div>
                          </div>
                        </div>

                        <div className="lojista-ranking-right">
                          <div style={{ textAlign: 'right' }}>
                            <strong style={{ color: '#006375', fontSize: '0.95rem', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                              {item.buscasUltimos7Dias} buscas
                            </strong>
                            <div style={{ fontSize: '0.73rem', color: '#006375', fontWeight: 700, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                              +{item.crescimentoPercentual}% (7d)
                            </div>
                          </div>

                          <span
                            style={{
                              padding: '5px 10px',
                              borderRadius: 999,
                              background: semEstoque ? '#fee2e2' : '#c8e6f0',
                              color: semEstoque ? '#b91c1c' : '#006375',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            {semEstoque ? 'Sem Estoque (0 un.)' : `Em Estoque (${item.quantidadeMeuEstoque} un.)`}
                          </span>

                          {semEstoque ? (
                            <Button
                              type="button"
                              onClick={() => {
                                setNpNomePeca(item.nomePeca);
                                setActiveTab('novo-produto');
                              }}
                              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                            >
                              + Cadastrar Peça
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => setActiveTab('criar-oferta')}
                              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                            >
                              Criar Oferta
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            TELA 6: PERFIL DA LOJA (Fiel ao Protótipo 6)
           ========================================================= */}
        {activeTab === 'perfil' && (
          <div>
            <div className="lojista-page-header">
              <div>
                <h1 style={{ fontSize: '1.85rem', margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  Perfil da Loja
                </h1>
                <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '0.92rem' }}>
                  Gerencie as informações públicas da sua loja visíveis para os motociclistas.
                </p>
              </div>
              <Button
                type="button"
                variant={editandoPerfil ? 'ghost' : 'primary'}
                onClick={() => setEditandoPerfil((v) => !v)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', marginLeft: 'auto' }}
              >
                <Pencil size={15} />
                {editandoPerfil ? 'Cancelar Edição' : 'Editar Perfil'}
              </Button>
            </div>

            <div className="lojista-split-grid">
              {/* Card Principal da Loja */}
              <div className="card" style={{ padding: 28, border: '1px solid #e2e8f0', boxShadow: 'none', minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 22, alignItems: 'center', flexWrap: 'wrap', paddingBottom: 24, borderBottom: '1px solid #e2e8f0' }}>
                  <div
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: 14,
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      color: '#006375',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      flexShrink: 0,
                    }}
                  >
                    <Store size={34} strokeWidth={1.8} />
                    <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.06em', color: '#475569', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                      OFICIAL
                    </span>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a' }}>{loja?.nomeFantasia || user?.nome}</h2>
                    <div style={{ color: '#64748b', fontSize: '0.84rem', marginTop: 4, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                      CNPJ: {loja?.cnpj || '12.345.678/0001-90'}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: 999,
                          background: '#c8e6f0',
                          color: '#006375',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        <ShieldCheck size={14} /> Loja Verificada
                      </span>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: 999,
                          background: '#f1f5f9',
                          color: '#475569',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        }}
                      >
                        Desde 2026
                      </span>
                    </div>
                  </div>
                </div>

                {editandoPerfil ? (
                  <form onSubmit={handleSalvarPerfil} style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Field label="Nome Fantasia da Loja">
                      <TextInput
                        required
                        value={pfNomeFantasia}
                        onChange={(e) => setPfNomeFantasia(e.target.value)}
                      />
                    </Field>
                    <div className="lojista-form-grid-2">
                      <Field label="Telefone / WhatsApp">
                        <TextInput
                          value={pfTelefone}
                          onChange={(e) => setPfTelefone(e.target.value)}
                          placeholder="(11) 98765-4321"
                        />
                      </Field>
                      <Field label="E-mail Comercial">
                        <TextInput
                          type="email"
                          value={pfEmailContato}
                          onChange={(e) => setPfEmailContato(e.target.value)}
                          placeholder="contato@motopecas.com.br"
                        />
                      </Field>
                    </div>
                    <Field label="Endereço Principal Completo">
                      <TextInput
                        value={pfEndereco}
                        onChange={(e) => setPfEndereco(e.target.value)}
                      />
                    </Field>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                      <Button type="button" variant="ghost" onClick={() => setEditandoPerfil(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={pfSaving}>
                        {pfSaving ? 'Salvando...' : 'Salvar Alterações'}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="lojista-form-grid-2" style={{ gap: 28, marginTop: 24 }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 8, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                        Endereço Principal
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <MapPin size={18} color="#006375" style={{ flexShrink: 0, marginTop: 2 }} />
                        <div style={{ fontWeight: 500, fontSize: '0.92rem', lineHeight: 1.55, color: '#1e293b' }}>
                          {loja?.enderecoCompleto || 'Av. dos Bandeirantes, 1450 - Vila Olímpia, São Paulo - SP'}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 8, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                        Contato
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.92rem', color: '#1e293b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Phone size={16} color="#006375" />
                          <span>{loja?.telefoneContato || '(11) 98765-4321'} (WhatsApp)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Mail size={16} color="#006375" />
                          <span>{loja?.emailContato || user?.email || 'contato@motopecas.com.br'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Horário de Funcionamento */}
              <div className="card" style={{ padding: 24, border: '1px solid #e2e8f0', boxShadow: 'none', minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>Horário</strong>
                  <Clock size={18} color="#64748b" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {pfHorarios.map((h, idx) => (
                    <div
                      key={h.dia}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.86rem',
                      }}
                    >
                      <span style={{ color: '#475569' }}>{h.dia}</span>
                      {editandoPerfil ? (
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}>
                          <input
                            type="checkbox"
                            checked={!h.fechado}
                            onChange={(e) => {
                              const next = [...pfHorarios];
                              next[idx] = { ...h, fechado: !e.target.checked };
                              setPfHorarios(next);
                            }}
                          />
                          {h.fechado ? 'Fechado' : `${h.abre} - ${h.fecha}`}
                        </label>
                      ) : h.fechado ? (
                        <strong style={{ color: '#b91c1c', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>Fechado</strong>
                      ) : (
                        <strong style={{ color: '#0f172a', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                          {h.abre} - {h.fecha}
                        </strong>
                      )}
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: 20,
                    paddingTop: 16,
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                    Status Atual:
                  </span>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: '#c8e6f0',
                      color: '#006375',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#006375' }} />
                    Aberto Agora
                  </span>
                </div>
              </div>
            </div>

            {/* Galeria da Loja (Fiel ao Protótipo 6) */}
            <div style={{ marginTop: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <strong style={{ fontSize: '1.08rem', color: '#0f172a' }}>Galeria da Loja</strong>
                <button
                  type="button"
                  onClick={() =>
                    setPfFotos((prev) => [
                      ...prev,
                      {
                        title: `Ambiente da Loja #${prev.length + 1}`,
                        url: PRODUCT_BANNER_IMAGES[prev.length % PRODUCT_BANNER_IMAGES.length],
                      },
                    ])
                  }
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#006375',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  }}
                >
                  <ImagePlus size={15} />
                  <span>+ Adicionar Foto</span>
                </button>
              </div>

              <div className="lojista-gallery-grid">
                {pfFotos.slice(0, 3).map((foto, i) => (
                  <div
                    key={i}
                    style={{
                      height: 155,
                      borderRadius: 12,
                      backgroundImage: `linear-gradient(to bottom, rgba(15,23,42,0.1), rgba(15,23,42,0.72)), url(${foto.url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      padding: 14,
                      display: 'flex',
                      alignItems: 'flex-end',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    {foto.title}
                  </div>
                ))}

                {/* 4º Card: Botão Nova Foto */}
                <button
                  type="button"
                  onClick={() =>
                    setPfFotos((prev) => [
                      ...prev,
                      {
                        title: `Estoque Técnico #${prev.length + 1}`,
                        url: PRODUCT_BANNER_IMAGES[prev.length % PRODUCT_BANNER_IMAGES.length],
                      },
                    ])
                  }
                  style={{
                    height: 155,
                    borderRadius: 12,
                    border: '1.5px dashed #cbd5e1',
                    background: '#f1f5f9',
                    color: '#64748b',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: 'pointer',
                  }}
                >
                  <PlusCircle size={26} color="#64748b" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                    Nova Foto
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
