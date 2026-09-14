using RadarPecas.Application.DTOs.Common;
using RadarPecas.Application.DTOs.Lojas;

namespace RadarPecas.Application.Interfaces;

public interface ILojaService
{
    Task<ApiResponse<List<LojaResponse>>> ListarLojasAsync(decimal? userLat = null, decimal? userLon = null, decimal? raioKm = null, CancellationToken cancellationToken = default);
    Task<ApiResponse<LojaResponse>> ObterLojaPorIdAsync(Guid id, decimal? userLat = null, decimal? userLon = null, CancellationToken cancellationToken = default);
    Task<ApiResponse<LojaResponse>> ObterLojaPorUsuarioIdAsync(Guid usuarioId, CancellationToken cancellationToken = default);
    Task<ApiResponse<LojaResponse>> CriarLojaAsync(Guid usuarioId, CreateLojaRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<LojaResponse>> AtualizarLojaAsync(Guid id, UpdateLojaRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<DashboardLojistaResponse>> ObterDashboardLojistaAsync(Guid lojaId, CancellationToken cancellationToken = default);
}
