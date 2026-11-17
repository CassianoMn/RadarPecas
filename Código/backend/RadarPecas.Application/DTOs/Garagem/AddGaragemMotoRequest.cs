using System.ComponentModel.DataAnnotations;

namespace RadarPecas.Application.DTOs.Garagem;

public class AddGaragemMotoRequest
{
    [Range(1, int.MaxValue, ErrorMessage = "Informe um modelo de moto válido.")]
    public int ModeloMotoId { get; set; }

    [Range(1950, 2100, ErrorMessage = "Informe um ano de fabricação válido.")]
    public int AnoFabricacao { get; set; }

    [StringLength(50, ErrorMessage = "O apelido deve ter no máximo 50 caracteres.")]
    public string? Apelido { get; set; }

    public string? FotoMotoUrl { get; set; }
}
