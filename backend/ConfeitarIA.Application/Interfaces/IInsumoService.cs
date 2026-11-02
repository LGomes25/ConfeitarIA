using ConfeitarIA.Application.DTOs;

namespace ConfeitarIA.Application.Interfaces;

public interface IInsumoService
{
    Task<InsumoDto> CriarAsync(CriarInsumoRequest request, CancellationToken cancellationToken = default);
    Task<InsumoDto> AtualizarAsync(int id, AtualizarInsumoRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<InsumoDto>> ListarAsync(bool? apenasAtivos = true, CancellationToken cancellationToken = default);
    Task<InsumoDetalheDto> ObterDetalhePorIdAsync(int id, CancellationToken cancellationToken = default);
    Task InativarAsync(int id, CancellationToken cancellationToken = default);
    Task ReativarAsync(int id, CancellationToken cancellationToken = default);
}

