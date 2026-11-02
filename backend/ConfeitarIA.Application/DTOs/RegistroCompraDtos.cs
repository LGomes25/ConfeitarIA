namespace ConfeitarIA.Application.DTOs;

public record RegistroCompraDto(
    int Id,
    int InsumoId,
    string InsumoNome,
    DateOnly DataCompra,
    decimal Quantidade,
    decimal ValorTotal,
    decimal ValorUnitario,
    string? Fornecedor,
    DateTime DataCriacao
);

public record UltimoRegistroCompraDto(
    int Id,
    DateOnly DataCompra,
    decimal Quantidade,
    decimal ValorTotal,
    decimal ValorUnitario,
    string? Fornecedor
);

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
);

public record GraficoEvolucaoPrecosDto(
    int InsumoId,
    string InsumoNome,
    string UnidadeMedida,
    bool InsumoAtivo,
    decimal? PrecoAtual,
    IReadOnlyList<PontoGraficoPrecoDto> Pontos
);

