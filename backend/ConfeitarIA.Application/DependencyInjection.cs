using ConfeitarIA.Application.Interfaces;
using ConfeitarIA.Application.Services;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace ConfeitarIA.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        services.AddScoped<IInsumoService, InsumoService>();
        services.AddScoped<IRegistroCompraService, RegistroCompraService>();

        return services;
    }
}

