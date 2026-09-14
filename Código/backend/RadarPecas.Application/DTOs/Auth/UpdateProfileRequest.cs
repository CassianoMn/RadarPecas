namespace RadarPecas.Application.DTOs.Auth;

public class UpdateProfileRequest
{
    public string Nome { get; set; } = string.Empty;
    public string? SenhaAtual { get; set; }
    public string? NovaSenha { get; set; }
}
