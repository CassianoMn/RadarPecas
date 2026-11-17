using RadarPecas.Application.Interfaces;

namespace RadarPecas.Application.Services;

public class GeolocationService : IGeolocationService
{
    private const double EarthRadiusKm = 6371.0;

    public decimal CalcularDistanciaKm(decimal lat1, decimal lon1, decimal lat2, decimal lon2)
    {
        if (lat1 == lat2 && lon1 == lon2)
        {
            return 0m;
        }

        var dLat = ToRadians((double)(lat2 - lat1));
        var dLon = ToRadians((double)(lon2 - lon1));

        var rLat1 = ToRadians((double)lat1);
        var rLat2 = ToRadians((double)lat2);

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(rLat1) * Math.Cos(rLat2) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        var distance = EarthRadiusKm * c;

        return Math.Round((decimal)distance, 2);
    }

    public bool EstaDentroDoRaio(decimal lat1, decimal lon1, decimal lat2, decimal lon2, decimal raioKm)
    {
        if (raioKm <= 0) return true;
        var distancia = CalcularDistanciaKm(lat1, lon1, lat2, lon2);
        return distancia <= raioKm;
    }

    public (decimal MinLat, decimal MaxLat, decimal MinLon, decimal MaxLon) CalcularBoundingBox(decimal lat, decimal lon, decimal raioKm)
    {
        if (raioKm <= 0)
        {
            return (-90m, 90m, -180m, 180m);
        }

        // Margem de ~111.045 km por grau de latitude com pequena folga numérica
        var deltaLat = (double)raioKm / 111.0;
        var cosLat = Math.Max(0.01, Math.Abs(Math.Cos(ToRadians((double)lat))));
        var deltaLon = deltaLat / cosLat;

        var minLat = Math.Clamp(lat - (decimal)deltaLat, -90m, 90m);
        var maxLat = Math.Clamp(lat + (decimal)deltaLat, -90m, 90m);
        var minLon = Math.Clamp(lon - (decimal)deltaLon, -180m, 180m);
        var maxLon = Math.Clamp(lon + (decimal)deltaLon, -180m, 180m);

        return (minLat, maxLat, minLon, maxLon);
    }

    private static double ToRadians(double degrees)
    {
        return degrees * (Math.PI / 180.0);
    }
}
