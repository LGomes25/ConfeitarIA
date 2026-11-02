using ConfeitarIA.Domain.Exceptions;

namespace ConfeitarIA.Domain.Entities;

public class RegistroCompra
{
    // Construtor sem parâmetros para o EF Core
    protected RegistroCompra()
    {
    }

    public RegistroCompra(int insumoId, DateOnly dataCompra, decimal quantidade, decimal valorTotal, string? fornecedor = null)
    {
        if (quantidade <= 0)
            throw new BusinessRuleException("A quantidade comprada deve ser maior que zero.");

        if (valorTotal < 0)
            throw new BusinessRuleException("O valor total não pode ser negativo.");

        InsumoId = insumoId;
        DataCompra = dataCompra;
        Quantidade = quantidade;
        ValorTotal = valorTotal;
        Fornecedor = string.IsNullOrWhiteSpace(fornecedor) ? null : fornecedor.Trim();
        DataCriacao = DateTime.UtcNow;

        // Cálculo em memória para conveniência antes da persistência;
        // o banco de dados recalcula e armazena via coluna gerada STORED.
        ValorUnitario = quantidade > 0 ? Math.Round(valorTotal / quantidade, 6) : 0m;
    }

    public int Id { get; protected set; }
    public int InsumoId { get; protected set; }
    public virtual Insumo Insumo { get; protected set; } = null!;
    public DateOnly DataCompra { get; protected set; }
    public decimal Quantidade { get; protected set; }
    public decimal ValorTotal { get; protected set; }
    public decimal ValorUnitario { get; protected set; }
    public string? Fornecedor { get; protected set; }
    public DateTime DataCriacao { get; protected set; }
}

