namespace RadarPecas.Application.DTOs.Avaliacoes;

public class AvaliacaoResponse
{
    public Guid Id { get; set; }
    public Guid LojaId { get; set; }
    public Guid UsuarioId { get; set; }
    public string NomeUsuario { get; set; } = string.Empty;
    public int Nota { get; set; }
    public string? Comentario { get; set; }
    public bool Recomenda { get; set; }
    public DateTime DataAvaliacao { get; set; }
}
