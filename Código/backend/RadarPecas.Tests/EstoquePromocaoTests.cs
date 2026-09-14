using RadarPecas.Domain.Entities;
using Xunit;

namespace RadarPecas.Tests;

public class EstoquePromocaoTests
{
    [Fact]
    public void PrecoEfetivo_SemPromocao_DeveRetornarPrecoVenda()
    {
        var estoque = new EstoqueLoja
        {
            PrecoVenda = 100.00m,
            EmPromocao = false,
            PrecoPromocional = 80.00m
        };

        Assert.Equal(100.00m, estoque.PrecoEfetivo);
        Assert.False(estoque.PromocaoAtiva);
    }

    [Fact]
    public void PrecoEfetivo_ComPromocaoVigente_DeveRetornarPrecoPromocional()
    {
        var hoje = DateOnly.FromDateTime(DateTime.UtcNow);
        var estoque = new EstoqueLoja
        {
            PrecoVenda = 100.00m,
            EmPromocao = true,
            PrecoPromocional = 79.90m,
            DataInicioPromocao = hoje.AddDays(-2),
            DataFimPromocao = hoje.AddDays(5)
        };

        Assert.Equal(79.90m, estoque.PrecoEfetivo);
        Assert.True(estoque.PromocaoAtiva);
    }

    [Fact]
    public void PrecoEfetivo_ComPromocaoExpirada_DeveRetornarPrecoVendaPadrao()
    {
        var hoje = DateOnly.FromDateTime(DateTime.UtcNow);
        var estoque = new EstoqueLoja
        {
            PrecoVenda = 100.00m,
            EmPromocao = true,
            PrecoPromocional = 79.90m,
            DataInicioPromocao = hoje.AddDays(-10),
            DataFimPromocao = hoje.AddDays(-1)
        };

        Assert.Equal(100.00m, estoque.PrecoEfetivo);
        Assert.False(estoque.PromocaoAtiva);
    }
}
