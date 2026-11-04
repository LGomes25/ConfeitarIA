using ConfeitarIA.Application.DTOs;
using ConfeitarIA.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConfeitarIA.API.Controllers;

[ApiController]
[Authorize(Roles = "Admin,Manager")]
[Route("api/[controller]")]
[Produces("application/json")]
public class ComprasController : ControllerBase
{
    private readonly IRegistroCompraService _registroCompraService;

    public ComprasController(IRegistroCompraService registroCompraService)
    {
        _registroCompraService = registroCompraService;
    }

    /// <summary>
    /// Registra uma nova compra vinculada a um insumo ativo.
    /// O valor unitário é calculado e persistido automaticamente pelo sistema/banco.
    /// </summary>
    /// <param name="request">Dados da compra (InsumoId, Data, Quantidade, Valor Total, Fornecedor).</param>
    /// <param name="cancellationToken">Token de cancelamento.</param>
    /// <returns>Registro de compra criado.</returns>
    [HttpPost]
    [ProducesResponseType(typeof(RegistroCompraDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
    public async Task<ActionResult<RegistroCompraDto>> RegistrarCompra(
        [FromBody] CriarRegistroCompraRequest request,
        CancellationToken cancellationToken)
    {
        var compra = await _registroCompraService.RegistrarCompraAsync(request, cancellationToken);
        return CreatedAtAction(
            actionName: "ListarCompras",
            controllerName: "Insumos",
            routeValues: new { id = compra.InsumoId },
            value: compra);
    }

    /// <summary>
    /// Exclui um registro individual de compra. Não remove o insumo associado.
    /// </summary>
    /// <param name="id">Identificador do registro de compra.</param>
    /// <param name="cancellationToken">Token de cancelamento.</param>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ExcluirCompra(int id, CancellationToken cancellationToken)
    {
        await _registroCompraService.ExcluirRegistroAsync(id, cancellationToken);
        return NoContent();
    }
}
