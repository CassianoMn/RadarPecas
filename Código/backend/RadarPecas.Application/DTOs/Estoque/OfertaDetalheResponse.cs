using RadarPecas.Application.DTOs.Garagem;
using RadarPecas.Application.DTOs.Lojas;
using RadarPecas.Application.DTOs.Pecas;

namespace RadarPecas.Application.DTOs.Estoque;

public class OfertaDetalheResponse
{
    public Guid EstoqueId { get; set; }
    public PecaResponse Peca { get; set; } = new();
    public LojaResponse Loja { get; set; } = new();
    public List<ModeloMotoResponse> Compatibilidades { get; set; } = new();
    public int QuantidadeEstoque { get; set; }
    public decimal PrecoVenda { get; set; }
    public bool EmPromocao { get; set; }
    public decimal? PrecoPromocional { get; set; }
    public decimal PrecoEfetivo { get; set; }
    public bool PromocaoAtiva { get; set; }
    public DateOnly? DataInicioPromocao { get; set; }
    public DateOnly? DataFimPromocao { get; set; }
    public decimal? DistanciaKm { get; set; }
    public int Visualizacoes { get; set; }
    public int Cliques { get; set; }
}
