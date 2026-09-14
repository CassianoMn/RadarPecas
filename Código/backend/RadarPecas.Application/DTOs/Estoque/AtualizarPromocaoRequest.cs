namespace RadarPecas.Application.DTOs.Estoque;

public class AtualizarPromocaoRequest
{
    public bool EmPromocao { get; set; }
    public decimal? PrecoPromocional { get; set; }
    public DateOnly? DataInicioPromocao { get; set; }
    public DateOnly? DataFimPromocao { get; set; }
}
