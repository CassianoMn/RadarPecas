using System.ComponentModel.DataAnnotations;

namespace RadarPecas.Application.DTOs.Avaliacoes;

public class CriarAvaliacaoRequest
{
    [Range(1, 5, ErrorMessage = "A nota deve estar entre 1 e 5.")]
    public int Nota { get; set; } // 1 a 5

    [StringLength(1000, ErrorMessage = "O comentário deve ter no máximo 1000 caracteres.")]
    public string? Comentario { get; set; }

    public bool Recomenda { get; set; }
}
