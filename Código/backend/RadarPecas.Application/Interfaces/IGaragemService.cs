using RadarPecas.Application.DTOs.Common;
using RadarPecas.Application.DTOs.Garagem;

namespace RadarPecas.Application.Interfaces;

public interface IGaragemService
{
    Task<ApiResponse<List<GaragemItemResponse>>> GetMotosDoUsuarioAsync(Guid usuarioId, CancellationToken cancellationToken = default);
    Task<ApiResponse<GaragemItemResponse>> GetMotoPorIdAsync(Guid usuarioId, Guid garagemId, CancellationToken cancellationToken = default);
    Task<ApiResponse<GaragemItemResponse>> AdicionarMotoAsync(Guid usuarioId, AddGaragemMotoRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<GaragemItemResponse>> AtualizarMotoAsync(Guid usuarioId, Guid garagemId, UpdateGaragemMotoRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<bool>> RemoverMotoAsync(Guid usuarioId, Guid garagemId, CancellationToken cancellationToken = default);
}
