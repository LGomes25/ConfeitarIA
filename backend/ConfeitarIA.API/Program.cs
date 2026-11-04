using System.Reflection;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using ConfeitarIA.API.Services;
using ConfeitarIA.API.Middlewares;
using ConfeitarIA.Application;
using ConfeitarIA.Infrastructure;
using ConfeitarIA.Infrastructure.Persistence.Context;
using ConfeitarIA.Infrastructure.Persistence.Entities;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

var jwtSecret = builder.Configuration["Jwt:Secret"];
if (string.IsNullOrWhiteSpace(jwtSecret) && builder.Environment.IsDevelopment())
{
    jwtSecret = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
    builder.Configuration["Jwt:Secret"] = jwtSecret;
    Console.WriteLine("JWT: chave efêmera gerada para este processo de desenvolvimento.");
}
if (string.IsNullOrWhiteSpace(jwtSecret) || Encoding.UTF8.GetByteCount(jwtSecret) < 32)
{
    throw new InvalidOperationException("Configure Jwt:Secret com pelo menos 32 bytes antes de iniciar a API.");
}

// Configuração de Camadas DDD (Application e Infrastructure/Persistência)
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddScoped<JwtTokenService>();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30),
            NameClaimType = System.Security.Claims.ClaimTypes.Name,
            RoleClaimType = System.Security.Claims.ClaimTypes.Role
        };
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                var userId = context.Principal?.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrWhiteSpace(userId))
                {
                    context.Fail("Token sem identificador de usuário.");
                    return;
                }

                await using var scope = context.HttpContext.RequestServices.CreateAsyncScope();
                var db = scope.ServiceProvider.GetRequiredService<ConfeitarIADbContext>();
                var user = await db.Users.AsNoTracking()
                    .Where(item => item.Id == userId)
                    .Select(item => new { item.Ativo, item.SenhaTemporaria })
                    .SingleOrDefaultAsync(context.HttpContext.RequestAborted);
                if (user is null || !user.Ativo)
                {
                    context.Fail("Conta indisponível.");
                    return;
                }

                var temporaryPasswordClaim = context.Principal!.FindFirstValue("senhaTemporaria") == "true";
                if (user.SenhaTemporaria != temporaryPasswordClaim)
                {
                    context.Fail("O estado da senha foi alterado. Entre novamente.");
                    return;
                }

                var currentRoles = await (
                    from userRole in db.UserRoles
                    join role in db.Roles on userRole.RoleId equals role.Id
                    where userRole.UserId == userId
                    select role.Name!)
                    .ToArrayAsync(context.HttpContext.RequestAborted);
                var tokenRoles = context.Principal!.FindAll(ClaimTypes.Role)
                    .Select(claim => claim.Value)
                    .ToHashSet(StringComparer.Ordinal);
                if (!tokenRoles.SetEquals(currentRoles))
                {
                    context.Fail("As permissões da conta foram alteradas. Renove sua sessão.");
                    return;
                }

                var refreshTokenHash = context.Principal.FindFirstValue("rtid");
                var hasActiveSession = !string.IsNullOrWhiteSpace(refreshTokenHash)
                    && await db.RefreshTokens.AsNoTracking().AnyAsync(
                        token => token.Token == refreshTokenHash
                            && token.UsuarioId == userId
                            && token.RevogadoEm == null
                            && token.ExpiraEm > DateTime.UtcNow,
                        context.HttpContext.RequestAborted);
                if (!hasActiveSession)
                {
                    context.Fail("Sua sessão foi encerrada. Entre novamente.");
                }
            },
            OnForbidden = async context =>
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                context.Response.ContentType = "application/problem+json";
                await context.Response.WriteAsync(JsonSerializer.Serialize(new
                {
                    type = "about:blank",
                    title = "Acesso não permitido",
                    status = StatusCodes.Status403Forbidden,
                    detail = "Você não tem permissão para acessar este recurso."
                }));
            }
        };
    });
builder.Services.AddAuthorization();

// Configuração de Controllers e Serialização
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configuração do Swagger / OpenAPI
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ConfeitarIA API",
        Version = "v1",
        Description = "API RESTful do ConfeitarIA — Gestão de Insumos, Histórico de Compras e Evolução de Preços."
    });
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Informe o access token JWT."
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });

    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFilename);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});

// Configuração de CORS para comunicação com o Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Middleware Global de Tratamento de Exceções (ProblemDetails RFC 7807)
app.UseMiddleware<GlobalExceptionMiddleware>();

// Swagger habilitado tanto em desenvolvimento quanto para testes
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "ConfeitarIA API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseMiddleware<TemporaryPasswordMiddleware>();
app.UseAuthorization();

app.MapControllers();

// Redireciona a raiz e variações diretamente para a página do Swagger UI
app.MapGet("/", () => Results.Redirect("/swagger/index.html"));
app.MapGet("/swagger", () => Results.Redirect("/swagger/index.html"));

await ApplyMigrationsAndSeedAdminAsync(app);

app.Run();

static async Task ApplyMigrationsAndSeedAdminAsync(WebApplication app)
{
    await using var scope = app.Services.CreateAsyncScope();
    var db = scope.ServiceProvider.GetRequiredService<ConfeitarIADbContext>();
    await db.Database.MigrateAsync();

    var roles = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    foreach (var roleName in new[] { "Admin", "Manager", "Team", "Customer" })
    {
        if (!await roles.RoleExistsAsync(roleName))
        {
            var result = await roles.CreateAsync(new IdentityRole(roleName));
            if (!result.Succeeded)
            {
                throw new InvalidOperationException($"Não foi possível criar o perfil {roleName}.");
            }
        }
    }

    var users = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
    if (await users.Users.AnyAsync(user => user.UserName == "admin@confeitaria.local"))
    {
        return;
    }

    var temporaryPassword =
        $"Aa1{Convert.ToBase64String(RandomNumberGenerator.GetBytes(24)).Replace("+", "").Replace("/", "").Replace("=", "")}";
    var admin = new ApplicationUser
    {
        UserName = "admin@confeitaria.local",
        Email = "admin@confeitaria.local",
        EmailConfirmed = true,
        NomeApelido = "Administrador",
        Ativo = true,
        SenhaTemporaria = true,
        LockoutEnabled = true
    };
    var createResult = await users.CreateAsync(admin, temporaryPassword);
    if (!createResult.Succeeded)
    {
        throw new InvalidOperationException("Não foi possível criar o usuário Admin inicial: "
            + string.Join(", ", createResult.Errors.Select(error => error.Code)));
    }
    var roleResult = await users.AddToRoleAsync(admin, "Admin");
    if (!roleResult.Succeeded)
    {
        throw new InvalidOperationException("Não foi possível atribuir o perfil Admin inicial.");
    }

    Console.WriteLine("Usuário Admin inicial criado; altere a senha no primeiro acesso.");
    Console.WriteLine("Email inicial: admin@confeitaria.local");
    Console.WriteLine($"Senha temporária inicial: {temporaryPassword}");
}

// Necessário para testes de integração WebApplicationFactory caso venham a ser criados
public partial class Program { }
