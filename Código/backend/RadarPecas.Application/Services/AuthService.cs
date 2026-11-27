using Microsoft.EntityFrameworkCore;
using RadarPecas.Application.DTOs.Auth;
using RadarPecas.Application.DTOs.Common;
using RadarPecas.Application.Interfaces;
using RadarPecas.Domain.Entities;
using RadarPecas.Domain.Enums;

namespace RadarPecas.Application.Services;

public class AuthService : IAuthService
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasherService _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly INominatimGeocodingService _geocodingService;

    public AuthService(
        IApplicationDbContext context,
        IPasswordHasherService passwordHasher,
        IJwtTokenService jwtTokenService,
        INominatimGeocodingService geocodingService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
        _geocodingService = geocodingService;
    }

    public async Task<ApiResponse<LoginResponse>> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Senha))
        {
            return ApiResponse<LoginResponse>.Fail("E-mail e senha são obrigatórios.");
        }

        var usuario = await _context.Usuarios
            .Include(u => u.Lojas)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.Trim().ToLower(), cancellationToken);

        if (usuario == null || !_passwordHasher.VerifyPassword(request.Senha, usuario.SenhaHash))
        {
            return ApiResponse<LoginResponse>.Fail("Credenciais inválidas. Verifique seu e-mail e senha.");
        }

        var loja = usuario.Lojas.FirstOrDefault(l => l.Ativa);
        var token = _jwtTokenService.GenerateToken(usuario, loja);

        var response = new LoginResponse
        {
            Token = token,
            UserId = usuario.Id,
            Nome = usuario.Nome,
            Email = usuario.Email,
            TipoUsuario = usuario.TipoUsuario.ToString(),
            LojaId = loja?.Id,
            NomeLoja = loja?.NomeFantasia
        };

        return ApiResponse<LoginResponse>.Ok(response, "Login realizado com sucesso.");
    }

    public async Task<ApiResponse<LoginResponse>> RegisterMotociclistaAsync(RegisterMotociclistaRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Nome) || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Senha))
        {
            return ApiResponse<LoginResponse>.Fail("Todos os campos obrigatórios devem ser preenchidos.");
        }

        if (!SegurancaValidacao.EmailValido(request.Email))
        {
            return ApiResponse<LoginResponse>.Fail("Informe um e-mail válido.");
        }

        if (!SegurancaValidacao.SenhaForte(request.Senha))
        {
            return ApiResponse<LoginResponse>.Fail("A senha deve ter no mínimo 8 caracteres, com letras e números.");
        }

        var emailExiste = await _context.Usuarios.AnyAsync(u => u.Email.ToLower() == request.Email.Trim().ToLower(), cancellationToken);
        if (emailExiste)
        {
            return ApiResponse<LoginResponse>.Fail("O e-mail informado já está cadastrado.");
        }

        var usuario = new Usuario
        {
            Nome = request.Nome.Trim(),
            Email = request.Email.Trim().ToLower(),
            SenhaHash = _passwordHasher.HashPassword(request.Senha),
            TipoUsuario = TipoUsuario.MOTOCICLISTA,
            DataCadastro = DateTime.UtcNow
        };

        await _context.Usuarios.AddAsync(usuario, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var token = _jwtTokenService.GenerateToken(usuario);

        var response = new LoginResponse
        {
            Token = token,
            UserId = usuario.Id,
            Nome = usuario.Nome,
            Email = usuario.Email,
            TipoUsuario = usuario.TipoUsuario.ToString()
        };

        return ApiResponse<LoginResponse>.Ok(response, "Cadastro de motociclista realizado com sucesso.");
    }

    public async Task<ApiResponse<LoginResponse>> RegisterLojistaAsync(RegisterLojistaRequest request, CancellationToken cancellationToken = default)
    {
        var nomeFantasia = string.IsNullOrWhiteSpace(request.NomeFantasia) ? request.Nome : request.NomeFantasia;
        var nomeUsuario = string.IsNullOrWhiteSpace(request.Nome) ? nomeFantasia : request.Nome;

        if (string.IsNullOrWhiteSpace(nomeUsuario) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Senha) ||
            string.IsNullOrWhiteSpace(nomeFantasia) ||
            string.IsNullOrWhiteSpace(request.EnderecoCompleto))
        {
            return ApiResponse<LoginResponse>.Fail("Preencha todos os campos obrigatórios (nome da loja, endereço, e-mail e senha).");
        }

        if (!SegurancaValidacao.EmailValido(request.Email))
        {
            return ApiResponse<LoginResponse>.Fail("Informe um e-mail válido.");
        }

        if (!string.IsNullOrWhiteSpace(request.EmailContato) && !SegurancaValidacao.EmailValido(request.EmailContato))
        {
            return ApiResponse<LoginResponse>.Fail("Informe um e-mail de contato válido.");
        }

        if (!SegurancaValidacao.SenhaForte(request.Senha))
        {
            return ApiResponse<LoginResponse>.Fail("A senha deve ter no mínimo 8 caracteres, com letras e números.");
        }

        var emailExiste = await _context.Usuarios.AnyAsync(u => u.Email.ToLower() == request.Email.Trim().ToLower(), cancellationToken);
        if (emailExiste)
        {
            return ApiResponse<LoginResponse>.Fail("O e-mail informado já está cadastrado.");
        }

        if (!string.IsNullOrWhiteSpace(request.Cnpj))
        {
            if (!SegurancaValidacao.CnpjValido(request.Cnpj))
            {
                return ApiResponse<LoginResponse>.Fail("CNPJ inválido. Verifique os dígitos informados.");
            }

            var cnpjExiste = await _context.Lojas.AnyAsync(l => l.Cnpj == request.Cnpj.Trim(), cancellationToken);
            if (cnpjExiste)
            {
                return ApiResponse<LoginResponse>.Fail("O CNPJ informado já está cadastrado em outra loja.");
            }
        }

        decimal lat = request.Latitude ?? 0m;
        decimal lon = request.Longitude ?? 0m;

        if (!SegurancaValidacao.CoordenadasValidas(lat, lon))
        {
            var coords = await _geocodingService.GeocodeAddressAsync(request.EnderecoCompleto, cancellationToken);
            if (coords.HasValue && SegurancaValidacao.CoordenadasValidas(coords.Value.Latitude, coords.Value.Longitude))
            {
                lat = coords.Value.Latitude;
                lon = coords.Value.Longitude;
            }
            else
            {
                return ApiResponse<LoginResponse>.Fail(
                    "Não foi possível localizar o endereço da loja. Informe rua, número, cidade e UF completos ou selecione uma sugestão.");
            }
        }

        var usuario = new Usuario
        {
            Nome = nomeUsuario.Trim(),
            Email = request.Email.Trim().ToLower(),
            SenhaHash = _passwordHasher.HashPassword(request.Senha),
            TipoUsuario = TipoUsuario.LOJISTA,
            DataCadastro = DateTime.UtcNow
        };

        var rawHorarios = string.IsNullOrWhiteSpace(request.HorariosFuncionamento)
            ? "Segunda a Sexta: 08:00 às 18:00 | Sábado: 08:00 às 13:00 | Domingo: Fechado"
            : request.HorariosFuncionamento.Trim();
        var horariosJson = rawHorarios.StartsWith("{") || rawHorarios.StartsWith("[") || rawHorarios.StartsWith("\"")
            ? rawHorarios
            : System.Text.Json.JsonSerializer.Serialize(rawHorarios);

        var loja = new Loja
        {
            NomeFantasia = nomeFantasia.Trim(),
            Cnpj = request.Cnpj?.Trim(),
            EnderecoCompleto = request.EnderecoCompleto.Trim(),
            Latitude = lat,
            Longitude = lon,
            TelefoneContato = request.TelefoneContato?.Trim(),
            EmailContato = request.EmailContato?.Trim() ?? usuario.Email,
            HorariosFuncionamento = horariosJson,
            FotoPerfilUrl = request.FotoPerfilUrl,
            Ativa = true
        };

        // Persistência atômica de Usuário + Loja para não deixar usuário órfão em caso de falha na loja.
        await _context.ExecuteInTransactionAsync(async ct =>
        {
            await _context.Usuarios.AddAsync(usuario, ct);
            await _context.SaveChangesAsync(ct);

            loja.UsuarioId = usuario.Id;
            await _context.Lojas.AddAsync(loja, ct);
            await _context.SaveChangesAsync(ct);
        }, cancellationToken);

        var token = _jwtTokenService.GenerateToken(usuario, loja);

        var response = new LoginResponse
        {
            Token = token,
            UserId = usuario.Id,
            Nome = usuario.Nome,
            Email = usuario.Email,
            TipoUsuario = usuario.TipoUsuario.ToString(),
            LojaId = loja.Id,
            NomeLoja = loja.NomeFantasia
        };

        return ApiResponse<LoginResponse>.Ok(response, "Cadastro de lojista e estabelecimento realizado com sucesso.");
    }

    public async Task<ApiResponse<UserProfileResponse>> GetProfileAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var usuario = await _context.Usuarios
            .Include(u => u.Lojas)
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (usuario == null)
        {
            return ApiResponse<UserProfileResponse>.Fail("Usuário não encontrado.");
        }

        var loja = usuario.Lojas.FirstOrDefault(l => l.Ativa);

        var response = new UserProfileResponse
        {
            Id = usuario.Id,
            Nome = usuario.Nome,
            Email = usuario.Email,
            TipoUsuario = usuario.TipoUsuario.ToString(),
            DataCadastro = usuario.DataCadastro,
            LojaId = loja?.Id,
            NomeLoja = loja?.NomeFantasia
        };

        return ApiResponse<UserProfileResponse>.Ok(response);
    }

    public async Task<ApiResponse<UserProfileResponse>> UpdateProfileAsync(Guid userId, UpdateProfileRequest request, CancellationToken cancellationToken = default)
    {
        var usuario = await _context.Usuarios
            .Include(u => u.Lojas)
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (usuario == null)
        {
            return ApiResponse<UserProfileResponse>.Fail("Usuário não encontrado.");
        }

        if (!string.IsNullOrWhiteSpace(request.Nome))
        {
            usuario.Nome = request.Nome.Trim();
        }

        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            var emailLimpo = request.Email.Trim().ToLowerInvariant();
            if (!SegurancaValidacao.EmailValido(emailLimpo))
            {
                return ApiResponse<UserProfileResponse>.Fail("Formato de e-mail inválido.");
            }

            if (!emailLimpo.Equals(usuario.Email, StringComparison.OrdinalIgnoreCase))
            {
                var emailJaCadastrado = await _context.Usuarios
                    .AnyAsync(u => u.Email == emailLimpo && u.Id != userId, cancellationToken);

                if (emailJaCadastrado)
                {
                    return ApiResponse<UserProfileResponse>.Fail("Já existe um usuário cadastrado com este e-mail.");
                }

                usuario.Email = emailLimpo;
            }
        }

        if (!string.IsNullOrWhiteSpace(request.NovaSenha))
        {
            if (string.IsNullOrWhiteSpace(request.SenhaAtual) || !_passwordHasher.VerifyPassword(request.SenhaAtual, usuario.SenhaHash))
            {
                return ApiResponse<UserProfileResponse>.Fail("A senha atual informada está incorreta.");
            }

            if (!SegurancaValidacao.SenhaForte(request.NovaSenha))
            {
                return ApiResponse<UserProfileResponse>.Fail("A nova senha deve ter no mínimo 8 caracteres, com letras e números.");
            }

            usuario.SenhaHash = _passwordHasher.HashPassword(request.NovaSenha);
        }

        await _context.SaveChangesAsync(cancellationToken);

        var loja = usuario.Lojas.FirstOrDefault(l => l.Ativa);

        var response = new UserProfileResponse
        {
            Id = usuario.Id,
            Nome = usuario.Nome,
            Email = usuario.Email,
            TipoUsuario = usuario.TipoUsuario.ToString(),
            DataCadastro = usuario.DataCadastro,
            LojaId = loja?.Id,
            NomeLoja = loja?.NomeFantasia
        };

        return ApiResponse<UserProfileResponse>.Ok(response, "Perfil atualizado com sucesso.");
    }
}
