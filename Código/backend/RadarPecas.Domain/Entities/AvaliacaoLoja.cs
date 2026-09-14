namespace RadarPecas.Domain.Entities;

public class AvaliacaoLoja
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid LojaId { get; set; }
    public Guid UsuarioId { get; set; }
    public int Nota { get; set; } // 1 a 5
    public string? Comentario { get; set; }
    public bool Recomenda { get; set; }
    public DateTime DataAvaliacao { get; set; } = DateTime.UtcNow;

    // Relacionamentos
    public virtual Loja? Loja { get; set; }
    public virtual Usuario? Usuario { get; set; }
}
