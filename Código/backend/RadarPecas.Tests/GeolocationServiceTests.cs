using RadarPecas.Application.Services;
using Xunit;

namespace RadarPecas.Tests;

public class GeolocationServiceTests
{
    private readonly GeolocationService _service;

    public GeolocationServiceTests()
    {
        _service = new GeolocationService();
    }

    [Fact]
    public void MesmasCoordenadas_DeveRetornarDistanciaZero()
    {
        var lat = -10.9167m;
        var lon = -37.0500m;

        var distancia = _service.CalcularDistanciaKm(lat, lon, lat, lon);

        Assert.Equal(0m, distancia);
    }

    [Fact]
    public void DistanciaAracajuSaoCristovao_DeveEstarEntre15e25Km()
    {
        // Centro de Aracaju
        var latAju = -10.9167m;
        var lonAju = -37.0500m;

        // Centro Histórico de São Cristóvão
        var latSC = -11.0144m;
        var lonSC = -37.2064m;

        var distancia = _service.CalcularDistanciaKm(latAju, lonAju, latSC, lonSC);

        // A distância linear (em linha reta) fica em torno de 20 km
        Assert.InRange(distancia, 18m, 22m);
    }

    [Fact]
    public void EstaDentroDoRaio_DeveRetornarTrueQuandoMenorOuIgualAoRaio()
    {
        var lat1 = -10.9167m;
        var lon1 = -37.0500m;
        var lat2 = -11.0144m;
        var lon2 = -37.2064m;

        var dentroRaio30Km = _service.EstaDentroDoRaio(lat1, lon1, lat2, lon2, 30m);
        var dentroRaio10Km = _service.EstaDentroDoRaio(lat1, lon1, lat2, lon2, 10m);

        Assert.True(dentroRaio30Km);
        Assert.False(dentroRaio10Km);
    }
}
