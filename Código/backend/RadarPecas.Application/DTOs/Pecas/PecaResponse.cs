namespace RadarPecas.Application.DTOs.Pecas;

public class PecaResponse
{
    public int Id { get; set; }
    public string? Sku { get; set; }
    public string? CodigoEan { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public string Categoria { get; set; } = string.Empty;
    public string? FotoPecaUrl { get; set; }
    public string? Especificacoes { get; set; }
}
