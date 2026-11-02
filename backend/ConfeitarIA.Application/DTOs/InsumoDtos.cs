namespace ConfeitarIA.Application.DTOs;

public record InsumoDto(
    int Id,
    string Nome,
    string UnidadeMedida,
    bool Ativo,
    DateTime DataCriacao
);

public record InsumoDetalheDto(
    int Id,
    string Nome,
    string UnidadeMedida,
    bool Ativo,
    DateTime DataCriacao,
    decimal? ValorUnitarioAtual,
    UltimoRegistroCompraDto? UltimoRegistro
);

public record CriarInsumoRequest(
    string Nome,
    string UnidadeMedida
);

public record AtualizarInsumoRequest(
    string Nome,
    string UnidadeMedida
);

