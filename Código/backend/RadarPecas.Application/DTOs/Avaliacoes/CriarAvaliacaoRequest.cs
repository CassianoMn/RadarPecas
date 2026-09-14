namespace RadarPecas.Application.DTOs.Avaliacoes;

public class CriarAvaliacaoRequest
{
    public int Nota { get; set; } // 1 a 5
    public string? Comentario { get; set; }
    public bool Recomenda { get; set; }
}
