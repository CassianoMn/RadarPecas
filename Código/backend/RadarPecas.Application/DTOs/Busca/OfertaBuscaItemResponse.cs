namespace RadarPecas.Application.DTOs.Busca;

public class OfertaBuscaItemResponse
{
    public Guid EstoqueId { get; set; }
    public int PecaId { get; set; }
    public string NomePeca { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public string? FotoPecaUrl { get; set; }
    public string? Sku { get; set; }
    public string? CodigoEan { get; set; }
    public string? Especificacoes { get; set; }

    // Loja
    public Guid LojaId { get; set; }
    public string NomeLoja { get; set; } = string.Empty;
    public string EnderecoCompleto { get; set; } = string.Empty;
    public string? TelefoneContato { get; set; }
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public double MediaAvaliacaoLoja { get; set; }
    public int TotalAvaliacoesLoja { get; set; }

    // Oferta
    public decimal PrecoVenda { get; set; }
    public bool EmPromocao { get; set; }
    public decimal? PrecoPromocional { get; set; }
    public decimal PrecoEfetivo { get; set; }
    public bool PromocaoAtiva { get; set; }
    public int QuantidadeEstoque { get; set; }

    // Inteligência e Geolocalização
    public decimal? DistanciaKm { get; set; }
    public bool Compativel { get; set; }
    public double ScoreRecomendacao { get; set; }
}
