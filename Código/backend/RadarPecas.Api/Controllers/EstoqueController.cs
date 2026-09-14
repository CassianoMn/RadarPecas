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
    public async Task<IActionResult> AdicionarEstoque([FromBody] CreateEstoqueRequest request)
    {
        var result = await _estoqueService.AdicionarEstoqueAsync(request);
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
    public async Task<IActionResult> AtualizarEstoque(Guid id, [FromBody] UpdateEstoqueRequest request)
    {
        var result = await _estoqueService.AtualizarEstoqueAsync(id, request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPut("{id:guid}/promocao")]
    [Authorize(Roles = "LOJISTA")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AtualizarPromocao(Guid id, [FromBody] AtualizarPromocaoRequest request)
    {
        var result = await _estoqueService.AtualizarPromocaoAsync(id, request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "LOJISTA")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoverEstoque(Guid id)
    {
        var result = await _estoqueService.RemoverEstoqueAsync(id);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }
}
