using Microsoft.EntityFrameworkCore;
using Moq;
using RadarPecas.Application.DTOs.Auth;
using RadarPecas.Application.DTOs.Busca;
using RadarPecas.Application.Interfaces;
using RadarPecas.Application.Services;
using RadarPecas.Domain.Entities;
using RadarPecas.Domain.Enums;
using RadarPecas.Infrastructure.Data;
using RadarPecas.Infrastructure.Services;
using Xunit;

namespace RadarPecas.Tests;

public class BuscaELojasIntegracaoTests
{
    private static RadarPecasDbContext CriarContextoInMemory()
    {
        var options = new DbContextOptionsBuilder<RadarPecasDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new RadarPecasDbContext(options);
    }

    private static async Task PopularCenarioAsync(RadarPecasDbContext ctx)
    {
        var usuarioLojista1 = new Usuario
        {
            Id = Guid.NewGuid(),
            Nome = "Lojista Itabaiana",
            Email = "ita@teste.com",
            SenhaHash = "hash",
            TipoUsuario = TipoUsuario.LOJISTA
        };
        var usuarioLojista2 = new Usuario
        {
            Id = Guid.NewGuid(),
            Nome = "Lojista Aracaju",
            Email = "aju@teste.com",
            SenhaHash = "hash",
            TipoUsuario = TipoUsuario.LOJISTA
        };
        ctx.Usuarios.AddRange(usuarioLojista1, usuarioLojista2);

        // Itabaiana: -10.6850, -37.4252
        var lojaPerto = new Loja
        {
            Id = Guid.NewGuid(),
            UsuarioId = usuarioLojista1.Id,
            NomeFantasia = "Itabaiana Motos",
            EnderecoCompleto = "Av. Ivo de Carvalho, 100 - Itabaiana/SE",
            Latitude = -10.6850m,
            Longitude = -37.4252m,
            Ativa = true
        };
        // Aracaju (~50km de Itabaiana): -10.9167, -37.0500
        var lojaLonge = new Loja
        {
            Id = Guid.NewGuid(),
            UsuarioId = usuarioLojista2.Id,
            NomeFantasia = "Aracaju Peças",
            EnderecoCompleto = "Av. Barão de Maruim, 500 - Aracaju/SE",
            Latitude = -10.9167m,
            Longitude = -37.0500m,
            Ativa = true
        };
        ctx.Lojas.AddRange(lojaPerto, lojaLonge);

        var pecaPastilha = new Peca
        {
            Id = 1,
            Nome = "Pastilha de Freio Dianteira Cobreq",
            Categoria = "Freios",
            Sku = "PAST-COBREQ-1",
            Descricao = "Pastilha orgânica Cobreq"
        };
        var pecaPneu = new Peca
        {
            Id = 2,
            Nome = "Pneu Traseiro Pirelli City Dragon",
            Categoria = "Pneus",
            Sku = "PNEU-PIRELLI-1",
            Descricao = "Pneu urbano Pirelli"
        };
        ctx.Pecas.AddRange(pecaPastilha, pecaPneu);

        var est1 = new EstoqueLoja
        {
            Id = Guid.NewGuid(),
            LojaId = lojaPerto.Id,
            PecaId = pecaPastilha.Id,
            QuantidadeEstoque = 10,
            AlertaEstoqueMinimo = 3,
            PrecoVenda = 50m,
            EmPromocao = true,
            PrecoPromocional = 40m
        };
        var est2 = new EstoqueLoja
        {
            Id = Guid.NewGuid(),
            LojaId = lojaPerto.Id,
            PecaId = pecaPneu.Id,
            QuantidadeEstoque = 2,
            AlertaEstoqueMinimo = 5,
            PrecoVenda = 280m,
            EmPromocao = false
        };
        var est3 = new EstoqueLoja
        {
            Id = Guid.NewGuid(),
            LojaId = lojaLonge.Id,
            PecaId = pecaPastilha.Id,
            QuantidadeEstoque = 8,
            AlertaEstoqueMinimo = 2,
            PrecoVenda = 45m,
            EmPromocao = false
        };
        ctx.EstoqueLojas.AddRange(est1, est2, est3);

        ctx.EstatisticasOferta.Add(new EstatisticaOferta
        {
            Id = Guid.NewGuid(),
            EstoqueLojaId = est1.Id,
            Visualizacoes = 12,
            Cliques = 4,
            DataRegistro = DateOnly.FromDateTime(DateTime.UtcNow)
        });

        await ctx.SaveChangesAsync();
    }

    [Fact]
    public async Task BuscarOfertasAsync_DeveFiltrarPorTermoMarcaPrecoERaioNoBanco()
    {
        await using var ctx = CriarContextoInMemory();
        await PopularCenarioAsync(ctx);

        var geo = new GeolocationService();
        var comp = new CompatibilidadeService(ctx);
        var service = new BuscaRecomendacaoService(ctx, geo, comp);

        var res = await service.BuscarOfertasAsync(new BuscaFiltrosRequest
        {
            Termo = "Pastilha",
            Marca = "Cobreq",
            PrecoMaximo = 42m,
            UserLatitude = -10.6850m,
            UserLongitude = -37.4252m,
            RaioKm = 15m,
            Ordenacao = "recomendados",
            Page = 1,
            PageSize = 10
        });

        Assert.True(res.Success);
        Assert.NotNull(res.Data);
        Assert.Equal(1, res.Data!.Ofertas.TotalCount);
        var item = Assert.Single(res.Data.Ofertas.Items);
        Assert.Equal("Itabaiana Motos", item.NomeLoja);
        Assert.Equal(40m, item.PrecoEfetivo);
        Assert.True(item.PromocaoAtiva);
    }

    [Fact]
    public async Task ListarLojasPaginadoAsync_DevePaginarEOrdenarPorDistancia()
    {
        await using var ctx = CriarContextoInMemory();
        await PopularCenarioAsync(ctx);

        var geo = new GeolocationService();
        var mockGeocoding = new Mock<INominatimGeocodingService>();
        var service = new LojaService(ctx, geo, mockGeocoding.Object);

        var page1 = await service.ListarLojasPaginadoAsync(
            userLat: -10.6850m,
            userLon: -37.4252m,
            ordenacao: "proximas",
            page: 1,
            pageSize: 1);

        Assert.True(page1.Success);
        Assert.Equal(2, page1.Data!.TotalCount);
        var loja1 = Assert.Single(page1.Data.Items);
        Assert.Equal("Itabaiana Motos", loja1.NomeFantasia);

        var page2 = await service.ListarLojasPaginadoAsync(
            userLat: -10.6850m,
            userLon: -37.4252m,
            ordenacao: "proximas",
            page: 2,
            pageSize: 1);

        var loja2 = Assert.Single(page2.Data!.Items);
        Assert.Equal("Aracaju Peças", loja2.NomeFantasia);
    }

    [Fact]
    public async Task ObterDashboardLojistaAsync_DeveCalcularMetricasAgregadasSemOOM()
    {
        await using var ctx = CriarContextoInMemory();
        await PopularCenarioAsync(ctx);

        var loja = await ctx.Lojas.FirstAsync(l => l.NomeFantasia == "Itabaiana Motos");
        var service = new LojaService(ctx, new GeolocationService(), Mock.Of<INominatimGeocodingService>());

        var res = await service.ObterDashboardLojistaAsync(loja.Id, loja.UsuarioId);

        Assert.True(res.Success);
        Assert.NotNull(res.Data);
        Assert.Equal(2, res.Data!.TotalProdutosCadastrados);
        Assert.Equal(1, res.Data.TotalItensEstoqueBaixo);
        Assert.Equal(12, res.Data.TotalVisualizacoesOfertas);
        Assert.Equal(4, res.Data.TotalCliquesOfertas);
        Assert.NotEmpty(res.Data.MaisProcuradosRegiao);
    }

    [Fact]
    public async Task RegisterLojistaAsync_QuandoGeocodingFalhar_NaoDeveInventarCoordenadaSP()
    {
        await using var ctx = CriarContextoInMemory();
        var mockGeo = new Mock<INominatimGeocodingService>();
        mockGeo.Setup(g => g.GeocodeAddressAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(((decimal Latitude, decimal Longitude)?)null);

        var auth = new AuthService(
            ctx,
            new PasswordHasherService(),
            Mock.Of<IJwtTokenService>(),
            mockGeo.Object);

        var res = await auth.RegisterLojistaAsync(new RegisterLojistaRequest
        {
            Nome = "Oficina Nova",
            NomeFantasia = "Oficina Nova",
            Email = "nova@oficina.com.br",
            Senha = "SenhaSegura123",
            EnderecoCompleto = "Endereço Inexistente 99999"
        });

        Assert.False(res.Success);
        Assert.Contains("Não foi possível localizar o endereço", res.Message);
        Assert.Empty(ctx.Lojas);
        Assert.Empty(ctx.Usuarios);
    }

    [Fact]
    public async Task ListarEstoqueLojaAsync_DevePaginarECarregarCompatibilidadesEmLote()
    {
        await using var ctx = CriarContextoInMemory();
        await PopularCenarioAsync(ctx);

        var modelo = new ModeloMoto { Id = 1, Marca = "Honda", Modelo = "CG 160 Titan", AnoInicio = 2016 };
        ctx.ModelosMoto.Add(modelo);
        ctx.CompatibilidadesPecaMoto.Add(new CompatibilidadePecaMoto { PecaId = 1, ModeloMotoId = 1 });
        await ctx.SaveChangesAsync();

        var loja = await ctx.Lojas.FirstAsync(l => l.NomeFantasia == "Itabaiana Motos");
        var service = new EstoqueService(ctx, new GeolocationService());

        var res = await service.ListarEstoqueLojaAsync(loja.Id, page: 1, pageSize: 10);

        Assert.True(res.Success);
        Assert.NotNull(res.Data);
        Assert.Equal(2, res.Data!.TotalCount);
        var itemPastilha = res.Data.Items.First(i => i.PecaId == 1);
        Assert.Contains("Honda CG 160 Titan", itemPastilha.DescricaoCompatibilidade);
        var itemPneu = res.Data.Items.First(i => i.PecaId == 2);
        Assert.Equal("Universal", itemPneu.DescricaoCompatibilidade);
    }
}
