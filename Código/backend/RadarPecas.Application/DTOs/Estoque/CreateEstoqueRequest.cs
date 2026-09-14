namespace RadarPecas.Application.DTOs.Estoque;

public class CreateEstoqueRequest
{
    public Guid LojaId { get; set; }
    public int PecaId { get; set; }
    public int QuantidadeEstoque { get; set; }
    public int AlertaEstoqueMinimo { get; set; } = 5;
    public decimal PrecoVenda { get; set; }
    public bool EmPromocao { get; set; } = false;
    public decimal? PrecoPromocional { get; set; }
    public DateOnly? DataInicioPromocao { get; set; }
    public DateOnly? DataFimPromocao { get; set; }
}
