using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RadarPecas.Application.DTOs.Garagem;
using RadarPecas.Application.Interfaces;

namespace RadarPecas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GaragemController : ControllerBase
{
    private readonly IGaragemService _garagemService;

    public GaragemController(IGaragemService garagemService)
    {
        _garagemService = garagemService;
    }

    private Guid GetUserId()
    {
        var idStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(idStr, out var id) ? id : Guid.Empty;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ListarMotos()
    {
        var userId = GetUserId();
        var result = await _garagemService.GetMotosDoUsuarioAsync(userId);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ObterMoto(Guid id)
    {
        var userId = GetUserId();
        var result = await _garagemService.GetMotoPorIdAsync(userId, id);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AdicionarMoto([FromBody] AddGaragemMotoRequest request)
    {
        var userId = GetUserId();
        var result = await _garagemService.AdicionarMotoAsync(userId, request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return CreatedAtAction(nameof(ObterMoto), new { id = result.Data!.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AtualizarMoto(Guid id, [FromBody] UpdateGaragemMotoRequest request)
    {
        var userId = GetUserId();
        var result = await _garagemService.AtualizarMotoAsync(userId, id, request);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoverMoto(Guid id)
    {
        var userId = GetUserId();
        var result = await _garagemService.RemoverMotoAsync(userId, id);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }
}
