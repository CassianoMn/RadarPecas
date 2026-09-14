namespace RadarPecas.Application.DTOs.Auth;

public class RegisterLojistaRequest
{
    // Dados do Usuário Lojista
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Senha { get; set; } = string.Empty;

    // Dados da Loja
    public string NomeFantasia { get; set; } = string.Empty;
    public string? Cnpj { get; set; }
    public string EnderecoCompleto { get; set; } = string.Empty;
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string? TelefoneContato { get; set; }
    public string? EmailContato { get; set; }
    public string? HorariosFuncionamento { get; set; }
    public string? FotoPerfilUrl { get; set; }
}
