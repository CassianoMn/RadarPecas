namespace RadarPecas.Application.Interfaces;

public interface ICompatibilidadeService
{
    Task<bool> IsPecaCompativelComModeloAsync(int pecaId, int modeloMotoId, int? anoFabricacao = null, CancellationToken cancellationToken = default);
    Task<List<int>> ObterIdsPecasCompativeisAsync(int modeloMotoId, int? anoFabricacao = null, CancellationToken cancellationToken = default);
    bool ValidarAnoModelo(int anoFabricacao, int? anoInicio, int? anoFim);
}
