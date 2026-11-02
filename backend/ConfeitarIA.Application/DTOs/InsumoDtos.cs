namespace ConfeitarIA.Application.DTOs;

public record InsumoDto(
    int Id,
    string Nome,
    string UnidadeMedida,
    bool Ativo,
    decimal? CustoUnitario,
    DateTime DataCriacao
)
{
    // Alias para compatibilidade caso o consumidor utilize valorUnitarioAtual
    public decimal? ValorUnitarioAtual => CustoUnitario;
}

public record InsumoDetalheDto(
    int Id,
    string Nome,
    string UnidadeMedida,
    bool Ativo,
    DateTime DataCriacao,
    decimal? CustoUnitario,
    UltimoRegistroCompraDto? UltimoRegistro
)
{
    // Alias para compatibilidade caso o consumidor utilize valorUnitarioAtual
    public decimal? ValorUnitarioAtual => CustoUnitario;
}

public record CriarInsumoRequest(
    string Nome,
    string UnidadeMedida
);

public record AtualizarInsumoRequest(
    string Nome,
    string UnidadeMedida
);
