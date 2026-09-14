namespace RadarPecas.Application.DTOs.Auth;

public class UserProfileResponse
{
    public Guid Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string TipoUsuario { get; set; } = string.Empty;
    public DateTime DataCadastro { get; set; }
    public Guid? LojaId { get; set; }
    public string? NomeLoja { get; set; }
}
