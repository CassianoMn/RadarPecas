using RadarPecas.Application.DTOs.Busca;
using RadarPecas.Application.DTOs.Common;

namespace RadarPecas.Application.Interfaces;

public interface IBuscaRecomendacaoService
{
    Task<ApiResponse<BuscaResultadoResponse>> BuscarOfertasAsync(BuscaFiltrosRequest filtros, CancellationToken cancellationToken = default);
    double CalcularScoreRecomendacao(decimal preco, decimal menorPreco, decimal maiorPreco, decimal? distanciaKm, decimal? maiorDistancia, double mediaAvaliacaoLoja, bool promocaoAtiva);
}
