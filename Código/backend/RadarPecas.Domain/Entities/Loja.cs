namespace RadarPecas.Domain.Entities;

public class Loja
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UsuarioId { get; set; }
    public string NomeFantasia { get; set; } = string.Empty;
    public string? Cnpj { get; set; }
    public string EnderecoCompleto { get; set; } = string.Empty;
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public string? TelefoneContato { get; set; }
    public string? EmailContato { get; set; }
    public string? HorariosFuncionamento { get; set; } // JSONB
    public string? FotoPerfilUrl { get; set; }
    public string[]? GaleriaFotosUrls { get; set; } // TEXT[]
    public bool Ativa { get; set; } = true;

    // Relacionamentos
    public virtual Usuario? Usuario { get; set; }
    public virtual ICollection<EstoqueLoja> Estoques { get; set; } = new List<EstoqueLoja>();
    public virtual ICollection<AvaliacaoLoja> Avaliacoes { get; set; } = new List<AvaliacaoLoja>();
}
