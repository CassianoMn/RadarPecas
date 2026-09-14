using RadarPecas.Application.DTOs.Estoque;

namespace RadarPecas.Application.DTOs.Lojas;

public class DashboardLojistaResponse
{
    public Guid LojaId { get; set; }
    public string NomeLoja { get; set; } = string.Empty;
    public int TotalProdutosCadastrados { get; set; }
    public int TotalItensEstoqueBaixo { get; set; }
    public int TotalVisualizacoesOfertas { get; set; }
    public int TotalCliquesOfertas { get; set; }
    public double MediaAvaliacaoLoja { get; set; }
    public int TotalAvaliacoes { get; set; }
    public List<EstoqueItemResponse> ItensEstoqueCritico { get; set; } = new();
    public List<OfertaMaisAcessadaItem> OfertasMaisAcessadas { get; set; } = new();
}

public class OfertaMaisAcessadaItem
{
    public Guid EstoqueId { get; set; }
    public string NomePeca { get; set; } = string.Empty;
    public decimal Preco { get; set; }
    public int Visualizacoes { get; set; }
    public int Cliques { get; set; }
}
