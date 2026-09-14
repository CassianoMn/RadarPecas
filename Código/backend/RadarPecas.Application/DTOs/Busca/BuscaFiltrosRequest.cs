namespace RadarPecas.Application.DTOs.Busca;

public class BuscaFiltrosRequest
{
    public string? Termo { get; set; }
    public string? Categoria { get; set; }
    public int? ModeloMotoId { get; set; }
    public int? AnoFabricacao { get; set; }
    public Guid? GaragemVirtualId { get; set; }
    public bool ApenasEmEstoque { get; set; } = true;
    public decimal? UserLatitude { get; set; }
    public decimal? UserLongitude { get; set; }
    public decimal? RaioKm { get; set; }
    public bool ApenasPromocoes { get; set; } = false;
    public string Ordenacao { get; set; } = "recomendados"; // "recomendados", "menor_preco", "maior_preco", "menor_distancia", "melhor_avaliacao"
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
