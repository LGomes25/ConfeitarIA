using ConfeitarIA.Domain.Exceptions;

namespace ConfeitarIA.Domain.Entities;

public class ProdutoComponente
{
    protected ProdutoComponente() { }

    public ProdutoComponente(int produtoId, int? componenteId, int? receitaCompletaId, int ordem)
    {
        if ((componenteId.HasValue ? 1 : 0) + (receitaCompletaId.HasValue ? 1 : 0) != 1)
            throw new BusinessRuleException("Informe exatamente um componente ou uma receita completa.");
        if (produtoId <= 0 || ordem < 0)
            throw new BusinessRuleException("Produto e ordem informados são inválidos.");
        ProdutoId = produtoId;
        ComponenteId = componenteId;
        ReceitaCompletaId = receitaCompletaId;
        Ordem = ordem;
        DataCriacao = DateTime.UtcNow;
        DataUltimaAlteracao = DataCriacao;
    }

    public int Id { get; protected set; }
    public int ProdutoId { get; protected set; }
    public Produto Produto { get; protected set; } = null!;
    public int? ComponenteId { get; protected set; }
    public Componente? Componente { get; protected set; }
    public int? ReceitaCompletaId { get; protected set; }
    public ReceitaCompleta? ReceitaCompleta { get; protected set; }
    public int Ordem { get; protected set; }
    public DateTime DataCriacao { get; protected set; }
    public DateTime DataUltimaAlteracao { get; protected set; }

    public void Atualizar(int? componenteId, int? receitaCompletaId, int ordem)
    {
        if ((componenteId.HasValue ? 1 : 0) + (receitaCompletaId.HasValue ? 1 : 0) != 1 || ordem < 0)
            throw new BusinessRuleException("Informe exatamente um componente ou receita e uma ordem não negativa.");
        ComponenteId = componenteId;
        ReceitaCompletaId = receitaCompletaId;
        Ordem = ordem;
        DataUltimaAlteracao = DateTime.UtcNow;
    }
}
