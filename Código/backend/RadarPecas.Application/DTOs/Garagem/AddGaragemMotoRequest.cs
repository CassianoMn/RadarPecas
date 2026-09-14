namespace RadarPecas.Application.DTOs.Garagem;

public class AddGaragemMotoRequest
{
    public int ModeloMotoId { get; set; }
    public int AnoFabricacao { get; set; }
    public string? Apelido { get; set; }
    public string? FotoMotoUrl { get; set; }
}
