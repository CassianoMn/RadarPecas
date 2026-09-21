using Microsoft.AspNetCore.Mvc;
using RadarPecas.Application.DTOs.Common;
using RadarPecas.Application.DTOs.Geocoding;
using RadarPecas.Application.Interfaces;

namespace RadarPecas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GeocodingController : ControllerBase
{
    private readonly INominatimGeocodingService _geocodingService;

    public GeocodingController(INominatimGeocodingService geocodingService)
    {
        _geocodingService = geocodingService;
    }

    [HttpGet("sugestoes")]
    [ProducesResponseType(typeof(ApiResponse<List<LocalizacaoSugestaoResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> BuscarSugestoes(
        [FromQuery] string? query,
        [FromQuery] int limite = 15,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(query) || query.Trim().Length < 2)
        {
            return Ok(ApiResponse<List<LocalizacaoSugestaoResponse>>.Ok(new List<LocalizacaoSugestaoResponse>()));
        }

        var sugestoes = await _geocodingService.BuscarSugestoesAsync(query, limite, cancellationToken);
        return Ok(ApiResponse<List<LocalizacaoSugestaoResponse>>.Ok(sugestoes));
    }
}
