using ConfeitarIA.Domain.Repositories;
using ConfeitarIA.Infrastructure.Persistence.Context;
using ConfeitarIA.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ConfeitarIA.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? "Host=localhost;Port=5432;Database=confeitaria_dev;Username=postgres;Password=postgres";

        services.AddDbContext<ConfeitarIADbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddScoped<IInsumoRepository, InsumoRepository>();
        services.AddScoped<IRegistroCompraRepository, RegistroCompraRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        return services;
    }
}

