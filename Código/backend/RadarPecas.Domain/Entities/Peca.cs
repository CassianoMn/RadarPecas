namespace RadarPecas.Domain.Entities;

public class Peca
{
    public int Id { get; set; }
    public string? Sku { get; set; }
    public string? CodigoEan { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public string Categoria { get; set; } = string.Empty;
    public string? FotoPecaUrl { get; set; }
    public string? Especificacoes { get; set; } // JSONB

    // Relacionamentos
    public virtual ICollection<CompatibilidadePecaMoto> Compatibilidades { get; set; } = new List<CompatibilidadePecaMoto>();
    public virtual ICollection<EstoqueLoja> Estoques { get; set; } = new List<EstoqueLoja>();
}
