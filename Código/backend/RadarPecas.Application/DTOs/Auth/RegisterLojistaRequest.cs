using System.ComponentModel.DataAnnotations;

namespace RadarPecas.Application.DTOs.Auth;

public class RegisterLojistaRequest
{
    // Dados do Usuário Lojista
    [StringLength(100)]
    public string Nome { get; set; } = string.Empty;

    [Required(ErrorMessage = "O e-mail é obrigatório.")]
    [EmailAddress(ErrorMessage = "Informe um e-mail válido.")]
    [StringLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "A senha é obrigatória.")]
    [MinLength(8, ErrorMessage = "A senha deve ter no mínimo 8 caracteres.")]
    public string Senha { get; set; } = string.Empty;

    // Dados da Loja
    [Required(ErrorMessage = "O nome fantasia da loja é obrigatório.")]
    [StringLength(150, MinimumLength = 2, ErrorMessage = "O nome da loja deve ter entre 2 e 150 caracteres.")]
    public string NomeFantasia { get; set; } = string.Empty;

    [StringLength(18, ErrorMessage = "O CNPJ deve ter no máximo 18 caracteres.")]
    public string? Cnpj { get; set; }

    [Required(ErrorMessage = "O endereço completo é obrigatório.")]
    [StringLength(400, MinimumLength = 5, ErrorMessage = "Informe um endereço completo válido.")]
    public string EnderecoCompleto { get; set; } = string.Empty;

    [Range(-90, 90, ErrorMessage = "Latitude inválida.")]
    public decimal? Latitude { get; set; }

    [Range(-180, 180, ErrorMessage = "Longitude inválida.")]
    public decimal? Longitude { get; set; }

    [StringLength(20)]
    public string? TelefoneContato { get; set; }

    [EmailAddress(ErrorMessage = "E-mail de contato inválido.")]
    [StringLength(150)]
    public string? EmailContato { get; set; }

    public string? HorariosFuncionamento { get; set; }
    public string? FotoPerfilUrl { get; set; }
}
