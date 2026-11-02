using System.Reflection;
using ConfeitarIA.API.Middlewares;
using ConfeitarIA.Application;
using ConfeitarIA.Infrastructure;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Configuração de Camadas DDD (Application e Infrastructure/Persistência)
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

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

app.MapControllers();

// Redireciona a raiz e variações diretamente para a página do Swagger UI
app.MapGet("/", () => Results.Redirect("/swagger/index.html"));
app.MapGet("/swagger", () => Results.Redirect("/swagger/index.html"));

app.Run();

// Necessário para testes de integração WebApplicationFactory caso venham a ser criados
public partial class Program { }
