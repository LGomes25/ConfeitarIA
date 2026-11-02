using ConfeitarIA.Domain.Repositories;
using ConfeitarIA.Infrastructure.Persistence.Context;

namespace ConfeitarIA.Infrastructure.Persistence.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ConfeitarIADbContext _context;

    public UnitOfWork(ConfeitarIADbContext context)
    {
        _context = context;
    }

    public async Task<int> CommitAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }
}

