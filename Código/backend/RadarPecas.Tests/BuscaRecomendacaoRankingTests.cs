using Moq;
using RadarPecas.Application.Interfaces;
using RadarPecas.Application.Services;
using Xunit;

namespace RadarPecas.Tests;

public class BuscaRecomendacaoRankingTests
{
    private readonly BuscaRecomendacaoService _service;

    public BuscaRecomendacaoRankingTests()
    {
        var mockContext = new Mock<IApplicationDbContext>();
        var mockGeo = new Mock<IGeolocationService>();
        var mockComp = new Mock<ICompatibilidadeService>();

        _service = new BuscaRecomendacaoService(mockContext.Object, mockGeo.Object, mockComp.Object);
    }

    [Fact]
    public void PrecoMaisBaixo_DeveReceberMaiorPontuacao()
    {
        // Cenário: duas ofertas com mesma distância (10km de 20km max), mesma avaliação (4.0) e sem promoção
        var scoreBarato = _service.CalcularScoreRecomendacao(
            preco: 50.0m,
            menorPreco: 50.0m,
            maiorPreco: 100.0m,
            distanciaKm: 10.0m,
            maiorDistancia: 20.0m,
            mediaAvaliacaoLoja: 4.0,
            promocaoAtiva: false);

        var scoreCaro = _service.CalcularScoreRecomendacao(
            preco: 100.0m,
            menorPreco: 50.0m,
            maiorPreco: 100.0m,
            distanciaKm: 10.0m,
            maiorDistancia: 20.0m,
            mediaAvaliacaoLoja: 4.0,
            promocaoAtiva: false);

        Assert.True(scoreBarato > scoreCaro, "Oferta com preço menor deve ter score maior");
    }

    [Fact]
    public void MenorDistancia_DeveReceberMaiorPontuacao()
    {
        // Cenário: mesmo preço (80.0), mesma avaliação (4.5), sem promoção
        var scorePerto = _service.CalcularScoreRecomendacao(
            preco: 80.0m,
            menorPreco: 50.0m,
            maiorPreco: 100.0m,
            distanciaKm: 2.0m,
            maiorDistancia: 20.0m,
            mediaAvaliacaoLoja: 4.5,
            promocaoAtiva: false);

        var scoreLonge = _service.CalcularScoreRecomendacao(
            preco: 80.0m,
            menorPreco: 50.0m,
            maiorPreco: 100.0m,
            distanciaKm: 18.0m,
            maiorDistancia: 20.0m,
            mediaAvaliacaoLoja: 4.5,
            promocaoAtiva: false);

        Assert.True(scorePerto > scoreLonge, "Loja mais próxima deve ter score maior");
    }

    [Fact]
    public void PromocaoAtiva_DeveConcederBonusDeQuinzePorCento()
    {
        var scoreSemPromocao = _service.CalcularScoreRecomendacao(
            preco: 60.0m,
            menorPreco: 50.0m,
            maiorPreco: 100.0m,
            distanciaKm: 5.0m,
            maiorDistancia: 20.0m,
            mediaAvaliacaoLoja: 4.0,
            promocaoAtiva: false);

        var scoreComPromocao = _service.CalcularScoreRecomendacao(
            preco: 60.0m,
            menorPreco: 50.0m,
            maiorPreco: 100.0m,
            distanciaKm: 5.0m,
            maiorDistancia: 20.0m,
            mediaAvaliacaoLoja: 4.0,
            promocaoAtiva: true);

        Assert.True(scoreComPromocao > scoreSemPromocao);
        Assert.Equal(0.15, Math.Round(scoreComPromocao - scoreSemPromocao, 2));
    }

    [Fact]
    public void MelhorAvaliacao_DeveReceberMaiorPontuacao()
    {
        var scoreLoja5Estrelas = _service.CalcularScoreRecomendacao(
            preco: 70.0m,
            menorPreco: 50.0m,
            maiorPreco: 100.0m,
            distanciaKm: 5.0m,
            maiorDistancia: 20.0m,
            mediaAvaliacaoLoja: 5.0,
            promocaoAtiva: false);

        var scoreLoja2Estrelas = _service.CalcularScoreRecomendacao(
            preco: 70.0m,
            menorPreco: 50.0m,
            maiorPreco: 100.0m,
            distanciaKm: 5.0m,
            maiorDistancia: 20.0m,
            mediaAvaliacaoLoja: 2.0,
            promocaoAtiva: false);

        Assert.True(scoreLoja5Estrelas > scoreLoja2Estrelas, "Loja com 5 estrelas deve pontuar mais que 2 estrelas");
    }
}
