using System.ComponentModel.DataAnnotations;

namespace RadarPecas.Application.DTOs.Estoque;

public class AtualizarPromocaoRequest
{
    public bool EmPromocao { get; set; }

    [Range(typeof(decimal), "0.01", "9999999", ErrorMessage = "O preço promocional deve ser maior que zero.")]
    public decimal? PrecoPromocional { get; set; }

    public DateOnly? DataInicioPromocao { get; set; }
    public DateOnly? DataFimPromocao { get; set; }
}
