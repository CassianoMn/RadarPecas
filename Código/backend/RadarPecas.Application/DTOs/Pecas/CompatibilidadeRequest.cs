using System.ComponentModel.DataAnnotations;

namespace RadarPecas.Application.DTOs.Pecas;

public class CompatibilidadeRequest
{
    [Range(1, int.MaxValue, ErrorMessage = "Informe um modelo de moto válido.")]
    public int ModeloMotoId { get; set; }
}
