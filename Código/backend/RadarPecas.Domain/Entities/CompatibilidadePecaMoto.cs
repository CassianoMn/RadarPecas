namespace RadarPecas.Domain.Entities;

public class CompatibilidadePecaMoto
{
    public int PecaId { get; set; }
    public int ModeloMotoId { get; set; }

    // Relacionamentos
    public virtual Peca? Peca { get; set; }
    public virtual ModeloMoto? ModeloMoto { get; set; }
}
