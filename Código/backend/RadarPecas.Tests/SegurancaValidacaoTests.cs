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

    [Theory]
    [InlineData("11.222.333/0001-81", true)]
    [InlineData("11222333000181", true)]
    [InlineData("11.222.333/0001-82", false)] // DV inválido
    [InlineData("11.111.111/1111-11", false)] // sequência repetida
    [InlineData("123", false)]
    [InlineData("", false)]
    [InlineData(null, false)]
    public void CnpjValido_ValidaDigitosVerificadores(string? cnpj, bool esperado)
    {
        Assert.Equal(esperado, SegurancaValidacao.CnpjValido(cnpj));
    }

    [Theory]
    [InlineData(-10.6850, -37.4252, true)]
    [InlineData(0, 0, false)]
    [InlineData(-91, -37, false)]
    [InlineData(-10, 181, false)]
    public void CoordenadasValidas_RejeitaZeroEOutOfBounds(double lat, double lon, bool esperado)
    {
        Assert.Equal(esperado, SegurancaValidacao.CoordenadasValidas((decimal)lat, (decimal)lon));
    }
}
