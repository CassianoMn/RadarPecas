using System.ComponentModel.DataAnnotations;

namespace RadarPecas.Application.DTOs.Pecas;

public class CreatePecaRequest
{
    [StringLength(50)]
    public string? Sku { get; set; }

    [StringLength(13)]
    public string? CodigoEan { get; set; }

    [Required(ErrorMessage = "O nome da peça é obrigatório.")]
    [StringLength(150, MinimumLength = 2, ErrorMessage = "O nome da peça deve ter entre 2 e 150 caracteres.")]
    public string Nome { get; set; } = string.Empty;

    public string? Descricao { get; set; }

    [Required(ErrorMessage = "A categoria é obrigatória.")]
    [StringLength(50)]
    public string Categoria { get; set; } = string.Empty;

    public string? FotoPecaUrl { get; set; }
    public string? Especificacoes { get; set; }
    public List<int>? ModelosMotoIds { get; set; }
}
