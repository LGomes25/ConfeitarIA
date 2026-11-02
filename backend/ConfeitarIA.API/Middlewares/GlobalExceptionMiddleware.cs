using System.Text.Json;
using ConfeitarIA.Domain.Exceptions;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace ConfeitarIA.API.Middlewares;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await TratarExcecaoAsync(context, ex);
        }
    }

    private async Task TratarExcecaoAsync(HttpContext context, Exception exception)
    {
        var problemDetails = new ProblemDetails
        {
            Instance = context.Request.Path
        };

        switch (exception)
        {
            case ValidationException validationException:
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                problemDetails.Status = StatusCodes.Status400BadRequest;
                problemDetails.Title = "Erro de validação dos dados.";
                problemDetails.Detail = "Um ou mais campos contêm valores inválidos.";
                problemDetails.Extensions["erros"] = validationException.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
                break;

            case EntityNotFoundException notFoundException:
                context.Response.StatusCode = StatusCodes.Status404NotFound;
                problemDetails.Status = StatusCodes.Status404NotFound;
                problemDetails.Title = "Recurso não encontrado.";
                problemDetails.Detail = notFoundException.Message;
                break;

            case BusinessRuleException businessException:
                context.Response.StatusCode = StatusCodes.Status422UnprocessableEntity;
                problemDetails.Status = StatusCodes.Status422UnprocessableEntity;
                problemDetails.Title = "Regra de negócio violada.";
                problemDetails.Detail = businessException.Message;
                break;

            case DomainException domainException:
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                problemDetails.Status = StatusCodes.Status400BadRequest;
                problemDetails.Title = "Erro de domínio.";
                problemDetails.Detail = domainException.Message;
                break;

            default:
                _logger.LogError(exception, "Erro interno não tratado durante o processamento da requisição: {Message}", exception.Message);
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                problemDetails.Status = StatusCodes.Status500InternalServerError;
                problemDetails.Title = "Erro interno do servidor.";
                problemDetails.Detail = "Ocorreu um erro interno inesperado. Por favor, tente novamente mais tarde.";
                break;
        }

        context.Response.ContentType = "application/problem+json";
        var json = JsonSerializer.Serialize(problemDetails, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}

