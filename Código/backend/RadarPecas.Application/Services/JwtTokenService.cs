using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using RadarPecas.Application.Interfaces;
using RadarPecas.Domain.Entities;

namespace RadarPecas.Application.Services;

public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _configuration;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(Usuario usuario, Loja? loja = null)
    {
        var secretKey = _configuration["Jwt:Secret"] ?? "radar_pecas_super_secret_key_tcc_ufs_2026_min_32_chars!";
        var issuer = _configuration["Jwt:Issuer"] ?? "RadarPecasAPI";
        var audience = _configuration["Jwt:Audience"] ?? "RadarPecasApp";
        var expirationHoursStr = _configuration["Jwt:ExpirationHours"] ?? "24";

        if (!double.TryParse(expirationHoursStr, out var expirationHours))
        {
            expirationHours = 24;
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new(ClaimTypes.Email, usuario.Email),
            new(ClaimTypes.Name, usuario.Nome),
            new(ClaimTypes.Role, usuario.TipoUsuario.ToString()),
            new("tipo_usuario", usuario.TipoUsuario.ToString())
        };

        if (loja != null)
        {
            claims.Add(new Claim("loja_id", loja.Id.ToString()));
            claims.Add(new Claim("nome_loja", loja.NomeFantasia));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(expirationHours),
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = credentials
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}
