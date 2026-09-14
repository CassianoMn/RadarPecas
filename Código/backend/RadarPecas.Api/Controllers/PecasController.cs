using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RadarPecas.Application.DTOs.Pecas;
using RadarPecas.Application.Interfaces;

namespace RadarPecas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PecasController : ControllerBase
{
    private readonly IPecaService _pecaService;

    public PecasController(IPecaService pecaService)
    {
        _pecaService = pecaService;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Listar(
        [FromQuery] string? termo,
        [FromQuery] string? categoria,
        [FromQuery] int? modeloMotoId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _pecaService.ListarPecasAsync(termo, categoria, modeloMotoId, page, pageSize);
        return Ok(result);
    }

    [HttpGet("categorias")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ListarCategorias()
    {
        var result = await _pecaService.ListarCategoriasAsync();
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObterPorId(int id)
    {
        var result = await _pecaService.ObterPorIdAsync(id);
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
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Criar([FromBody] CreatePecaRequest request)
    {
        var result = await _pecaService.CriarPecaAsync(request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return CreatedAtAction(nameof(ObterPorId), new { id = result.Data!.Id }, result);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "LOJISTA")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Atualizar(int id, [FromBody] UpdatePecaRequest request)
    {
        var result = await _pecaService.AtualizarPecaAsync(id, request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "LOJISTA")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Deletar(int id)
    {
        var result = await _pecaService.DeletarPecaAsync(id);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPost("{id:int}/compatibilidades")]
    [Authorize(Roles = "LOJISTA")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> AdicionarCompatibilidade(int id, [FromBody] CompatibilidadeRequest request)
    {
        var result = await _pecaService.AdicionarCompatibilidadeAsync(id, request.ModeloMotoId);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpDelete("{id:int}/compatibilidades/{modeloMotoId:int}")]
    [Authorize(Roles = "LOJISTA")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> RemoverCompatibilidade(int id, int modeloMotoId)
    {
        var result = await _pecaService.RemoverCompatibilidadeAsync(id, modeloMotoId);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }
}
