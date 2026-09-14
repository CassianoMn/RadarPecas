using RadarPecas.Application.DTOs.Garagem;

namespace RadarPecas.Application.DTOs.Pecas;

public class PecaDetalheResponse : PecaResponse
{
    public List<ModeloMotoResponse> Compatibilidades { get; set; } = new();
}
