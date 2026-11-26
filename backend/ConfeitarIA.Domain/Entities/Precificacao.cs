using ConfeitarIA.Domain.Exceptions;

namespace ConfeitarIA.Domain.Entities;

public class Precificacao
{
    protected Precificacao() { }

    public Precificacao(int produtoId, decimal custoTotalInsumos, int? tempoMaoObraMinutos, decimal? valorHoraMaoObra)
    {
        ProdutoId = produtoId;
        AtualizarCustos(custoTotalInsumos, tempoMaoObraMinutos, valorHoraMaoObra, false);
        MargemSugeridaPercentual = 100m;
        PrecoSugerido = Arredondar(CustoTotal * 2m);
        PrecoVendaFinal = PrecoSugerido;
        RecalcularLucroEMargens();
        DataUltimaAtualizacao = DateTime.UtcNow;
    }

    public int Id { get; protected set; }
    public int ProdutoId { get; protected set; }
    public Produto Produto { get; protected set; } = null!;
    public decimal CustoTotalInsumos { get; protected set; }
    public int? TempoMaoObraMinutos { get; protected set; }
    public decimal? ValorHoraMaoObra { get; protected set; }
    public decimal? CustoMaoDeObra { get; protected set; }
    public decimal? CustoTotalAnterior { get; protected set; }
    public decimal CustoTotal { get; protected set; }
    public decimal? VariacaoCustoPercentual { get; protected set; }
    public bool AlertaVariacaoPreco { get; protected set; }
    public decimal MargemSugeridaPercentual { get; protected set; }
    public decimal PrecoSugerido { get; protected set; }
    public decimal PrecoVendaFinal { get; protected set; }
    public decimal LucroBruto { get; protected set; }
    public decimal MargemRealSobreCusto { get; protected set; }
    public decimal MargemRealSobreVenda { get; protected set; }
    public DateTime DataUltimaAtualizacao { get; protected set; }

    public void AtualizarCustos(decimal custoTotalInsumos, int? tempoMaoObraMinutos, decimal? valorHoraMaoObra, bool preservarAlerta = true)
    {
        if (custoTotalInsumos < 0 || tempoMaoObraMinutos < 0 || valorHoraMaoObra < 0)
            throw new BusinessRuleException("Custos e tempo de mão de obra não podem ser negativos.");
        var custoAnterior = CustoTotal;
        CustoTotalAnterior = Id == 0 ? null : custoAnterior;
        CustoTotalInsumos = Arredondar(custoTotalInsumos);
        TempoMaoObraMinutos = tempoMaoObraMinutos;
        ValorHoraMaoObra = valorHoraMaoObra;
        CustoMaoDeObra = tempoMaoObraMinutos.HasValue && valorHoraMaoObra.HasValue
            ? Arredondar(tempoMaoObraMinutos.Value / 60m * valorHoraMaoObra.Value)
            : null;
        CustoTotal = Arredondar(CustoTotalInsumos + (CustoMaoDeObra ?? 0m));

        if (Id != 0 && custoAnterior > 0m)
        {
            VariacaoCustoPercentual = Arredondar((CustoTotal - custoAnterior) / custoAnterior * 100m);
            AlertaVariacaoPreco = preservarAlerta && (AlertaVariacaoPreco || Math.Abs(VariacaoCustoPercentual.Value) >= 5m);
        }
        else
        {
            VariacaoCustoPercentual = null;
            AlertaVariacaoPreco = false;
        }

        RecalcularPrecoSugerido();
        RecalcularLucroEMargens();
        DataUltimaAtualizacao = DateTime.UtcNow;
    }

    public void AtualizarPrecoFinal(decimal precoVendaFinal)
    {
        if (precoVendaFinal < 0)
            throw new BusinessRuleException("O preço de venda final não pode ser negativo.");
        PrecoVendaFinal = Arredondar(precoVendaFinal);
        AlertaVariacaoPreco = false;
        RecalcularLucroEMargens();
        DataUltimaAtualizacao = DateTime.UtcNow;
    }

    private void RecalcularPrecoSugerido() =>
        PrecoSugerido = Arredondar(CustoTotal * (1m + MargemSugeridaPercentual / 100m));

    private void RecalcularLucroEMargens()
    {
        LucroBruto = Arredondar(PrecoVendaFinal - CustoTotal);
        MargemRealSobreCusto = CustoTotal == 0m ? 0m : Arredondar(LucroBruto / CustoTotal * 100m);
        MargemRealSobreVenda = PrecoVendaFinal == 0m ? 0m : Arredondar(LucroBruto / PrecoVendaFinal * 100m);
    }

    private static decimal Arredondar(decimal valor) => Math.Round(valor, 2, MidpointRounding.AwayFromZero);
}
