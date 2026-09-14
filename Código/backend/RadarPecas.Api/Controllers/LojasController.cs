using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RadarPecas.Application.DTOs.Avaliacoes;
using RadarPecas.Application.DTOs.Lojas;
using RadarPecas.Application.Interfaces;

namespace RadarPecas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LojasController : ControllerBase
{
    private readonly ILojaService _lojaService;
    private readonly IEstoqueService _estoqueService;
    private readonly IAvaliacaoService _avaliacaoService;

    public LojasController(
        ILojaService lojaService,
        IEstoqueService estoqueService,
        IAvaliacaoService avaliacaoService)
    {
        _lojaService = lojaService;
        _estoqueService = estoqueService;
        _avaliacaoService = avaliacaoService;
    }

    private Guid GetUserId()
    {
        var idStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(idStr, out var id) ? id : Guid.Empty;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Listar(
        [FromQuery] decimal? userLat,
        [FromQuery] decimal? userLon,
        [FromQuery] decimal? raioKm)
    {
        var result = await _lojaService.ListarLojasAsync(userLat, userLon, raioKm);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObterPorId(
        Guid id,
        [FromQuery] decimal? userLat,
        [FromQuery] decimal? userLon)
    {
        var result = await _lojaService.ObterLojaPorIdAsync(id, userLat, userLon);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    [HttpGet("minha-loja")]
    [Authorize(Roles = "LOJISTA")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObterMinhaLoja()
    {
        var userId = GetUserId();
        var result = await _lojaService.ObterLojaPorUsuarioIdAsync(userId);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "LOJISTA")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CriarLoja([FromBody] CreateLojaRequest request)
    {
        var userId = GetUserId();
        var result = await _lojaService.CriarLojaAsync(userId, request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return CreatedAtAction(nameof(ObterPorId), new { id = result.Data!.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "LOJISTA")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AtualizarLoja(Guid id, [FromBody] UpdateLojaRequest request)
    {
        var result = await _lojaService.AtualizarLojaAsync(id, request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpGet("{id:guid}/estoque")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ListarEstoque(
        Guid id,
        [FromQuery] string? busca,
        [FromQuery] bool? apenasPromocao,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _estoqueService.ListarEstoqueLojaAsync(id, busca, apenasPromocao, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id:guid}/avaliacoes")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ObterAvaliacoes(Guid id)
    {
        var result = await _avaliacaoService.ObterAvaliacoesLojaAsync(id);
        return Ok(result);
    }

    [HttpPost("{id:guid}/avaliacoes")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AvaliarLoja(Guid id, [FromBody] CriarAvaliacaoRequest request)
    {
        var userId = GetUserId();
        var result = await _avaliacaoService.AvaliarLojaAsync(userId, id, request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpGet("{id:guid}/dashboard")]
    [Authorize(Roles = "LOJISTA")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObterDashboard(Guid id)
    {
        var result = await _lojaService.ObterDashboardLojistaAsync(id);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }
}
