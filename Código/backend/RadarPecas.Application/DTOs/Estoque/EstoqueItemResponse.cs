namespace RadarPecas.Application.DTOs.Estoque;

public class EstoqueItemResponse
{
    public Guid Id { get; set; }
    public Guid LojaId { get; set; }
    public string NomeLoja { get; set; } = string.Empty;
    public int PecaId { get; set; }
    public string NomePeca { get; set; } = string.Empty;
    public string CategoriaPeca { get; set; } = string.Empty;
    public string? FotoPecaUrl { get; set; }
    public string? Sku { get; set; }
    public string? CodigoEan { get; set; }
    public int QuantidadeEstoque { get; set; }
    public int AlertaEstoqueMinimo { get; set; }
    public bool EstoqueBaixo => QuantidadeEstoque <= AlertaEstoqueMinimo;
    public decimal PrecoVenda { get; set; }
    public bool EmPromocao { get; set; }
    public decimal? PrecoPromocional { get; set; }
    public decimal PrecoEfetivo { get; set; }
    public DateOnly? DataInicioPromocao { get; set; }
    public DateOnly? DataFimPromocao { get; set; }
    public bool PromocaoAtiva { get; set; }
    public int Visualizacoes { get; set; }
    public int Cliques { get; set; }
    public string? DescricaoCompatibilidade { get; set; }
    public DateTime DataAtualizacao { get; set; }
}
