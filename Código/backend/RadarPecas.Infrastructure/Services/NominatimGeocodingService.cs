using System.Globalization;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using RadarPecas.Application.Interfaces;

namespace RadarPecas.Infrastructure.Services;

public class NominatimGeocodingService : INominatimGeocodingService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<NominatimGeocodingService> _logger;

    public NominatimGeocodingService(HttpClient httpClient, ILogger<NominatimGeocodingService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;

        if (!_httpClient.DefaultRequestHeaders.Contains("User-Agent"))
        {
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "RadarPecas-Backend/1.0 (contato@radarpecas.ufs.br)");
        }
    }

    public async Task<(decimal Latitude, decimal Longitude)?> GeocodeAddressAsync(string address, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(address))
        {
            return null;
        }

        try
        {
            var url = $"https://nominatim.openstreetmap.org/search?q={Uri.EscapeDataString(address)}&format=json&limit=1";
            var response = await _httpClient.GetAsync(url, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Geocodificação via Nominatim retornou status {StatusCode} para o endereço: {Address}", response.StatusCode, address);
                return null;
            }

            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            using var doc = JsonDocument.Parse(content);

            if (doc.RootElement.ValueKind == JsonValueKind.Array && doc.RootElement.GetArrayLength() > 0)
            {
                var first = doc.RootElement[0];
                if (first.TryGetProperty("lat", out var latProp) && first.TryGetProperty("lon", out var lonProp))
                {
                    var latStr = latProp.GetString();
                    var lonStr = lonProp.GetString();

                    if (decimal.TryParse(latStr, NumberStyles.Any, CultureInfo.InvariantCulture, out var lat) &&
                        decimal.TryParse(lonStr, NumberStyles.Any, CultureInfo.InvariantCulture, out var lon))
                    {
                        return (lat, lon);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Falha ao consultar serviço de geocodificação Nominatim para o endereço: {Address}", address);
        }

        return null;
    }
}
