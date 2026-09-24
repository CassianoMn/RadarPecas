using RadarPecas.Application.DTOs.Estoque;

namespace RadarPecas.Application.DTOs.Lojas;

public class DashboardLojistaResponse
{
    public Guid LojaId { get; set; }
    public string NomeLoja { get; set; } = string.Empty;
    public int TotalProdutosCadastrados { get; set; }
    public int TotalItensEstoqueBaixo { get; set; }
    public int TotalOfertasAtivas { get; set; }
    public int BuscasRadar24h { get; set; }
    public int TotalVisualizacoesOfertas { get; set; }
    public int TotalCliquesOfertas { get; set; }
    public double MediaAvaliacaoLoja { get; set; }
    public int TotalAvaliacoes { get; set; }
    public List<EstoqueItemResponse> ItensEstoqueCritico { get; set; } = new();
    public List<OfertaMaisAcessadaItem> OfertasMaisAcessadas { get; set; } = new();
    public List<ItemMaisProcuradoRegiao> MaisProcuradosRegiao { get; set; } = new();
}

public class OfertaMaisAcessadaItem
{
    public Guid EstoqueId { get; set; }
    public string NomePeca { get; set; } = string.Empty;
    public decimal Preco { get; set; }
    public int Visualizacoes { get; set; }
    public int Cliques { get; set; }
}

public class ItemMaisProcuradoRegiao
{
    public int PecaId { get; set; }
    public string NomePeca { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public string CompatibilidadeResumo { get; set; } = "Universal";
    public int TotalBuscas7d { get; set; }
    public int CrescimentoPercentual { get; set; }
    public int QuantidadeEstoqueLoja { get; set; }
    public Guid? EstoqueIdLoja { get; set; }
    public decimal? PrecoVendaLoja { get; set; }
}
