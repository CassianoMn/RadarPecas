using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using RadarPecas.Application.DTOs.Auth;
using RadarPecas.Application.DTOs.Common;
using RadarPecas.Application.DTOs.Estoque;
using RadarPecas.Application.DTOs.Lojas;
using Xunit;

namespace RadarPecas.Tests;

public class ApiIntegracaoTests : IClassFixture<CustomWebApplicationFactory>
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly CustomWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public ApiIntegracaoTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    private async Task<string> ObterTokenAsync(string email, string senha)
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = email,
            Senha = senha
        });
        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadFromJsonAsync<ApiResponse<LoginResponse>>(JsonOptions);
        return body!.Data!.Token;
    }

    [Fact]
    public async Task HealthCheck_E_BuscaPublica_Retornam200()
    {
        var health = await _client.GetAsync("/api/health");
        Assert.Equal(HttpStatusCode.OK, health.StatusCode);

        var busca = await _client.GetAsync("/api/busca?termo=Pastilha");
        Assert.Equal(HttpStatusCode.OK, busca.StatusCode);

        var lojas = await _client.GetAsync("/api/lojas/paginadas");
        Assert.Equal(HttpStatusCode.OK, lojas.StatusCode);
    }

    [Fact]
    public async Task Login_ComCredenciaisInvalidas_Retorna401ComMensagemUtil()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new LoginRequest
        {
            Email = "moto@radarpecas.test",
            Senha = "SenhaErrada99"
        });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        var payload = await response.Content.ReadFromJsonAsync<ApiResponse<LoginResponse>>(JsonOptions);
        Assert.NotNull(payload);
        Assert.False(payload.Success);
        Assert.Contains("Credenciais inválidas", payload.Message);
    }

    [Fact]
    public async Task ObterOfertaInexistente_Retorna404()
    {
        var response = await _client.GetAsync($"/api/ofertas/{Guid.NewGuid()}");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task RegisterMotociclista_ComEmailDuplicado_Retorna422()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/register-motociclista", new RegisterMotociclistaRequest
        {
            Nome = "Duplicado",
            Email = "moto@radarpecas.test",
            Senha = "SenhaForte#2026"
        });

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task RegisterLojista_CriaUsuarioELojaAtomicamenteERetorna200()
    {
        var email = $"novolojista-{Guid.NewGuid():N}@radarpecas.test";
        var response = await _client.PostAsJsonAsync("/api/auth/register-lojista", new RegisterLojistaRequest
        {
            Nome = "Novo Lojista",
            NomeFantasia = "Nova Oficina Motos",
            EnderecoCompleto = "Av. Brasil, 500 - Itabaiana/SE",
            Latitude = -10.6850m,
            Longitude = -37.4252m,
            Email = email,
            Senha = "SenhaForte#2026"
        });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var payload = await response.Content.ReadFromJsonAsync<ApiResponse<LoginResponse>>(JsonOptions);
        Assert.True(payload!.Success);
        Assert.NotNull(payload.Data);
        Assert.NotNull(payload.Data.LojaId);

        using var authClient = _factory.CreateClient();
        authClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", payload.Data.Token);
        var minhaLoja = await authClient.GetAsync("/api/lojas/minha-loja");
        Assert.Equal(HttpStatusCode.OK, minhaLoja.StatusCode);
    }

    [Fact]
    public async Task RegisterLojista_ComCnpjInvalido_Retorna422()
    {
        var email = $"cnpjinvalido-{Guid.NewGuid():N}@radarpecas.test";
        var response = await _client.PostAsJsonAsync("/api/auth/register-lojista", new RegisterLojistaRequest
        {
            Nome = "Lojista Invalido",
            NomeFantasia = "Oficina CNPJ Ruim",
            Cnpj = "11.111.111/1111-11",
            EnderecoCompleto = "Av. Brasil, 500 - Itabaiana/SE",
            Latitude = -10.6850m,
            Longitude = -37.4252m,
            Email = email,
            Senha = "SenhaForte#2026"
        });

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task RotasAutenticadas_SemToken_Retornam401()
    {
        var garagem = await _client.GetAsync("/api/garagem");
        Assert.Equal(HttpStatusCode.Unauthorized, garagem.StatusCode);

        var me = await _client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.Unauthorized, me.StatusCode);
    }

    [Fact]
    public async Task Motociclista_TentandoRotaDeLojista_Retorna403()
    {
        var tokenMoto = await ObterTokenAsync("moto@radarpecas.test", "Moto#2026");
        using var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokenMoto);

        var dashboard = await client.GetAsync($"/api/lojas/{_factory.LojaAId}/dashboard");
        Assert.Equal(HttpStatusCode.Forbidden, dashboard.StatusCode);

        var postEstoque = await client.PostAsJsonAsync("/api/estoque", new CreateEstoqueRequest
        {
            LojaId = _factory.LojaAId,
            PecaId = _factory.PecaId,
            QuantidadeEstoque = 5,
            PrecoVenda = 50m
        });
        Assert.Equal(HttpStatusCode.Forbidden, postEstoque.StatusCode);
    }

    [Fact]
    public async Task LojistaA_NaoPodeAcessarOuAlterarRecursosDoLojistaB_IDOR_Retorna403()
    {
        var tokenA = await ObterTokenAsync("lojaa@radarpecas.test", "Loja#2026");
        using var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokenA);

        var dashboardOwn = await client.GetAsync($"/api/lojas/{_factory.LojaAId}/dashboard");
        Assert.Equal(HttpStatusCode.OK, dashboardOwn.StatusCode);

        var dashboardB = await client.GetAsync($"/api/lojas/{_factory.LojaBId}/dashboard");
        Assert.Equal(HttpStatusCode.Forbidden, dashboardB.StatusCode);

        var putLojaB = await client.PutAsJsonAsync($"/api/lojas/{_factory.LojaBId}", new UpdateLojaRequest
        {
            NomeFantasia = "Tentativa IDOR",
            EnderecoCompleto = "Av. Central, 100 - Itabaiana/SE"
        });
        Assert.Equal(HttpStatusCode.Forbidden, putLojaB.StatusCode);

        var putEstoqueB = await client.PutAsJsonAsync($"/api/estoque/{_factory.EstoqueLojaBId}", new UpdateEstoqueRequest
        {
            QuantidadeEstoque = 99,
            PrecoVenda = 10m
        });
        Assert.Equal(HttpStatusCode.Forbidden, putEstoqueB.StatusCode);

        var delEstoqueB = await client.DeleteAsync($"/api/estoque/{_factory.EstoqueLojaBId}");
        Assert.Equal(HttpStatusCode.Forbidden, delEstoqueB.StatusCode);
    }

    [Fact]
    public async Task RegistrarVisualizacaoEClique_EmOfertaValida_Retorna200()
    {
        var vis = await _client.PostAsync($"/api/ofertas/{_factory.EstoqueLojaAId}/visualizacao", null);
        Assert.Equal(HttpStatusCode.OK, vis.StatusCode);

        var clique = await _client.PostAsync($"/api/ofertas/{_factory.EstoqueLojaAId}/clique", null);
        Assert.Equal(HttpStatusCode.OK, clique.StatusCode);
    }
}
