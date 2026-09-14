namespace RadarPecas.Application.Interfaces;

public interface INominatimGeocodingService
{
    Task<(decimal Latitude, decimal Longitude)?> GeocodeAddressAsync(string address, CancellationToken cancellationToken = default);
}
