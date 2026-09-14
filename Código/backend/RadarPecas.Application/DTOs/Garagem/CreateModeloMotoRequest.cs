namespace RadarPecas.Application.DTOs.Garagem;

public class CreateModeloMotoRequest
{
    public string Marca { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public int? AnoInicio { get; set; }
    public int? AnoFim { get; set; }
}
