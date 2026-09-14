using RadarPecas.Application.DTOs.Common;
using RadarPecas.Application.DTOs.Estoque;

namespace RadarPecas.Application.Interfaces;

public interface IEstoqueService
{
    Task<ApiResponse<PagedResult<EstoqueItemResponse>>> ListarEstoqueLojaAsync(Guid lojaId, string? busca = null, bool? apenasPromocao = null, int page = 1, int pageSize = 10, CancellationToken cancellationToken = default);
    Task<ApiResponse<EstoqueItemResponse>> ObterPorIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ApiResponse<OfertaDetalheResponse>> ObterDetalhesOfertaAsync(Guid estoqueId, decimal? userLat = null, decimal? userLon = null, CancellationToken cancellationToken = default);
    Task<ApiResponse<EstoqueItemResponse>> AdicionarEstoqueAsync(CreateEstoqueRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<EstoqueItemResponse>> AtualizarEstoqueAsync(Guid id, UpdateEstoqueRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<EstoqueItemResponse>> AtualizarPromocaoAsync(Guid id, AtualizarPromocaoRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<bool>> RemoverEstoqueAsync(Guid id, CancellationToken cancellationToken = default);
}
