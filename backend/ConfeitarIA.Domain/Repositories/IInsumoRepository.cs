using ConfeitarIA.Domain.Entities;
using ConfeitarIA.Domain.Models;

namespace ConfeitarIA.Domain.Repositories;

public interface IInsumoRepository
{
    Task<Insumo?> ObterPorIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Insumo?> ObterPorNomeAsync(string nome, CancellationToken cancellationToken = default);
    Task<bool> ExisteComNomeAsync(string nome, int? ignorarId = null, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Insumo>> ListarAsync(bool? apenasAtivos = true, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<InsumoComCusto>> ListarComCustoAsync(bool? apenasAtivos = true, CancellationToken cancellationToken = default);
    Task AdicionarAsync(Insumo insumo, CancellationToken cancellationToken = default);
    void Atualizar(Insumo insumo);
}
