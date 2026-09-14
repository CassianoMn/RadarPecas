namespace RadarPecas.Application.DTOs.Garagem;

public class ModeloMotoResponse
{
    public int Id { get; set; }
    public string Marca { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public int? AnoInicio { get; set; }
    public int? AnoFim { get; set; }
    public string NomeExibicao => AnoInicio.HasValue && AnoFim.HasValue 
        ? $"{Marca} {Modelo} ({AnoInicio} - {AnoFim})" 
        : $"{Marca} {Modelo}";
}
