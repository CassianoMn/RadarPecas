using RadarPecas.Application.DTOs.Avaliacoes;
using RadarPecas.Application.DTOs.Common;

namespace RadarPecas.Application.Interfaces;

public interface IAvaliacaoService
{
    Task<ApiResponse<AvaliacoesResumoResponse>> ObterAvaliacoesLojaAsync(Guid lojaId, CancellationToken cancellationToken = default);
    Task<ApiResponse<AvaliacaoResponse>> AvaliarLojaAsync(Guid usuarioId, Guid lojaId, CriarAvaliacaoRequest request, CancellationToken cancellationToken = default);
}
