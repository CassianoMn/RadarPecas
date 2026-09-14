namespace RadarPecas.Application.Interfaces;

public interface IEstatisticaService
{
    Task RegistrarVisualizacaoAsync(Guid estoqueId, CancellationToken cancellationToken = default);
    Task RegistrarCliqueAsync(Guid estoqueId, CancellationToken cancellationToken = default);
}
