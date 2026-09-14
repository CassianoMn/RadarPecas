using RadarPecas.Application.DTOs.Common;
using RadarPecas.Application.DTOs.Garagem;

namespace RadarPecas.Application.Interfaces;

public interface IModeloMotoService
{
    Task<ApiResponse<List<ModeloMotoResponse>>> ListarModelosAsync(string? marca = null, string? busca = null, CancellationToken cancellationToken = default);
    Task<ApiResponse<ModeloMotoResponse>> ObterPorIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ApiResponse<ModeloMotoResponse>> CriarModeloAsync(CreateModeloMotoRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<List<string>>> ListarMarcasAsync(CancellationToken cancellationToken = default);
}
