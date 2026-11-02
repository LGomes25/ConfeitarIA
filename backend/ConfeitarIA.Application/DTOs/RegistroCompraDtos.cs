namespace ConfeitarIA.Application.DTOs;

public record RegistroCompraDto(
    int Id,
    int InsumoId,
    string InsumoNome,
    string UnidadeMedida,
    DateOnly DataCompra,
    decimal Quantidade,
    decimal ValorTotal,
    decimal ValorUnitario,
    string? Fornecedor,
    DateTime DataCriacao
)
{
    // Alias para normalização de custo unitário em todos os endpoints
    public decimal CustoUnitario => ValorUnitario;
}

public record UltimoRegistroCompraDto(
    int Id,
    DateOnly DataCompra,
    decimal Quantidade,
    string UnidadeMedida,
    decimal ValorTotal,
    decimal ValorUnitario,
    string? Fornecedor
)
{
    // Alias para normalização de custo unitário
    public decimal CustoUnitario => ValorUnitario;
}

public record CriarRegistroCompraRequest(
    int InsumoId,
    DateOnly DataCompra,
    decimal Quantidade,
    decimal ValorTotal,
    string? Fornecedor
);

public record PontoGraficoPrecoDto(
    DateOnly DataCompra,
    decimal ValorUnitario,
    decimal Quantidade,
    decimal ValorTotal,
    string? Fornecedor
)
{
    public decimal CustoUnitario => ValorUnitario;
}

public record GraficoEvolucaoPrecosDto(
    int InsumoId,
    string InsumoNome,
    string UnidadeMedida,
    bool InsumoAtivo,
    decimal? PrecoAtual,
    IReadOnlyList<PontoGraficoPrecoDto> Pontos
)
{
    // Normalização com a nomenclatura de custo unitário
    public decimal? CustoUnitarioAtual => PrecoAtual;
}
