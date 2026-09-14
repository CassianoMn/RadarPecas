using RadarPecas.Application.DTOs.Common;

namespace RadarPecas.Application.DTOs.Busca;

public class BuscaResultadoResponse
{
    public PagedResult<OfertaBuscaItemResponse> Ofertas { get; set; } = new();
    public int? MotoFiltroModeloId { get; set; }
    public string? MotoFiltroDescricao { get; set; }
    public bool FiltroCompatibilidadeAtivo { get; set; }
    public decimal? RaioKmAplicado { get; set; }
    public string OrdenacaoAplicada { get; set; } = "recomendados";
}
