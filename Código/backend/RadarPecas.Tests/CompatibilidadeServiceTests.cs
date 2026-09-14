using Moq;
using RadarPecas.Application.Interfaces;
using RadarPecas.Application.Services;
using Xunit;

namespace RadarPecas.Tests;

public class CompatibilidadeServiceTests
{
    private readonly CompatibilidadeService _service;

    public CompatibilidadeServiceTests()
    {
        var mockContext = new Mock<IApplicationDbContext>();
        _service = new CompatibilidadeService(mockContext.Object);
    }

    [Theory]
    [InlineData(2018, 2016, 2022, true)]  // Dentro da faixa
    [InlineData(2016, 2016, 2022, true)]  // No limite inicial
    [InlineData(2022, 2016, 2022, true)]  // No limite final
    [InlineData(2015, 2016, 2022, false)] // Antes do início
    [InlineData(2023, 2016, 2022, false)] // Depois do fim
    [InlineData(2020, 2016, null, true)]  // Sem limite final
    [InlineData(2010, null, 2015, true)]  // Sem limite inicial
    [InlineData(2020, null, null, true)]  // Sem limites
    public void ValidarAnoModelo_DeveRetornarResultadoEsperado(int anoFabricacao, int? anoInicio, int? anoFim, bool esperado)
    {
        // Act
        var resultado = _service.ValidarAnoModelo(anoFabricacao, anoInicio, anoFim);

        // Assert
        Assert.Equal(esperado, resultado);
    }
}
