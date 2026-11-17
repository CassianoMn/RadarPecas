using System.ComponentModel.DataAnnotations;

namespace RadarPecas.Application.DTOs.Garagem;

public class CreateModeloMotoRequest
{
    [Required(ErrorMessage = "A marca é obrigatória.")]
    [StringLength(50)]
    public string Marca { get; set; } = string.Empty;

    [Required(ErrorMessage = "O modelo é obrigatório.")]
    [StringLength(100)]
    public string Modelo { get; set; } = string.Empty;

    [Range(1950, 2100, ErrorMessage = "Ano de início inválido.")]
    public int? AnoInicio { get; set; }

    [Range(1950, 2100, ErrorMessage = "Ano final inválido.")]
    public int? AnoFim { get; set; }
}
