using System.ComponentModel.DataAnnotations;

namespace RadarPecas.Application.DTOs.Garagem;

public class UpdateGaragemMotoRequest
{
    [Range(1950, 2100, ErrorMessage = "Informe um ano de fabricação válido.")]
    public int AnoFabricacao { get; set; }

    [StringLength(50, ErrorMessage = "O apelido deve ter no máximo 50 caracteres.")]
    public string? Apelido { get; set; }

    public string? FotoMotoUrl { get; set; }
}
