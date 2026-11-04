using System.Security.Claims;
using System.Text.Json;

namespace ConfeitarIA.API.Middlewares;

public sealed class TemporaryPasswordMiddleware
{
    private readonly RequestDelegate _next;

    public TemporaryPasswordMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var isTemporaryPassword = context.User.Identity?.IsAuthenticated == true
            && context.User.FindFirstValue("senhaTemporaria") == "true";
        var path = context.Request.Path;
        var isAllowed = path.StartsWithSegments("/api/auth")
            || path.StartsWithSegments("/api/meu-perfil");

        if (isTemporaryPassword && !isAllowed)
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            context.Response.ContentType = "application/problem+json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(new
            {
                type = "about:blank",
                title = "Troca de senha obrigatória",
                status = StatusCodes.Status403Forbidden,
                detail = "Crie uma nova senha para continuar."
            }));
            return;
        }

        await _next(context);
    }
}
