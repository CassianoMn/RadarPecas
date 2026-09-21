using RadarPecas.Application.DTOs.Geocoding;

namespace RadarPecas.Application.Interfaces;

public interface INominatimGeocodingService
{
    Task<(decimal Latitude, decimal Longitude)?> GeocodeAddressAsync(string address, CancellationToken cancellationToken = default);
    Task<List<LocalizacaoSugestaoResponse>> BuscarSugestoesAsync(string query, int limite = 15, CancellationToken cancellationToken = default);
}
