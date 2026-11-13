using ConfeitarIA.Application.DTOs;
using ConfeitarIA.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConfeitarIA.API.Controllers;

[ApiController]
[Route("api/componentes")]
[Authorize(Roles = "Admin,Manager,Team")]
public sealed class ComponentesController(IComponentesService service) : ControllerBase
{
    /// <summary>Lista componentes ativos.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ComponenteDto>), StatusCodes.Status200OK)]
    public Task<IReadOnlyList<ComponenteDto>> Listar(CancellationToken ct) => service.ListarAsync(true, ct);

    /// <summary>Lista componentes inativos.</summary>
    [HttpGet("inativos")]
    [ProducesResponseType(typeof(IReadOnlyList<ComponenteDto>), StatusCodes.Status200OK)]
    public Task<IReadOnlyList<ComponenteDto>> ListarInativos(CancellationToken ct) => service.ListarAsync(false, ct);

    /// <summary>Obtém componente e seus insumos.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ComponenteDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ComponenteDto>> Obter(int id, CancellationToken ct)
    {
        var result = await service.ObterAsync(id, ct);
        return result is null ? NotFound() : Ok(result);
    }

    /// <summary>Cria componente.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ComponenteDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ComponenteDto>> Criar(CriarComponenteRequest request, CancellationToken ct)
    {
        var result = await service.CriarAsync(request, ct);
        return CreatedAtAction(nameof(Obter), new { id = result.Id }, result);
    }

    /// <summary>Atualiza dados do componente.</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ComponenteDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ComponenteDto>> Atualizar(int id, AtualizarComponenteRequest request, CancellationToken ct) =>
        Ok(await service.AtualizarAsync(id, request, ct));

    /// <summary>Inativa componente sem apagar seu histórico.</summary>
    [HttpPatch("{id:int}/inativar")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Inativar(int id, CancellationToken ct)
    {
        await service.InativarAsync(id, ct);
        return NoContent();
    }

    /// <summary>Adiciona um insumo com custo unitário da compra mais recente.</summary>
    [HttpPost("{id:int}/itens")]
    [ProducesResponseType(typeof(ItemReceitaDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<ActionResult<ItemReceitaDto>> AdicionarItem(int id, ItemReceitaRequest request, CancellationToken ct)
    {
        var result = await service.AdicionarItemAsync(id, request, ct);
        return CreatedAtAction(nameof(Obter), new { id }, result);
    }

    /// <summary>Atualiza quantidade de insumo, atualizando o custo unitário automaticamente.</summary>
    [HttpPut("itens/{id:int}")]
    [ProducesResponseType(typeof(ItemReceitaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ItemReceitaDto>> AtualizarItem(int id, AtualizarItemReceitaRequest request, CancellationToken ct) =>
        Ok(await service.AtualizarItemAsync(id, request, ct));

    /// <summary>Remove um insumo do componente.</summary>
    [HttpDelete("itens/{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoverItem(int id, CancellationToken ct)
    {
        await service.RemoverItemAsync(id, ct);
        return NoContent();
    }
}
