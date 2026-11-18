import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { ErrorState } from '../components/ui';
import { api, ApiError } from '../lib/api';
import { DEFAULT_HORARIOS_LOJA, type HorarioDia, parseHorariosEditor } from '../lib/formatters';
import type { Loja, ModeloMoto, Peca } from '../types';
import { LojistaCriarOfertaTab } from './lojista/LojistaCriarOfertaTab';
import { type FiltroStatusEstoque, LojistaEstoqueTab } from './lojista/LojistaEstoqueTab';
import { type FiltroProcuradosTab, LojistaMaisProcuradosTab } from './lojista/LojistaMaisProcuradosTab';
import { LojistaNovoProdutoTab } from './lojista/LojistaNovoProdutoTab';
import { type FiltroOfertasTab, LojistaOfertasTab } from './lojista/LojistaOfertasTab';
import { LojistaPerfilTab } from './lojista/LojistaPerfilTab';
import { LojistaResumoTab } from './lojista/LojistaResumoTab';
import { LojistaSidebar } from './lojista/LojistaSidebar';
import {
  CATEGORIAS_PADRAO,
  type DashboardLojistaResponse,
  type EstoqueItemExtended,
  type LojistaTab,
  STORE_GALLERY_DEFAULT,
  getCategoriaEstoque,
} from './lojista/lojistaTypes';

export type {
  DashboardLojistaResponse,
  EstoqueItemExtended,
  ItemMaisProcuradoRegiao,
} from './lojista/lojistaTypes';

export function LojistaPage() {
  const { user } = useAuth();
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
  const [filtroStatusEstoque, setFiltroStatusEstoque] = useState<FiltroStatusEstoque>('todos');
  const [paginaEstoque, setPaginaEstoque] = useState(1);

  // Filtros de Ofertas Ativas
  const [filtroOfertasTab, setFiltroOfertasTab] = useState<FiltroOfertasTab>('todas');
  const [buscaOfertas, setBuscaOfertas] = useState('');

  // Filtros de Mais Procurados
  const [filtroProcuradosTab, setFiltroProcuradosTab] = useState<FiltroProcuradosTab>('tudo');
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
  const [pfFotoPerfilUrl, setPfFotoPerfilUrl] = useState('');
  const [pfTelefone, setPfTelefone] = useState('');
  const [pfEmailContato, setPfEmailContato] = useState('');
  const [pfEndereco, setPfEndereco] = useState('');
  const [pfHorarios, setPfHorarios] = useState<HorarioDia[]>(DEFAULT_HORARIOS_LOJA);
  const [pfFotos, setPfFotos] = useState(STORE_GALLERY_DEFAULT);
  const [pfSaving, setPfSaving] = useState(false);

  function handleFotoPerfilFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('A foto de perfil deve ter no máximo 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) setPfFotoPerfilUrl(base64);
    };
    reader.readAsDataURL(file);
  }

  const notifySuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const carregarTudo = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError('');
      try {
        const falhas: string[] = [];
        const [minhaLojaRes, pecasPaged, modelosData] = await Promise.all([
          api<Loja>('/lojas/minha-loja').catch((err) => {
            falhas.push(err instanceof ApiError ? err.message : 'loja');
            return null;
          }),
          api<{ items?: Peca[] } | Peca[]>('/pecas?page=1&pageSize=100').catch(() => {
            falhas.push('catálogo de peças');
            return [] as Peca[];
          }),
          api<{ items?: ModeloMoto[] } | ModeloMoto[]>('/modelos-moto').catch(() => {
            falhas.push('modelos de moto');
            return [] as ModeloMoto[];
          }),
        ]);

        const listaPecas = Array.isArray(pecasPaged) ? pecasPaged : pecasPaged?.items || [];
        const listaModelos = Array.isArray(modelosData) ? modelosData : modelosData?.items || [];

        setPecasCatalogo(listaPecas);
        setModelosMoto(listaModelos);

        if (!minhaLojaRes) {
          setLoja(null);
          setError(
            'Não foi possível localizar o cadastro da sua loja. Verifique sua conta de lojista ou tente recarregar.',
          );
          return;
        }

        setLoja(minhaLojaRes);
        setPfNomeFantasia(minhaLojaRes.nomeFantasia || '');
        setPfFotoPerfilUrl(minhaLojaRes.fotoPerfilUrl || '');
        setPfTelefone(minhaLojaRes.telefoneContato || '');
        setPfEmailContato(minhaLojaRes.emailContato || user?.email || '');
        setPfEndereco(minhaLojaRes.enderecoCompleto || '');
        setPfHorarios(parseHorariosEditor(minhaLojaRes.horariosFuncionamento));

        const [estPaged, dashRes] = await Promise.all([
          api<{ items: EstoqueItemExtended[] }>(
            `/lojas/${minhaLojaRes.id}/estoque?page=1&pageSize=100`,
          ).catch((err) => {
            falhas.push(err instanceof ApiError ? err.message : 'estoque');
            return { items: [] as EstoqueItemExtended[] };
          }),
          api<DashboardLojistaResponse>(`/lojas/${minhaLojaRes.id}/dashboard`).catch((err) => {
            falhas.push(err instanceof ApiError ? err.message : 'métricas do painel');
            return null;
          }),
        ]);

        const items = estPaged?.items || [];
        setEstoque(items);
        setDashboard(dashRes);

        if (items.length > 0) {
          setOfertaEstoqueId((prev) => prev || items[0].id);
          setOfertaPrecoPromo((prev) => prev || String(Number((items[0].precoVenda * 0.8).toFixed(2))));
        }

        if (falhas.length > 0) {
          setError(`Alguns dados não puderam ser carregados (${falhas.join(', ')}).`);
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Erro ao carregar dados do painel do lojista.');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [user],
  );

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

      const hoje = new Date();
      const todayStr = hoje.toISOString().slice(0, 10);
      hoje.setDate(hoje.getDate() + 7);
      const nextWeekStr = hoje.toISOString().slice(0, 10);

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
      const compatText =
        npModelosSelecionados.length > 0 ? npModelosSelecionados.join(', ') : 'Universal';

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
        const descricao = [npDescricao.trim(), `Marca: ${npMarca}`, `Compatível: ${compatText}`]
          .filter(Boolean)
          .join(' • ');
        try {
          pecaExistente = await api<Peca>('/pecas', {
            method: 'POST',
            body: JSON.stringify({
              sku: skuFinal,
              nome: npNomePeca.trim(),
              descricao,
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
              descricao,
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
          fotoPerfilUrl: pfFotoPerfilUrl.trim() || null,
          horariosFuncionamento: JSON.stringify(pfHorarios),
          galeriaFotosUrls: pfFotos.map((f) => f.url),
        }),
      });
      setLoja(updated);
      setPfFotoPerfilUrl(updated.fotoPerfilUrl || '');
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
        `${i.id},"${i.nomePeca.replace(/"/g, '""')}","${getCategoriaEstoque(i)}","${i.sku || ''}",${i.quantidadeEstoque},${i.precoVenda},${i.emPromocao},${i.precoPromocional ?? ''}`,
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
    const fromItems = estoque.map((i) => getCategoriaEstoque(i)).filter(Boolean);
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
        getCategoriaEstoque(item).toLowerCase() === filtroCategoriaEstoque.toLowerCase();

      let matchStatus = true;
      if (filtroStatusEstoque === 'alto') matchStatus = item.quantidadeEstoque > 10;
      if (filtroStatusEstoque === 'baixo')
        matchStatus = item.quantidadeEstoque > 0 && item.quantidadeEstoque <= 3;
      if (filtroStatusEstoque === 'zerado') matchStatus = item.quantidadeEstoque === 0;
      if (filtroStatusEstoque === 'promo') matchStatus = item.emPromocao;

      return matchTermo && matchCat && matchStatus;
    });
  }, [estoque, buscaEstoque, filtroCategoriaEstoque, filtroStatusEstoque]);

  const ESTOQUE_PAGE_SIZE = 10;
  const totalPaginasEstoque = Math.max(1, Math.ceil(estoqueFiltrado.length / ESTOQUE_PAGE_SIZE));
  const paginaEstoqueSegura = Math.min(paginaEstoque, totalPaginasEstoque);
  const estoquePaginado = useMemo(() => {
    const start = (paginaEstoqueSegura - 1) * ESTOQUE_PAGE_SIZE;
    return estoqueFiltrado.slice(start, start + ESTOQUE_PAGE_SIZE);
  }, [estoqueFiltrado, paginaEstoqueSegura]);

  useEffect(() => {
    setPaginaEstoque(1);
  }, [buscaEstoque, filtroCategoriaEstoque, filtroStatusEstoque]);

  const ofertasAtivasList = useMemo(() => {
    const base = estoque.filter((i) => i.emPromocao);
    const filtered = base.filter(
      (i) =>
        !buscaOfertas.trim() ||
        i.nomePeca.toLowerCase().includes(buscaOfertas.toLowerCase()) ||
        getCategoriaEstoque(i).toLowerCase().includes(buscaOfertas.toLowerCase()),
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
      buscasUltimos7Dias: item.totalBuscas7d ?? item.buscasUltimos7Dias ?? 0,
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

  const ofertasExpirandoEmBreve = useMemo(() => {
    const agora = new Date();
    return ofertasAtivasList.filter((item) => {
      if (!item.dataFimPromocao) return false;
      const fim = new Date(item.dataFimPromocao);
      const diffHoras = (fim.getTime() - agora.getTime()) / (1000 * 60 * 60);
      return diffHoras >= 0 && diffHoras <= 48;
    }).length;
  }, [ofertasAtivasList]);

  const totalBuscasRegiao = useMemo(
    () => maisProcuradosNormalizados.reduce((acc, i) => acc + (i.buscasUltimos7Dias || 0), 0),
    [maisProcuradosNormalizados],
  );

  const crescimentoMedioRegiao = useMemo(() => {
    if (maisProcuradosNormalizados.length === 0) return 0;
    const soma = maisProcuradosNormalizados.reduce((acc, i) => acc + (i.crescimentoPercentual || 0), 0);
    return Math.round(soma / maisProcuradosNormalizados.length);
  }, [maisProcuradosNormalizados]);

  const motoMaisProcurada = useMemo(() => {
    if (maisProcuradosNormalizados.length === 0) return { nome: 'Diversos Modelos', percentual: 0 };
    const contagem: Record<string, number> = {};
    for (const item of maisProcuradosNormalizados) {
      const modelos = (item.compatibilidade || '')
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);
      for (const m of modelos) {
        const nomeSimplificado = m.replace(/\s*\([^)]*\)/g, '').trim();
        if (nomeSimplificado && nomeSimplificado.toLowerCase() !== 'universal') {
          contagem[nomeSimplificado] = (contagem[nomeSimplificado] || 0) + 1;
        }
      }
    }
    const entries = Object.entries(contagem);
    if (entries.length === 0) return { nome: 'Universal / Multimarcas', percentual: 100 };
    entries.sort((a, b) => b[1] - a[1]);
    const [topNome, topQtd] = entries[0];
    return {
      nome: topNome,
      percentual: Math.round((topQtd / maisProcuradosNormalizados.length) * 100),
    };
  }, [maisProcuradosNormalizados]);

  const horarioPicoCalculado = useMemo(() => {
    const diaSegSex =
      pfHorarios.find((h) => !h.fechado && h.dia.toLowerCase().includes('seg')) ||
      pfHorarios.find((h) => !h.fechado);
    if (diaSegSex) {
      return {
        faixa: `${diaSegSex.abre.slice(0, 2)}h - ${diaSegSex.fecha.slice(0, 2)}h`,
        dias: 'Seg a Sex',
      };
    }
    return { faixa: '08h - 18h', dias: 'Comercial' };
  }, [pfHorarios]);

  const statusLojaAtual = useMemo(() => {
    const agora = new Date();
    const diasNomes = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const diaHoje = diasNomes[agora.getDay()];
    const configHoje = pfHorarios.find(
      (h) => h.dia.toLowerCase().trim() === diaHoje.toLowerCase().trim(),
    );
    if (!configHoje || configHoje.fechado) return { aberto: false, label: 'Fechado Agora' };

    const [horaAbre, minAbre] = configHoje.abre.split(':').map(Number);
    const [horaFecha, minFecha] = configHoje.fecha.split(':').map(Number);
    const minutosAtual = agora.getHours() * 60 + agora.getMinutes();
    const minutosAbre = (horaAbre || 0) * 60 + (minAbre || 0);
    const minutosFecha = (horaFecha || 0) * 60 + (minFecha || 0);

    if (minutosAtual >= minutosAbre && minutosAtual < minutosFecha) {
      return { aberto: true, label: `Aberto Agora (fecha às ${configHoje.fecha})` };
    }
    return { aberto: false, label: `Fechado Agora (abre às ${configHoje.abre})` };
  }, [pfHorarios]);

  if (loading) {
    return (
      <div className="lojista-loading-wrap">
        <Loader2 size={20} color="#006375" />
        <span style={{ fontWeight: 600 }}>Carregando Painel de Gestão Lojista...</span>
      </div>
    );
  }

  return (
    <div className="lojista-shell">
      <LojistaSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        loja={loja}
        fotoPerfilUrl={pfFotoPerfilUrl}
      />

      <div className="lojista-main">
        {error && (
          <div style={{ marginBottom: 16 }}>
            <ErrorState text={error} onRetry={() => void carregarTudo()} />
          </div>
        )}
        {successMsg && (
          <div className="lojista-success-banner">
            <CheckCircle2 size={18} color="#059669" />
            <span>{successMsg}</span>
          </div>
        )}

        {activeTab === 'resumo' && (
          <LojistaResumoTab
            dashboard={dashboard}
            estoque={estoque}
            ofertasAtivasCount={ofertasAtivasList.length}
            maisProcuradosNormalizados={maisProcuradosNormalizados}
            onChangeTab={setActiveTab}
            onExportCsv={exportarInventarioCsv}
            onQuickUpdateItem={handleQuickUpdateItem}
          />
        )}

        {activeTab === 'novo-produto' && (
          <LojistaNovoProdutoTab
            categoriasDisponiveis={categoriasDisponiveis}
            modelosMoto={modelosMoto}
            npNomePeca={npNomePeca}
            setNpNomePeca={setNpNomePeca}
            npCategoria={npCategoria}
            setNpCategoria={setNpCategoria}
            npNovaCategoria={npNovaCategoria}
            setNpNovaCategoria={setNpNovaCategoria}
            npMarca={npMarca}
            setNpMarca={setNpMarca}
            npCodigoSku={npCodigoSku}
            setNpCodigoSku={setNpCodigoSku}
            npDescricao={npDescricao}
            setNpDescricao={setNpDescricao}
            npModelosSelecionados={npModelosSelecionados}
            setNpModelosSelecionados={setNpModelosSelecionados}
            npTagMotoInput={npTagMotoInput}
            setNpTagMotoInput={setNpTagMotoInput}
            npQuantidade={npQuantidade}
            setNpQuantidade={setNpQuantidade}
            npAlertaMinimo={npAlertaMinimo}
            setNpAlertaMinimo={setNpAlertaMinimo}
            npPreco={npPreco}
            setNpPreco={setNpPreco}
            npEmPromocao={npEmPromocao}
            setNpEmPromocao={setNpEmPromocao}
            npPrecoPromo={npPrecoPromo}
            setNpPrecoPromo={setNpPrecoPromo}
            npSaving={npSaving}
            onSubmit={handleSalvarNovoProduto}
            onChangeTab={setActiveTab}
          />
        )}

        {activeTab === 'estoque' && (
          <LojistaEstoqueTab
            buscaEstoque={buscaEstoque}
            setBuscaEstoque={setBuscaEstoque}
            filtroCategoriaEstoque={filtroCategoriaEstoque}
            setFiltroCategoriaEstoque={setFiltroCategoriaEstoque}
            filtroStatusEstoque={filtroStatusEstoque}
            setFiltroStatusEstoque={setFiltroStatusEstoque}
            categoriasDisponiveis={categoriasDisponiveis}
            estoqueFiltrado={estoqueFiltrado}
            estoquePaginado={estoquePaginado}
            paginaEstoqueSegura={paginaEstoqueSegura}
            totalPaginasEstoque={totalPaginasEstoque}
            pageSize={ESTOQUE_PAGE_SIZE}
            setPaginaEstoque={setPaginaEstoque}
            onExportCsv={exportarInventarioCsv}
            onChangeTab={setActiveTab}
            onQuickUpdateItem={handleQuickUpdateItem}
            onConfigurarOferta={(item) => {
              setOfertaEstoqueId(item.id);
              setOfertaPrecoPromo(
                String(item.precoPromocional ?? Number((item.precoVenda * 0.8).toFixed(2))),
              );
              setActiveTab('criar-oferta');
            }}
          />
        )}

        {activeTab === 'ofertas' && (
          <LojistaOfertasTab
            dashboard={dashboard}
            ofertasAtivasList={ofertasAtivasList}
            ofertasExpirandoEmBreve={ofertasExpirandoEmBreve}
            filtroOfertasTab={filtroOfertasTab}
            setFiltroOfertasTab={setFiltroOfertasTab}
            buscaOfertas={buscaOfertas}
            setBuscaOfertas={setBuscaOfertas}
            onChangeTab={setActiveTab}
            onEditOferta={(oferta, precoPromo) => {
              setOfertaEstoqueId(oferta.id);
              setOfertaPrecoPromo(String(precoPromo));
              setActiveTab('criar-oferta');
            }}
            onEncerrarOferta={(oferta) =>
              handleQuickUpdateItem(oferta, oferta.quantidadeEstoque, oferta.precoVenda, false, null)
            }
          />
        )}

        {activeTab === 'criar-oferta' && (
          <LojistaCriarOfertaTab
            loja={loja}
            estoque={estoque}
            itemSelecionadoOferta={itemSelecionadoOferta}
            ofertaEstoqueId={ofertaEstoqueId}
            setOfertaEstoqueId={setOfertaEstoqueId}
            ofertaBuscaProduto={ofertaBuscaProduto}
            setOfertaBuscaProduto={setOfertaBuscaProduto}
            ofertaDescontoPct={ofertaDescontoPct}
            onDescontoChange={handleOfertaDescontoChange}
            ofertaPrecoPromo={ofertaPrecoPromo}
            setOfertaPrecoPromo={setOfertaPrecoPromo}
            onPrecoChange={handleOfertaPrecoChange}
            ofertaDataInicio={ofertaDataInicio}
            setOfertaDataInicio={setOfertaDataInicio}
            ofertaDataFim={ofertaDataFim}
            setOfertaDataFim={setOfertaDataFim}
            ofertaDestaqueMapa={ofertaDestaqueMapa}
            setOfertaDestaqueMapa={setOfertaDestaqueMapa}
            ofertaSaving={ofertaSaving}
            onSubmit={handlePublicarOferta}
            onChangeTab={setActiveTab}
          />
        )}

        {activeTab === 'mais-procurados' && (
          <LojistaMaisProcuradosTab
            raioProcurados={raioProcurados}
            setRaioProcurados={setRaioProcurados}
            periodoProcurados={periodoProcurados}
            setPeriodoProcurados={setPeriodoProcurados}
            totalBuscasRegiao={totalBuscasRegiao}
            crescimentoMedioRegiao={crescimentoMedioRegiao}
            motoMaisProcurada={motoMaisProcurada}
            horarioPicoCalculado={horarioPicoCalculado}
            maisProcuradosNormalizados={maisProcuradosNormalizados}
            maisProcuradosFiltrados={maisProcuradosFiltrados}
            filtroProcuradosTab={filtroProcuradosTab}
            setFiltroProcuradosTab={setFiltroProcuradosTab}
            buscaProcurados={buscaProcurados}
            setBuscaProcurados={setBuscaProcurados}
            onChangeTab={setActiveTab}
            onPrefillNovoProduto={(nomePeca) => {
              setNpNomePeca(nomePeca);
              setActiveTab('novo-produto');
            }}
          />
        )}

        {activeTab === 'perfil' && (
          <LojistaPerfilTab
            loja={loja}
            user={user}
            editandoPerfil={editandoPerfil}
            setEditandoPerfil={setEditandoPerfil}
            pfNomeFantasia={pfNomeFantasia}
            setPfNomeFantasia={setPfNomeFantasia}
            pfFotoPerfilUrl={pfFotoPerfilUrl}
            setPfFotoPerfilUrl={setPfFotoPerfilUrl}
            pfTelefone={pfTelefone}
            setPfTelefone={setPfTelefone}
            pfEmailContato={pfEmailContato}
            setPfEmailContato={setPfEmailContato}
            pfEndereco={pfEndereco}
            setPfEndereco={setPfEndereco}
            pfHorarios={pfHorarios}
            setPfHorarios={setPfHorarios}
            pfFotos={pfFotos}
            setPfFotos={setPfFotos}
            pfSaving={pfSaving}
            statusLojaAtual={statusLojaAtual}
            onFotoFileChange={handleFotoPerfilFileChange}
            onSubmit={handleSalvarPerfil}
          />
        )}
      </div>
    </div>
  );
}
