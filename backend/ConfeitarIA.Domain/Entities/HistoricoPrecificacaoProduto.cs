using ConfeitarIA.Domain.Exceptions;

namespace ConfeitarIA.Domain.Entities;

public class HistoricoPrecificacaoProduto
{
    protected HistoricoPrecificacaoProduto() { }

    public HistoricoPrecificacaoProduto(int produtoId, decimal custoTotal, decimal precoVendaFinal)
    {
        if (produtoId <= 0)
            throw new BusinessRuleException("Produto informado é inválido.");
        if (custoTotal < 0 || precoVendaFinal < 0)
            throw new BusinessRuleException("Custo e preço de venda não podem ser negativos.");

        ProdutoId = produtoId;
        DataRegistro = DateTime.UtcNow;
        CustoTotal = Arredondar(custoTotal);
        PrecoVendaFinal = Arredondar(precoVendaFinal);
        MargemLucro = CustoTotal == 0m
            ? 0m
            : Arredondar((PrecoVendaFinal - CustoTotal) / CustoTotal * 100m);
    }

    public int Id { get; protected set; }
    public int ProdutoId { get; protected set; }
    public Produto Produto { get; protected set; } = null!;
    public DateTime DataRegistro { get; protected set; }
    public decimal CustoTotal { get; protected set; }
    public decimal PrecoVendaFinal { get; protected set; }
    public decimal MargemLucro { get; protected set; }

    private static decimal Arredondar(decimal valor) =>
        Math.Round(valor, 4, MidpointRounding.AwayFromZero);
}
