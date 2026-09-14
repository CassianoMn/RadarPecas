using RadarPecas.Application.DTOs.Common;
using RadarPecas.Application.DTOs.Pecas;

namespace RadarPecas.Application.Interfaces;

public interface IPecaService
{
    Task<ApiResponse<PagedResult<PecaResponse>>> ListarPecasAsync(string? termo = null, string? categoria = null, int? modeloMotoId = null, int page = 1, int pageSize = 10, CancellationToken cancellationToken = default);
    Task<ApiResponse<PecaDetalheResponse>> ObterPorIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ApiResponse<PecaResponse>> CriarPecaAsync(CreatePecaRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<PecaResponse>> AtualizarPecaAsync(int id, UpdatePecaRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<bool>> DeletarPecaAsync(int id, CancellationToken cancellationToken = default);
    Task<ApiResponse<List<string>>> ListarCategoriasAsync(CancellationToken cancellationToken = default);
    Task<ApiResponse<bool>> AdicionarCompatibilidadeAsync(int pecaId, int modeloMotoId, CancellationToken cancellationToken = default);
    Task<ApiResponse<bool>> RemoverCompatibilidadeAsync(int pecaId, int modeloMotoId, CancellationToken cancellationToken = default);
}
