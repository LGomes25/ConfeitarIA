using ConfeitarIA.Domain.Entities;

namespace ConfeitarIA.Domain.Models;

public record InsumoComCusto(
    Insumo Insumo,
    decimal? CustoUnitario
);

