namespace RadarPecas.Application.DTOs.Geocoding;

public class LocalizacaoSugestaoResponse
{
    public string DisplayName { get; set; } = string.Empty;
    public string Titulo { get; set; } = string.Empty;
    public string? Subtitulo { get; set; }
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public string? Tipo { get; set; }
}
