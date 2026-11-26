using ConfeitarIA.Domain.Exceptions;

namespace ConfeitarIA.Domain.Entities;

public class ItemExtraProduto
{
    protected ItemExtraProduto() => DescricaoItem = string.Empty;

    public ItemExtraProduto(int produtoId, int? insumoId, string? descricaoItem, decimal? quantidade, decimal valorUnitario)
        : this()
    {
        Atualizar(insumoId, descricaoItem, quantidade, valorUnitario);
        if (produtoId <= 0)
            throw new BusinessRuleException("Produto informado é inválido.");
        ProdutoId = produtoId;
        DataCriacao = DateTime.UtcNow;
        DataUltimaAlteracao = DataCriacao;
    }

    public int Id { get; protected set; }
    public int ProdutoId { get; protected set; }
    public Produto Produto { get; protected set; } = null!;
    public int? InsumoId { get; protected set; }
    public Insumo? Insumo { get; protected set; }
    public string? DescricaoItem { get; protected set; }
    public decimal? Quantidade { get; protected set; }
    public decimal ValorUnitario { get; protected set; }
    public decimal CustoItem { get; protected set; }
    public DateTime DataCriacao { get; protected set; }
    public DateTime DataUltimaAlteracao { get; protected set; }

    public void Atualizar(int? insumoId, string? descricaoItem, decimal? quantidade, decimal valorUnitario)
    {
        if (valorUnitario < 0)
            throw new BusinessRuleException("O valor unitário não pode ser negativo.");
        if (insumoId.HasValue)
        {
            if (insumoId <= 0 || quantidade is null or <= 0 || !string.IsNullOrWhiteSpace(descricaoItem))
                throw new BusinessRuleException("Para item cadastrado, informe quantidade positiva e não informe descrição livre.");
            DescricaoItem = null;
        }
        else
        {
            if (string.IsNullOrWhiteSpace(descricaoItem) || descricaoItem.Trim().Length > 200 || quantidade.HasValue)
                throw new BusinessRuleException("Item livre requer descrição de até 200 caracteres e não aceita quantidade.");
            DescricaoItem = descricaoItem.Trim();
        }
        InsumoId = insumoId;
        Quantidade = quantidade;
        ValorUnitario = valorUnitario;
        DataUltimaAlteracao = DateTime.UtcNow;
    }
}
