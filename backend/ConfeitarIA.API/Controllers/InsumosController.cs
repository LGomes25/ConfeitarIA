using ConfeitarIA.Application.DTOs;
using ConfeitarIA.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConfeitarIA.API.Controllers;

[ApiController]
[Authorize(Roles = "Admin,Manager")]
[Route("api/[controller]")]
[Produces("application/json")]
public class InsumosController : ControllerBase
{
    private readonly IInsumoService _insumoService;
    private readonly IRegistroCompraService _registroCompraService;

    public InsumosController(IInsumoService insumoService, IRegistroCompraService registroCompraService)
    {
        _insumoService = insumoService;
        _registroCompraService = registroCompraService;
    }

    /// <summary>
    /// Lista os insumos cadastrados com suporte a filtro de status.
    /// </summary>
    /// <param name="status">Filtro de status: "ativos" (padrão), "inativos" ou "todos".</param>
    /// <param name="cancellationToken">Token de cancelamento.</param>
    /// <returns>Lista de insumos.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<InsumoDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<InsumoDto>>> Listar(
        [FromQuery] string? status = "ativos",
        CancellationToken cancellationToken = default)
    {
        bool? apenasAtivos = status?.ToLowerInvariant() switch
        {
            "inativos" => false,
            "todos" => null,
            _ => true
        };

        var insumos = await _insumoService.ListarAsync(apenasAtivos, cancellationToken);
        return Ok(insumos);
    }

    /// <summary>
    /// Obtém os detalhes de um insumo, incluindo dados cadastrais e último registro de compra.
    /// </summary>
    /// <param name="id">Identificador único do insumo.</param>
    /// <param name="cancellationToken">Token de cancelamento.</param>
    /// <returns>Dados detalhados do insumo.</returns>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(InsumoDetalheDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<InsumoDetalheDto>> ObterPorId(int id, CancellationToken cancellationToken)
    {
        var insumo = await _insumoService.ObterDetalhePorIdAsync(id, cancellationToken);
        return Ok(insumo);
    }

    /// <summary>
    /// Cadastra um novo insumo.
    /// </summary>
    /// <param name="request">Dados do insumo a ser criado.</param>
    /// <param name="cancellationToken">Token de cancelamento.</param>
    /// <returns>Insumo recém-criado.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(InsumoDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
    public async Task<ActionResult<InsumoDto>> Criar(
        [FromBody] CriarInsumoRequest request,
        CancellationToken cancellationToken)
    {
        var insumo = await _insumoService.CriarAsync(request, cancellationToken);
        return CreatedAtAction(nameof(ObterPorId), new { id = insumo.Id }, insumo);
    }

    /// <summary>
    /// Atualiza os dados de um insumo existente.
    /// </summary>
    /// <param name="id">Identificador do insumo.</param>
    /// <param name="request">Novos dados cadastrais.</param>
    /// <param name="cancellationToken">Token de cancelamento.</param>
    /// <returns>Insumo atualizado.</returns>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(InsumoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
    public async Task<ActionResult<InsumoDto>> Atualizar(
        int id,
        [FromBody] AtualizarInsumoRequest request,
        CancellationToken cancellationToken)
    {
        var insumo = await _insumoService.AtualizarAsync(id, request, cancellationToken);
        return Ok(insumo);
    }

    /// <summary>
    /// Inativa logicamente um insumo (soft delete). Nunca realiza exclusão física.
    /// </summary>
    /// <param name="id">Identificador do insumo.</param>
    /// <param name="cancellationToken">Token de cancelamento.</param>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Inativar(int id, CancellationToken cancellationToken)
    {
        await _insumoService.InativarAsync(id, cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Reativa um insumo previamente inativado.
    /// </summary>
    /// <param name="id">Identificador do insumo.</param>
    /// <param name="cancellationToken">Token de cancelamento.</param>
    [HttpPatch("{id:int}/reativar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Reativar(int id, CancellationToken cancellationToken)
    {
        await _insumoService.ReativarAsync(id, cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Lista o histórico de compras de um insumo específico.
    /// </summary>
    /// <param name="id">Identificador do insumo.</param>
    /// <param name="cancellationToken">Token de cancelamento.</param>
    /// <returns>Histórico cronológico de compras.</returns>
    [HttpGet("{id:int}/compras")]
    [ProducesResponseType(typeof(IReadOnlyList<RegistroCompraDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyList<RegistroCompraDto>>> ListarCompras(int id, CancellationToken cancellationToken)
    {
        var compras = await _registroCompraService.ListarPorInsumoAsync(id, cancellationToken);
        return Ok(compras);
    }

    /// <summary>
    /// Retorna os dados para exibição do gráfico de evolução de preços dos últimos 12 meses.
    /// </summary>
    /// <param name="id">Identificador do insumo.</param>
    /// <param name="cancellationToken">Token de cancelamento.</param>
    /// <returns>Série temporal e métricas de preços.</returns>
    [HttpGet("{id:int}/grafico-precos")]
    [ProducesResponseType(typeof(GraficoEvolucaoPrecosDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<GraficoEvolucaoPrecosDto>> ObterGraficoPrecos(int id, CancellationToken cancellationToken)
    {
        var dadosGrafico = await _registroCompraService.ObterGraficoEvolucaoPrecosAsync(id, cancellationToken);
        return Ok(dadosGrafico);
    }
}
