using RadarPecas.Application.Services;
using Xunit;

namespace RadarPecas.Tests;

public class SegurancaValidacaoTests
{
    [Theory]
    [InlineData("joao@exemplo.com", true)]
    [InlineData("loja.silva+contato@radarpecas.com.br", true)]
    [InlineData("sem-arroba", false)]
    [InlineData("sem@dominio", false)]
    [InlineData("", false)]
    [InlineData(null, false)]
    public void EmailValido_ClassificaCorretamente(string? email, bool esperado)
    {
        Assert.Equal(esperado, SegurancaValidacao.EmailValido(email));
    }

    [Theory]
    [InlineData("Moto#2026", true)]
    [InlineData("SenhaSegura123", true)]
    [InlineData("123456", false)]      // sem letra
    [InlineData("abcdefg", false)]     // sem dígito e curta
    [InlineData("abc123", false)]      // curta (6)
    [InlineData("abcdefgh", false)]    // sem dígito
    [InlineData("12345678", false)]    // sem letra
    [InlineData("", false)]
    [InlineData(null, false)]
    public void SenhaForte_ExigeTamanhoLetraEDigito(string? senha, bool esperado)
    {
        Assert.Equal(esperado, SegurancaValidacao.SenhaForte(senha));
    }
}
