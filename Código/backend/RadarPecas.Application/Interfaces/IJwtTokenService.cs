using RadarPecas.Domain.Entities;

namespace RadarPecas.Application.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(Usuario usuario, Loja? loja = null);
}
