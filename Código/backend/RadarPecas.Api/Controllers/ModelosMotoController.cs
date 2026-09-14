using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RadarPecas.Application.DTOs.Garagem;
using RadarPecas.Application.Interfaces;

namespace RadarPecas.Api.Controllers;

[ApiController]
[Route("api/modelos-moto")]
public class ModelosMotoController : ControllerBase
{
    private readonly IModeloMotoService _modeloMotoService;

    public ModelosMotoController(IModeloMotoService modeloMotoService)
    {
        _modeloMotoService = modeloMotoService;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Listar([FromQuery] string? marca, [FromQuery] string? busca)
    {
        var result = await _modeloMotoService.ListarModelosAsync(marca, busca);
        return Ok(result);
    }

    [HttpGet("marcas")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ListarMarcas()
    {
        var result = await _modeloMotoService.ListarMarcasAsync();
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObterPorId(int id)
    {
        var result = await _modeloMotoService.ObterPorIdAsync(id);
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
    public async Task<IActionResult> Criar([FromBody] CreateModeloMotoRequest request)
    {
        var result = await _modeloMotoService.CriarModeloAsync(request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return CreatedAtAction(nameof(ObterPorId), new { id = result.Data!.Id }, result);
    }
}
