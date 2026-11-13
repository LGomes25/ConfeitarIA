using ConfeitarIA.Application.DTOs;
using ConfeitarIA.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConfeitarIA.API.Controllers;

[ApiController]
[Route("api/relatorios/custos-e-precos")]
[Authorize(Roles = "Admin,Manager")]
public sealed class RelatoriosController(IPrecificacaoService service) : ControllerBase
{
    /// <summary>Lista custos e preços de produtos ativos com filtros opcionais.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<RelatorioCustoDto>), StatusCodes.Status200OK)]
    public Task<IReadOnlyList<RelatorioCustoDto>> Listar(
        [FromQuery] bool? alerta, [FromQuery] bool? margemAbaixoSugerida, CancellationToken ct) =>
        service.RelatorioAsync(alerta, margemAbaixoSugerida, ct);

    /// <summary>Exporta relatório filtrado como CSV UTF-8.</summary>
    [HttpGet("exportar")]
    [Produces("text/csv")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Exportar(
        [FromQuery] bool? alerta, [FromQuery] bool? margemAbaixoSugerida, CancellationToken ct)
    {
        var file = await service.ExportarAsync(alerta, margemAbaixoSugerida, ct);
        return File(file, "text/csv; charset=utf-8", "custos-e-precos.csv");
    }
}
