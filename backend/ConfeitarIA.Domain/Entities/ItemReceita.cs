using ConfeitarIA.Domain.Exceptions;

namespace ConfeitarIA.Domain.Entities;

public class ItemReceita
{
    protected ItemReceita() { }

    public ItemReceita(int? receitaCompletaId, int? componenteId, int? insumoId, decimal quantidade, decimal valorUnitarioNoCusto)
    {
        var ingrediente = insumoId.HasValue && (receitaCompletaId.HasValue ^ componenteId.HasValue);
        var componenteDaReceita = receitaCompletaId.HasValue && componenteId.HasValue && !insumoId.HasValue;
        if (!ingrediente && !componenteDaReceita)
            throw new BusinessRuleException("Informe um insumo ou um componente dentro da receita.");
        if ((insumoId.HasValue && insumoId <= 0) || quantidade <= 0 || valorUnitarioNoCusto < 0)
            throw new BusinessRuleException("Item, quantidade e custo unitário informados são inválidos.");
        ReceitaCompletaId = receitaCompletaId;
        ComponenteId = componenteId;
        InsumoId = insumoId;
        Quantidade = quantidade;
        ValorUnitarioNoCusto = valorUnitarioNoCusto;
        DataCriacao = DateTime.UtcNow;
        DataUltimaAlteracao = DataCriacao;
    }

    public int Id { get; protected set; }
    public int? ReceitaCompletaId { get; protected set; }
    public ReceitaCompleta? ReceitaCompleta { get; protected set; }
    public int? ComponenteId { get; protected set; }
    public Componente? Componente { get; protected set; }
    public int? InsumoId { get; protected set; }
    public Insumo? Insumo { get; protected set; }
    public decimal Quantidade { get; protected set; }
    public decimal ValorUnitarioNoCusto { get; protected set; }
    public decimal CustoItem { get; protected set; }
    public DateTime DataCriacao { get; protected set; }
    public DateTime DataUltimaAlteracao { get; protected set; }

    public void Atualizar(decimal quantidade, decimal valorUnitarioNoCusto)
    {
        if (quantidade <= 0 || valorUnitarioNoCusto < 0)
            throw new BusinessRuleException("Quantidade deve ser maior que zero e custo unitário não pode ser negativo.");
        Quantidade = quantidade;
        ValorUnitarioNoCusto = valorUnitarioNoCusto;
        DataUltimaAlteracao = DateTime.UtcNow;
    }
}
