using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RadarPecas.Application.DTOs.Estoque;
using RadarPecas.Application.Interfaces;

namespace RadarPecas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EstoqueController : ControllerBase
{
    private readonly IEstoqueService _estoqueService;

    public EstoqueController(IEstoqueService estoqueService)
    {
        _estoqueService = estoqueService;
    }

    private Guid GetUserId()
    {
        var idStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(idStr, out var id) ? id : Guid.Empty;
    }

    private static bool IsAcessoNegado(string message) =>
        message.StartsWith("Acesso negado", StringComparison.OrdinalIgnoreCase);

    private IActionResult FalhaEstoque<T>(RadarPecas.Application.DTOs.Common.ApiResponse<T> result)
    {
        if (IsAcessoNegado(result.Message)) return StatusCode(StatusCodes.Status403Forbidden, result);
        return BadRequest(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObterPorId(Guid id)
    {
        var result = await _estoqueService.ObterPorIdAsync(id);
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
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> AdicionarEstoque([FromBody] CreateEstoqueRequest request)
    {
        var result = await _estoqueService.AdicionarEstoqueAsync(request, GetUserId());
        if (!result.Success)
        {
            return FalhaEstoque(result);
        }
        return CreatedAtAction(nameof(ObterPorId), new { id = result.Data!.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "LOJISTA")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AtualizarEstoque(Guid id, [FromBody] UpdateEstoqueRequest request)
    {
        var result = await _estoqueService.AtualizarEstoqueAsync(id, request, GetUserId());
        if (!result.Success)
        {
            return FalhaEstoque(result);
        }
        return Ok(result);
    }

    [HttpPut("{id:guid}/promocao")]
    [Authorize(Roles = "LOJISTA")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AtualizarPromocao(Guid id, [FromBody] AtualizarPromocaoRequest request)
    {
        var result = await _estoqueService.AtualizarPromocaoAsync(id, request, GetUserId());
        if (!result.Success)
        {
            return FalhaEstoque(result);
        }
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "LOJISTA")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoverEstoque(Guid id)
    {
        var result = await _estoqueService.RemoverEstoqueAsync(id, GetUserId());
        if (!result.Success)
        {
            return FalhaEstoque(result);
        }
        return Ok(result);
    }
}
