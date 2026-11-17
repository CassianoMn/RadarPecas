using System.ComponentModel.DataAnnotations;

namespace RadarPecas.Application.DTOs.Auth;

public class UpdateProfileRequest
{
    [StringLength(100, ErrorMessage = "O nome deve ter no máximo 100 caracteres.")]
    public string Nome { get; set; } = string.Empty;

    [EmailAddress(ErrorMessage = "Informe um e-mail válido.")]
    [StringLength(150)]
    public string? Email { get; set; }

    public string? SenhaAtual { get; set; }
    public string? NovaSenha { get; set; }
}
