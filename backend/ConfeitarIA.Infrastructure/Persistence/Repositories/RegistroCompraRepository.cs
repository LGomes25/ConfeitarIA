using ConfeitarIA.Domain.Entities;
using ConfeitarIA.Domain.Repositories;
using ConfeitarIA.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace ConfeitarIA.Infrastructure.Persistence.Repositories;

public class RegistroCompraRepository : IRegistroCompraRepository
{
    private readonly ConfeitarIADbContext _context;

    public RegistroCompraRepository(ConfeitarIADbContext context)
    {
        _context = context;
    }

    public async Task<RegistroCompra?> ObterPorIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.RegistrosCompra
            .Include(r => r.Insumo)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<RegistroCompra>> ListarPorInsumoAsync(int insumoId, CancellationToken cancellationToken = default)
    {
        return await _context.RegistrosCompra
            .AsNoTracking()
            .Where(r => r.InsumoId == insumoId)
            .OrderByDescending(r => r.DataCompra)
            .ThenByDescending(r => r.Id)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<RegistroCompra>> ObterHistoricoUltimos12MesesAsync(int insumoId, DateOnly dataReferencia, CancellationToken cancellationToken = default)
    {
        var dataLimite = dataReferencia.AddYears(-1);

        return await _context.RegistrosCompra
            .AsNoTracking()
            .Where(r => r.InsumoId == insumoId && r.DataCompra >= dataLimite && r.DataCompra <= dataReferencia)
            .OrderBy(r => r.DataCompra)
            .ThenBy(r => r.Id)
            .ToListAsync(cancellationToken);
    }

    public async Task<RegistroCompra?> ObterUltimoRegistroAsync(int insumoId, CancellationToken cancellationToken = default)
    {
        return await _context.RegistrosCompra
            .AsNoTracking()
            .Where(r => r.InsumoId == insumoId)
            .OrderByDescending(r => r.DataCompra)
            .ThenByDescending(r => r.Id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task AdicionarAsync(RegistroCompra registro, CancellationToken cancellationToken = default)
    {
        await _context.RegistrosCompra.AddAsync(registro, cancellationToken);
    }

    public void Remover(RegistroCompra registro)
    {
        _context.RegistrosCompra.Remove(registro);
    }
}

