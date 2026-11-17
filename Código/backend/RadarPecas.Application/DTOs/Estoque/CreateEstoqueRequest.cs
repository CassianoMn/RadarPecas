using System.ComponentModel.DataAnnotations;

namespace RadarPecas.Application.DTOs.Estoque;

public class CreateEstoqueRequest
{
    [Required]
    public Guid LojaId { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Informe uma peça válida.")]
    public int PecaId { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "A quantidade em estoque não pode ser negativa.")]
    public int QuantidadeEstoque { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "O alerta de estoque mínimo não pode ser negativo.")]
    public int AlertaEstoqueMinimo { get; set; } = 5;

    [Range(typeof(decimal), "0.01", "9999999", ErrorMessage = "O preço de venda deve ser maior que zero.")]
    public decimal PrecoVenda { get; set; }

    public bool EmPromocao { get; set; } = false;

    [Range(typeof(decimal), "0.01", "9999999", ErrorMessage = "O preço promocional deve ser maior que zero.")]
    public decimal? PrecoPromocional { get; set; }

    public DateOnly? DataInicioPromocao { get; set; }
    public DateOnly? DataFimPromocao { get; set; }
}
