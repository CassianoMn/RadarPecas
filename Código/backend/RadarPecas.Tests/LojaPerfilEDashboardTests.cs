using RadarPecas.Application.DTOs.Lojas;
using RadarPecas.Domain.Entities;
using Xunit;

namespace RadarPecas.Tests;

public class LojaPerfilEDashboardTests
{
    [Fact]
    public void UpdateLojaRequest_DevePermitirDefinirEExcluirFotoPerfilUrl()
    {
        var requestComFoto = new UpdateLojaRequest
        {
            NomeFantasia = "Oficina Teste",
            EnderecoCompleto = "Rua Teste, 123",
            FotoPerfilUrl = "https://images.unsplash.com/photo-1558981403-c5f9899a28bc"
        };

        Assert.NotNull(requestComFoto.FotoPerfilUrl);
        Assert.NotEmpty(requestComFoto.FotoPerfilUrl);

        // Exclusão de foto
        var requestExcluirFoto = new UpdateLojaRequest
        {
            NomeFantasia = "Oficina Teste",
            EnderecoCompleto = "Rua Teste, 123",
            FotoPerfilUrl = null
        };

        Assert.Null(requestExcluirFoto.FotoPerfilUrl);
    }

    [Fact]
    public void HorariosFuncionamento_SerializacaoString_NaoDeveInjetarChaveResumo()
    {
        var rawHorario = "Segunda a Sexta: 08:00 às 18:00 | Sábado: 08:00 às 13:00";
        var serializado = System.Text.Json.JsonSerializer.Serialize(rawHorario);

        Assert.DoesNotContain("\"resumo\":", serializado);
        Assert.DoesNotContain("resumo", serializado, StringComparison.OrdinalIgnoreCase);
        var deserializado = System.Text.Json.JsonSerializer.Deserialize<string>(serializado);
        Assert.Equal(rawHorario, deserializado);
    }

    [Fact]
    public void Loja_Entidade_DevePermitirArmazenarEAtualizarFotoPerfil()
    {
        var loja = new Loja
        {
            NomeFantasia = "Loja das Peças",
            EnderecoCompleto = "Av. Brasil, 500",
            FotoPerfilUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        };

        Assert.NotNull(loja.FotoPerfilUrl);
        Assert.StartsWith("data:image", loja.FotoPerfilUrl);

        // Exclusão da foto
        loja.FotoPerfilUrl = null;
        Assert.Null(loja.FotoPerfilUrl);
    }

    [Fact]
    public void EstatisticaOferta_DataRegistro_DeveCalcularMetricasDeVisualizacoesECliquesReais()
    {
        var hoje = DateOnly.FromDateTime(DateTime.UtcNow);
        var stats = new List<EstatisticaOferta>
        {
            new() { Visualizacoes = 25, Cliques = 8, DataRegistro = hoje },
            new() { Visualizacoes = 15, Cliques = 4, DataRegistro = hoje.AddDays(-1) },
            new() { Visualizacoes = 50, Cliques = 12, DataRegistro = hoje.AddDays(-10) }
        };

        var totalViews = stats.Sum(s => s.Visualizacoes);
        var totalCliques = stats.Sum(s => s.Cliques);

        var limite24h = hoje.AddDays(-1);
        var stats24h = stats.Where(s => s.DataRegistro >= limite24h).ToList();
        var buscas24h = stats24h.Sum(s => s.Visualizacoes + s.Cliques);

        Assert.Equal(90, totalViews);
        Assert.Equal(24, totalCliques);
        Assert.Equal(52, buscas24h); // (25+8) + (15+4)
    }
}
