using ConfeitarIA.Application.DTOs;

namespace ConfeitarIA.Application.Interfaces;

public interface IRegistroCompraService
{
    Task<RegistroCompraDto> RegistrarCompraAsync(CriarRegistroCompraRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<RegistroCompraDto>> ListarPorInsumoAsync(int insumoId, CancellationToken cancellationToken = default);
    Task<GraficoEvolucaoPrecosDto> ObterGraficoEvolucaoPrecosAsync(int insumoId, CancellationToken cancellationToken = default);
    Task ExcluirRegistroAsync(int id, CancellationToken cancellationToken = default);
}

