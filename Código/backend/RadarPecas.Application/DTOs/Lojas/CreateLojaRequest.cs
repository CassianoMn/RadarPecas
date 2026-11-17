using System.ComponentModel.DataAnnotations;

namespace RadarPecas.Application.DTOs.Lojas;

public class CreateLojaRequest
{
    [Required(ErrorMessage = "O nome fantasia é obrigatório.")]
    [StringLength(150, MinimumLength = 2, ErrorMessage = "O nome fantasia deve ter entre 2 e 150 caracteres.")]
    public string NomeFantasia { get; set; } = string.Empty;

    [StringLength(18)]
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
    public string[]? GaleriaFotosUrls { get; set; }
}
