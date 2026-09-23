using Microsoft.Extensions.Configuration;
using RadarPecas.Application.Services;
using RadarPecas.Domain.Entities;
using RadarPecas.Domain.Enums;
using RadarPecas.Infrastructure.Services;
using Xunit;

namespace RadarPecas.Tests;

public class AuthServiceTests
{
    private readonly PasswordHasherService _hasher = new();

    [Fact]
    public void PasswordHasher_DeveGerarHashValidoEVerificarCorretamente()
    {
        var senha = "SenhaSegura@2026!";
        var hash = _hasher.HashPassword(senha);

        Assert.NotNull(hash);
        Assert.StartsWith("$2", hash); // Padrão BCrypt
        Assert.True(_hasher.VerifyPassword(senha, hash));
        Assert.False(_hasher.VerifyPassword("SenhaErrada", hash));
    }

    [Fact]
    public void JwtTokenService_DeveGerarTokenValidoParaUsuario()
    {
        var inMemorySettings = new Dictionary<string, string?>
        {
            {"Jwt:Secret", "chave_secreta_super_segura_para_testes_unitarios_123456789!"},
            {"Jwt:Issuer", "RadarPecasAPI"},
            {"Jwt:Audience", "RadarPecasApp"},
            {"Jwt:ExpirationHours", "24"}
        };

        IConfiguration configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        var jwtService = new JwtTokenService(configuration);

        var usuario = new Usuario
        {
            Id = Guid.NewGuid(),
            Nome = "Motociclista Teste",
            Email = "teste@radarpecas.com.br",
            TipoUsuario = TipoUsuario.MOTOCICLISTA
        };

        var token = jwtService.GenerateToken(usuario);

        Assert.NotNull(token);
        Assert.NotEmpty(token);
        Assert.Contains(".", token); // Formato JWT (header.payload.signature)
    }

    [Fact]
    public void UpdateProfileRequest_DevePermitirCamposDeNomeEmailESenha()
    {
        var request = new RadarPecas.Application.DTOs.Auth.UpdateProfileRequest
        {
            Nome = "Novo Nome",
            Email = "novonome@email.com",
            SenhaAtual = "SenhaAntiga123",
            NovaSenha = "NovaSenhaSegura123"
        };

        Assert.Equal("Novo Nome", request.Nome);
        Assert.Equal("novonome@email.com", request.Email);
        Assert.Equal("SenhaAntiga123", request.SenhaAtual);
        Assert.Equal("NovaSenhaSegura123", request.NovaSenha);
    }
}

