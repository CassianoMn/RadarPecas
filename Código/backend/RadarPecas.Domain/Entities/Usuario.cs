using RadarPecas.Domain.Enums;

namespace RadarPecas.Domain.Entities;

public class Usuario
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string SenhaHash { get; set; } = string.Empty;
    public TipoUsuario TipoUsuario { get; set; }
    public DateTime DataCadastro { get; set; } = DateTime.UtcNow;

    // Relacionamentos
    public virtual ICollection<Loja> Lojas { get; set; } = new List<Loja>();
    public virtual ICollection<GaragemVirtual> MotosGaragem { get; set; } = new List<GaragemVirtual>();
    public virtual ICollection<AvaliacaoLoja> Avaliacoes { get; set; } = new List<AvaliacaoLoja>();
}
