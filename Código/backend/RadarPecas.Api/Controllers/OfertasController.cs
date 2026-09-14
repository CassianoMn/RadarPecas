using Microsoft.AspNetCore.Mvc;
using RadarPecas.Application.Interfaces;

namespace RadarPecas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OfertasController : ControllerBase
{
    private readonly IEstoqueService _estoqueService;
    private readonly IEstatisticaService _estatisticaService;

    public OfertasController(
        IEstoqueService estoqueService,
        IEstatisticaService estatisticaService)
    {
        _estoqueService = estoqueService;
        _estatisticaService = estatisticaService;
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObterDetalhes(
        Guid id,
        [FromQuery] decimal? userLat,
        [FromQuery] decimal? userLon)
    {
        var result = await _estoqueService.ObterDetalhesOfertaAsync(id, userLat, userLon);
        if (!result.Success)
        {
            return NotFound(result);
        }

        // Rastrear visualização automaticamente ao consultar detalhes
        _ = _estatisticaService.RegistrarVisualizacaoAsync(id);

        return Ok(result);
    }

    [HttpPost("{id:guid}/visualizacao")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> RegistrarVisualizacao(Guid id)
    {
        await _estatisticaService.RegistrarVisualizacaoAsync(id);
        return Ok(new { success = true });
    }

    [HttpPost("{id:guid}/clique")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> RegistrarClique(Guid id)
    {
        await _estatisticaService.RegistrarCliqueAsync(id);
        return Ok(new { success = true });
    }
}
