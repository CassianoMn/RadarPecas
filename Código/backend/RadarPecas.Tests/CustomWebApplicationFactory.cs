using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.IdentityModel.Tokens;
using Moq;
using RadarPecas.Application.DTOs.Geocoding;
using RadarPecas.Application.Interfaces;
using RadarPecas.Domain.Entities;
using RadarPecas.Domain.Enums;
using RadarPecas.Infrastructure.Data;

namespace RadarPecas.Tests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    private const string TestJwtSecret = "test-super-secret-jwt-key-radarpecas-2026-integration-minimum-32-chars";
    private readonly string _dbName = $"RadarPecasIntegracao_{Guid.NewGuid()}";

    public Guid MotociclistaId { get; } = Guid.NewGuid();
    public Guid LojistaAUserId { get; } = Guid.NewGuid();
    public Guid LojistaBUserId { get; } = Guid.NewGuid();
    public Guid LojaAId { get; } = Guid.NewGuid();
    public Guid LojaBId { get; } = Guid.NewGuid();
    public Guid EstoqueLojaAId { get; } = Guid.NewGuid();
    public Guid EstoqueLojaBId { get; } = Guid.NewGuid();
    public int PecaId { get; } = 1;
    public int ModeloMotoId { get; } = 1;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = "Host=localhost;Database=radarPecasTest;Username=postgres;Password=test",
                ["Jwt:Secret"] = TestJwtSecret,
                ["Jwt:Issuer"] = "RadarPecasAPI",
                ["Jwt:Audience"] = "RadarPecasApp",
                ["Jwt:ExpirationHours"] = "24",
                ["Cors:AllowedOrigins:0"] = "http://localhost:5173"
            });
        });

        builder.ConfigureServices(services =>
        {
            // Garante que AddJwtBearer use o mesmo segredo de teste injetado em IConfiguration
            services.PostConfigure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
            {
                options.TokenValidationParameters.IssuerSigningKey =
                    new SymmetricSecurityKey(Encoding.UTF8.GetBytes(TestJwtSecret));
                options.TokenValidationParameters.ValidIssuer = "RadarPecasAPI";
                options.TokenValidationParameters.ValidAudience = "RadarPecasApp";
            });
            var toRemove = services
                .Where(d => d.ServiceType == typeof(DbContextOptions<RadarPecasDbContext>)
                         || d.ServiceType == typeof(DbContextOptions)
                         || (d.ServiceType.IsGenericType
                             && d.ServiceType.FullName?.Contains("DbContextOptionsConfiguration") == true))
                .ToList();
            foreach (var descriptor in toRemove)
            {
                services.Remove(descriptor);
            }

            services.AddDbContext<RadarPecasDbContext>(options =>
                options.UseInMemoryDatabase(_dbName));

            // Evita chamadas externas HTTP ao Nominatim durante os testes de integração
            services.RemoveAll<INominatimGeocodingService>();
            var mockGeo = new Mock<INominatimGeocodingService>();
            mockGeo
                .Setup(g => g.GeocodeAddressAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((-10.6850m, -37.4252m));
            mockGeo
                .Setup(g => g.BuscarSugestoesAsync(It.IsAny<string>(), It.IsAny<int>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<LocalizacaoSugestaoResponse>());
            services.AddScoped(_ => mockGeo.Object);

            using var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<RadarPecasDbContext>();
            var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasherService>();

            db.Database.EnsureCreated();
            PopularBaseTeste(db, hasher);
        });
    }

    private void PopularBaseTeste(RadarPecasDbContext db, IPasswordHasherService hasher)
    {
        if (db.Usuarios.Any()) return;

        var motoUser = new Usuario
        {
            Id = MotociclistaId,
            Nome = "Lucas Teste",
            Email = "moto@radarpecas.test",
            SenhaHash = hasher.HashPassword("Moto#2026"),
            TipoUsuario = TipoUsuario.MOTOCICLISTA
        };

        var lojistaA = new Usuario
        {
            Id = LojistaAUserId,
            Nome = "Lojista A",
            Email = "lojaa@radarpecas.test",
            SenhaHash = hasher.HashPassword("Loja#2026"),
            TipoUsuario = TipoUsuario.LOJISTA
        };

        var lojistaB = new Usuario
        {
            Id = LojistaBUserId,
            Nome = "Lojista B",
            Email = "lojab@radarpecas.test",
            SenhaHash = hasher.HashPassword("Loja#2026"),
            TipoUsuario = TipoUsuario.LOJISTA
        };

        db.Usuarios.AddRange(motoUser, lojistaA, lojistaB);

        var lojaA = new Loja
        {
            Id = LojaAId,
            UsuarioId = LojistaAUserId,
            NomeFantasia = "Oficina Alpha Motos",
            EnderecoCompleto = "Av. Central, 100 - Itabaiana/SE",
            Latitude = -10.6850m,
            Longitude = -37.4252m,
            Ativa = true
        };

        var lojaB = new Loja
        {
            Id = LojaBId,
            UsuarioId = LojistaBUserId,
            NomeFantasia = "Oficina Beta Peças",
            EnderecoCompleto = "Rua Secundária, 200 - Aracaju/SE",
            Latitude = -10.9167m,
            Longitude = -37.0500m,
            Ativa = true
        };

        db.Lojas.AddRange(lojaA, lojaB);

        var modelo = new ModeloMoto
        {
            Id = ModeloMotoId,
            Marca = "Honda",
            Modelo = "CG 160 Titan",
            AnoInicio = 2016,
            AnoFim = 2026
        };
        db.ModelosMoto.Add(modelo);

        var peca = new Peca
        {
            Id = PecaId,
            Nome = "Pastilha de Freio Dianteira",
            Categoria = "Freios",
            Sku = "FREIO-INT-001",
            Descricao = "Pastilha compatível com linha CG 160"
        };
        db.Pecas.Add(peca);

        db.CompatibilidadesPecaMoto.Add(new CompatibilidadePecaMoto
        {
            PecaId = PecaId,
            ModeloMotoId = ModeloMotoId
        });

        db.EstoqueLojas.AddRange(
            new EstoqueLoja
            {
                Id = EstoqueLojaAId,
                LojaId = LojaAId,
                PecaId = PecaId,
                QuantidadeEstoque = 10,
                AlertaEstoqueMinimo = 2,
                PrecoVenda = 49.90m,
                EmPromocao = false
            },
            new EstoqueLoja
            {
                Id = EstoqueLojaBId,
                LojaId = LojaBId,
                PecaId = PecaId,
                QuantidadeEstoque = 8,
                AlertaEstoqueMinimo = 2,
                PrecoVenda = 59.90m,
                EmPromocao = false
            });

        db.SaveChanges();
    }
}
