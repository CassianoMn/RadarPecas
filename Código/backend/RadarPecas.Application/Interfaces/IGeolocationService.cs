namespace RadarPecas.Application.Interfaces;

public interface IGeolocationService
{
    decimal CalcularDistanciaKm(decimal lat1, decimal lon1, decimal lat2, decimal lon2);
    bool EstaDentroDoRaio(decimal lat1, decimal lon1, decimal lat2, decimal lon2, decimal raioKm);
}
