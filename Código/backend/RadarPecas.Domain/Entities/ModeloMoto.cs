namespace RadarPecas.Domain.Entities;

public class ModeloMoto
{
    public int Id { get; set; }
    public string Marca { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public int? AnoInicio { get; set; }
    public int? AnoFim { get; set; }

    // Relacionamentos
    public virtual ICollection<GaragemVirtual> Garagens { get; set; } = new List<GaragemVirtual>();
    public virtual ICollection<CompatibilidadePecaMoto> Compatibilidades { get; set; } = new List<CompatibilidadePecaMoto>();
}
