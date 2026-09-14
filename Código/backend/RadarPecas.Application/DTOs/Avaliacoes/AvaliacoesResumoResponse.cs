namespace RadarPecas.Application.DTOs.Avaliacoes;

public class AvaliacoesResumoResponse
{
    public Guid LojaId { get; set; }
    public double MediaNotas { get; set; }
    public int TotalAvaliacoes { get; set; }
    public double PercentualRecomendacao { get; set; }
    public List<AvaliacaoResponse> Avaliacoes { get; set; } = new();
}
