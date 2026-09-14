namespace RadarPecas.Application.DTOs.Auth;

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string TipoUsuario { get; set; } = string.Empty;
    public Guid? LojaId { get; set; }
    public string? NomeLoja { get; set; }
}
