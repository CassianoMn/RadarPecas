namespace RadarPecas.Domain.Entities;

public class EstoqueLoja
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid LojaId { get; set; }
    public int PecaId { get; set; }
    public int QuantidadeEstoque { get; set; } = 0;
    public int AlertaEstoqueMinimo { get; set; } = 5;
    public decimal PrecoVenda { get; set; }
    public bool EmPromocao { get; set; } = false;
    public decimal? PrecoPromocional { get; set; }
    public DateOnly? DataInicioPromocao { get; set; }
    public DateOnly? DataFimPromocao { get; set; }
    public DateTime DataAtualizacao { get; set; } = DateTime.UtcNow;

    // Relacionamentos
    public virtual Loja? Loja { get; set; }
    public virtual Peca? Peca { get; set; }
    public virtual ICollection<EstatisticaOferta> Estatisticas { get; set; } = new List<EstatisticaOferta>();

    // Propriedade calculada de preço efetivo
    public decimal PrecoEfetivo
    {
        get
        {
            if (EmPromocao && PrecoPromocional.HasValue)
            {
                var hoje = DateOnly.FromDateTime(DateTime.UtcNow);
                var inicioOk = !DataInicioPromocao.HasValue || DataInicioPromocao.Value <= hoje;
                var fimOk = !DataFimPromocao.HasValue || DataFimPromocao.Value >= hoje;
                if (inicioOk && fimOk)
                {
                    return PrecoPromocional.Value;
                }
            }
            return PrecoVenda;
        }
    }

    public bool PromocaoAtiva
    {
        get
        {
            if (!EmPromocao || !PrecoPromocional.HasValue) return false;
            var hoje = DateOnly.FromDateTime(DateTime.UtcNow);
            var inicioOk = !DataInicioPromocao.HasValue || DataInicioPromocao.Value <= hoje;
            var fimOk = !DataFimPromocao.HasValue || DataFimPromocao.Value >= hoje;
            return inicioOk && fimOk;
        }
    }
}
