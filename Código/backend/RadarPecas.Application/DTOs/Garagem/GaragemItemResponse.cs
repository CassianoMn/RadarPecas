namespace RadarPecas.Application.DTOs.Garagem;

public class GaragemItemResponse
{
    public Guid Id { get; set; }
    public Guid UsuarioId { get; set; }
    public int ModeloMotoId { get; set; }
    public string Marca { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public int? AnoInicio { get; set; }
    public int? AnoFim { get; set; }
    public int AnoFabricacao { get; set; }
    public string? Apelido { get; set; }
    public string? FotoMotoUrl { get; set; }
}
