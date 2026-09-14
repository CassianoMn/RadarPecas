namespace RadarPecas.Domain.Entities;

public class EstatisticaOferta
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EstoqueLojaId { get; set; }
    public int Visualizacoes { get; set; } = 0;
    public int Cliques { get; set; } = 0;
    public DateOnly DataRegistro { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);

    // Relacionamento
    public virtual EstoqueLoja? EstoqueLoja { get; set; }
}
