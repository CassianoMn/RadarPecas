namespace RadarPecas.Application.DTOs.Lojas;

public class LojaResponse
{
    public Guid Id { get; set; }
    public Guid UsuarioId { get; set; }
    public string NomeFantasia { get; set; } = string.Empty;
    public string? Cnpj { get; set; }
    public string EnderecoCompleto { get; set; } = string.Empty;
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public string? TelefoneContato { get; set; }
    public string? EmailContato { get; set; }
    public string? HorariosFuncionamento { get; set; }
    public string? FotoPerfilUrl { get; set; }
    public string[]? GaleriaFotosUrls { get; set; }
    public bool Ativa { get; set; }
    public double MediaAvaliacao { get; set; }
    public int TotalAvaliacoes { get; set; }
    public decimal? DistanciaKm { get; set; }
}
