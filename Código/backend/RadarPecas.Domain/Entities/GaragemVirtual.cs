namespace RadarPecas.Domain.Entities;

public class GaragemVirtual
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UsuarioId { get; set; }
    public int ModeloMotoId { get; set; }
    public int AnoFabricacao { get; set; }
    public string? Apelido { get; set; }
    public string? FotoMotoUrl { get; set; }

    // Relacionamentos
    public virtual Usuario? Usuario { get; set; }
    public virtual ModeloMoto? ModeloMoto { get; set; }
}
