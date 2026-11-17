using System.ComponentModel.DataAnnotations;

namespace RadarPecas.Application.DTOs.Busca;

public class BuscaFiltrosRequest
{
    public string? Termo { get; set; }
    public string? Categoria { get; set; }
    public int? ModeloMotoId { get; set; }
    public int? AnoFabricacao { get; set; }
    public Guid? GaragemVirtualId { get; set; }
    public bool ApenasEmEstoque { get; set; } = true;

    [Range(typeof(decimal), "0", "9999999", ErrorMessage = "O preço máximo deve ser não-negativo.")]
    public decimal? PrecoMaximo { get; set; }

    public string? Marca { get; set; }

    [Range(-90, 90, ErrorMessage = "Latitude inválida.")]
    public decimal? UserLatitude { get; set; }

    [Range(-180, 180, ErrorMessage = "Longitude inválida.")]
    public decimal? UserLongitude { get; set; }

    [Range(typeof(decimal), "0.1", "5000", ErrorMessage = "O raio de busca deve ser maior que zero.")]
    public decimal? RaioKm { get; set; }

    public bool ApenasPromocoes { get; set; } = false;
    public string Ordenacao { get; set; } = "recomendados"; // "recomendados", "menor_preco", "maior_preco", "menor_distancia", "melhor_avaliacao"

    [Range(1, int.MaxValue)]
    public int Page { get; set; } = 1;

    [Range(1, 100)]
    public int PageSize { get; set; } = 10;
}
