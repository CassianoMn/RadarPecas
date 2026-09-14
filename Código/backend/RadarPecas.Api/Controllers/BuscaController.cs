using Microsoft.AspNetCore.Mvc;
using RadarPecas.Application.DTOs.Busca;
using RadarPecas.Application.Interfaces;

namespace RadarPecas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BuscaController : ControllerBase
{
    private readonly IBuscaRecomendacaoService _buscaService;

    public BuscaController(IBuscaRecomendacaoService buscaService)
    {
        _buscaService = buscaService;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Buscar([FromQuery] BuscaFiltrosRequest filtros)
    {
        var result = await _buscaService.BuscarOfertasAsync(filtros);
        return Ok(result);
    }
}
