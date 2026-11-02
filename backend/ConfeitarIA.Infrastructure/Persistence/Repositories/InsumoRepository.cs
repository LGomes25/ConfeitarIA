using ConfeitarIA.Domain.Entities;
using ConfeitarIA.Domain.Models;
using ConfeitarIA.Domain.Repositories;
using ConfeitarIA.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace ConfeitarIA.Infrastructure.Persistence.Repositories;

public class InsumoRepository : IInsumoRepository
{
    private readonly ConfeitarIADbContext _context;

    public InsumoRepository(ConfeitarIADbContext context)
    {
        _context = context;
    }

    public async Task<Insumo?> ObterPorIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Insumos
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken);
    }

    public async Task<Insumo?> ObterPorNomeAsync(string nome, CancellationToken cancellationToken = default)
    {
        var nomeFormatado = nome.Trim().ToLower();
        return await _context.Insumos
            .FirstOrDefaultAsync(i => i.Nome.ToLower() == nomeFormatado, cancellationToken);
    }

    public async Task<bool> ExisteComNomeAsync(string nome, int? ignorarId = null, CancellationToken cancellationToken = default)
    {
        var nomeFormatado = nome.Trim().ToLower();
        var query = _context.Insumos.AsNoTracking().Where(i => i.Nome.ToLower() == nomeFormatado);

        if (ignorarId.HasValue)
            query = query.Where(i => i.Id != ignorarId.Value);

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Insumo>> ListarAsync(bool? apenasAtivos = true, CancellationToken cancellationToken = default)
    {
        var query = _context.Insumos.AsNoTracking();

        if (apenasAtivos.HasValue)
        {
            query = query.Where(i => i.Ativo == apenasAtivos.Value);
        }

        return await query
            .OrderBy(i => i.Nome)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<InsumoComCusto>> ListarComCustoAsync(bool? apenasAtivos = true, CancellationToken cancellationToken = default)
    {
        var query = _context.Insumos.AsNoTracking();

        if (apenasAtivos.HasValue)
        {
            query = query.Where(i => i.Ativo == apenasAtivos.Value);
        }

        var dados = await query
            .OrderBy(i => i.Nome)
            .Select(i => new
            {
                Insumo = i,
                CustoUnitario = i.RegistrosCompra
                    .OrderByDescending(r => r.DataCompra)
                    .ThenByDescending(r => r.Id)
                    .Select(r => (decimal?)r.ValorUnitario)
                    .FirstOrDefault()
            })
            .ToListAsync(cancellationToken);

        return dados.Select(d => new InsumoComCusto(d.Insumo, d.CustoUnitario)).ToList();
    }

    public async Task AdicionarAsync(Insumo insumo, CancellationToken cancellationToken = default)
    {
        await _context.Insumos.AddAsync(insumo, cancellationToken);
    }

    public void Atualizar(Insumo insumo)
    {
        _context.Insumos.Update(insumo);
    }
}
