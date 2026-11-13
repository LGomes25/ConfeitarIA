using ConfeitarIA.Domain.Repositories;
using ConfeitarIA.Application.Interfaces;
using ConfeitarIA.Infrastructure.Notifications;
using ConfeitarIA.Infrastructure.Persistence.Entities;
using ConfeitarIA.Infrastructure.Persistence.Context;
using ConfeitarIA.Infrastructure.Persistence.Repositories;
using ConfeitarIA.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
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

        services.AddIdentityCore<ApplicationUser>(options =>
            {
                options.User.RequireUniqueEmail = true;
                options.SignIn.RequireConfirmedEmail = false;
                options.Lockout.MaxFailedAccessAttempts = 5;
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(10);
                options.Lockout.AllowedForNewUsers = true;
                options.Password.RequiredLength = 6;
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireUppercase = false;
                options.Password.RequireNonAlphanumeric = false;
            })
            .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<ConfeitarIADbContext>()
            .AddDefaultTokenProviders();

        services.AddHttpClient();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IInsumoRepository, InsumoRepository>();
        services.AddScoped<IRegistroCompraRepository, RegistroCompraRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<Fase4Service>();
        services.AddScoped<IComponentesService>(provider => provider.GetRequiredService<Fase4Service>());
        services.AddScoped<IReceitasCompletasService>(provider => provider.GetRequiredService<Fase4Service>());
        services.AddScoped<IProdutosService>(provider => provider.GetRequiredService<Fase4Service>());
        services.AddScoped<IPrecificacaoService>(provider => provider.GetRequiredService<Fase4Service>());

        return services;
    }
}
