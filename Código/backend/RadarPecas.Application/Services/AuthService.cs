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

        if (request.Senha.Length < 6)
        {
            return ApiResponse<LoginResponse>.Fail("A senha deve possuir no mínimo 6 caracteres.");
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
        var enderecoCompleto = string.IsNullOrWhiteSpace(request.EnderecoCompleto)
            ? "Av. Tiradentes, 500 - Centro, São Paulo - SP"
            : request.EnderecoCompleto;

        if (string.IsNullOrWhiteSpace(nomeUsuario) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Senha) ||
            string.IsNullOrWhiteSpace(nomeFantasia))
        {
            return ApiResponse<LoginResponse>.Fail("Preencha todos os campos obrigatórios (nome da loja, e-mail e senha).");
        }

        if (request.Senha.Length < 6)
        {
            return ApiResponse<LoginResponse>.Fail("A senha deve possuir no mínimo 6 caracteres.");
        }

        var emailExiste = await _context.Usuarios.AnyAsync(u => u.Email.ToLower() == request.Email.Trim().ToLower(), cancellationToken);
        if (emailExiste)
        {
            return ApiResponse<LoginResponse>.Fail("O e-mail informado já está cadastrado.");
        }

        if (!string.IsNullOrWhiteSpace(request.Cnpj))
        {
            var cnpjExiste = await _context.Lojas.AnyAsync(l => l.Cnpj == request.Cnpj.Trim(), cancellationToken);
            if (cnpjExiste)
            {
                return ApiResponse<LoginResponse>.Fail("O CNPJ informado já está cadastrado em outra loja.");
            }
        }

        decimal lat = request.Latitude ?? -23.5329m;
        decimal lon = request.Longitude ?? -46.6326m;

        if (!string.IsNullOrWhiteSpace(request.EnderecoCompleto) && (!request.Latitude.HasValue || !request.Longitude.HasValue))
        {
            var coords = await _geocodingService.GeocodeAddressAsync(request.EnderecoCompleto, cancellationToken);
            if (coords.HasValue)
            {
                lat = coords.Value.Latitude;
                lon = coords.Value.Longitude;
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

        await _context.Usuarios.AddAsync(usuario, cancellationToken);

        var rawHorarios = string.IsNullOrWhiteSpace(request.HorariosFuncionamento)
            ? "Segunda a Sexta: 08:00 às 18:00 | Sábado: 08:00 às 13:00 | Domingo: Fechado"
            : request.HorariosFuncionamento.Trim();
        var horariosJson = rawHorarios.StartsWith("{") || rawHorarios.StartsWith("[") || rawHorarios.StartsWith("\"")
            ? rawHorarios
            : System.Text.Json.JsonSerializer.Serialize(new { resumo = rawHorarios });

        var loja = new Loja
        {
            UsuarioId = usuario.Id,
            NomeFantasia = nomeFantasia.Trim(),
            Cnpj = request.Cnpj?.Trim(),
            EnderecoCompleto = enderecoCompleto.Trim(),
            Latitude = lat,
            Longitude = lon,
            TelefoneContato = request.TelefoneContato?.Trim() ?? "(11) 99999-0000",
            EmailContato = request.EmailContato?.Trim() ?? usuario.Email,
            HorariosFuncionamento = horariosJson,
            FotoPerfilUrl = request.FotoPerfilUrl,
            Ativa = true
        };

        await _context.Lojas.AddAsync(loja, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

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
            if (!emailLimpo.Contains('@') || !emailLimpo.Contains('.'))
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

            if (request.NovaSenha.Length < 6)
            {
                return ApiResponse<UserProfileResponse>.Fail("A nova senha deve possuir no mínimo 6 caracteres.");
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
