namespace RadarPecas.Application.DTOs.Estoque;

public class UpdateEstoqueRequest
{
    public int QuantidadeEstoque { get; set; }
    public int AlertaEstoqueMinimo { get; set; } = 5;
    public decimal PrecoVenda { get; set; }
}
