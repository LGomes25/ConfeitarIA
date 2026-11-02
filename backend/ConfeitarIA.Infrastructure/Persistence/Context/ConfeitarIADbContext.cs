using ConfeitarIA.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ConfeitarIA.Infrastructure.Persistence.Context;

public class ConfeitarIADbContext : DbContext
{
    public ConfeitarIADbContext(DbContextOptions<ConfeitarIADbContext> options) : base(options)
    {
    }

    public DbSet<Insumo> Insumos => Set<Insumo>();
    public DbSet<RegistroCompra> RegistrosCompra => Set<RegistroCompra>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ConfeitarIADbContext).Assembly);
    }
}

