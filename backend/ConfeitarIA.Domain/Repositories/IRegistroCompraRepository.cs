using ConfeitarIA.Domain.Entities;

namespace ConfeitarIA.Domain.Repositories;

public interface IRegistroCompraRepository
{
    Task<RegistroCompra?> ObterPorIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<RegistroCompra>> ListarPorInsumoAsync(int insumoId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<RegistroCompra>> ObterHistoricoUltimos12MesesAsync(int insumoId, DateOnly dataReferencia, CancellationToken cancellationToken = default);
    Task<RegistroCompra?> ObterUltimoRegistroAsync(int insumoId, CancellationToken cancellationToken = default);
    Task AdicionarAsync(RegistroCompra registro, CancellationToken cancellationToken = default);
    void Remover(RegistroCompra registro);
}

