using ConfeitarIA.Application.DTOs;
using ConfeitarIA.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConfeitarIA.API.Controllers;

[ApiController]
[Route("api/produtos/{id:int}")]
[Authorize(Roles = "Admin,Manager")]
public sealed class PrecificacaoController(IPrecificacaoService service) : ControllerBase
{
    /// <summary>Obtém custos, preço sugerido, preço final, margens e alerta.</summary>
    [HttpGet("precificacao")]
    [ProducesResponseType(typeof(PrecificacaoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PrecificacaoDto>> Obter(int id, CancellationToken ct)
    {
        var result = await service.ObterAsync(id, ct);
        return result is null ? NotFound() : Ok(result);
    }

    /// <summary>Atualiza preço final e, opcionalmente, custos de mão de obra.</summary>
    [HttpPut("precificacao")]
    [ProducesResponseType(typeof(PrecificacaoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PrecificacaoDto>> Atualizar(int id, AtualizarPrecificacaoRequest request, CancellationToken ct) =>
        Ok(await service.AtualizarAsync(id, request, ct));

    /// <summary>Lista todos os insumos individuais e destaca o conjunto responsável por aproximadamente 80% do custo.</summary>
    [HttpGet("composicao-custo")]
    [ProducesResponseType(typeof(ComposicaoCustoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ComposicaoCustoDto>> Composicao(int id, CancellationToken ct)
    {
        var result = await service.ObterComposicaoAsync(id, ct);
        return result is null ? NotFound() : Ok(result);
    }
}
