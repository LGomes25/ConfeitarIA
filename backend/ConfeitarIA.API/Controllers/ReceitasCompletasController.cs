using ConfeitarIA.Application.DTOs;
using ConfeitarIA.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConfeitarIA.API.Controllers;

[ApiController]
[Route("api/receitas-completas")]
[Authorize(Roles = "Admin,Manager,Team")]
public sealed class ReceitasCompletasController(IReceitasCompletasService service) : ControllerBase
{
    /// <summary>Lista receitas completas ativas.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ReceitaCompletaDto>), StatusCodes.Status200OK)]
    public Task<IReadOnlyList<ReceitaCompletaDto>> Listar(CancellationToken ct) => service.ListarAsync(true, ct);

    /// <summary>Lista receitas completas inativas.</summary>
    [HttpGet("inativos")]
    [ProducesResponseType(typeof(IReadOnlyList<ReceitaCompletaDto>), StatusCodes.Status200OK)]
    public Task<IReadOnlyList<ReceitaCompletaDto>> ListarInativos(CancellationToken ct) => service.ListarAsync(false, ct);

    /// <summary>Obtém receita completa e seus insumos.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ReceitaCompletaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReceitaCompletaDto>> Obter(int id, CancellationToken ct)
    {
        var result = await service.ObterAsync(id, ct);
        return result is null ? NotFound() : Ok(result);
    }

    /// <summary>Cria receita completa.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ReceitaCompletaDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ReceitaCompletaDto>> Criar(CriarReceitaCompletaRequest request, CancellationToken ct)
    {
        var result = await service.CriarAsync(request, ct);
        return CreatedAtAction(nameof(Obter), new { id = result.Id }, result);
    }

    /// <summary>Atualiza dados da receita.</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ReceitaCompletaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReceitaCompletaDto>> Atualizar(int id, AtualizarReceitaCompletaRequest request, CancellationToken ct) =>
        Ok(await service.AtualizarAsync(id, request, ct));

    /// <summary>Inativa receita sem apagar seu histórico.</summary>
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

    /// <summary>Adiciona um componente inteiro; seus insumos são expandidos no custo.</summary>
    [HttpPost("{id:int}/componentes")]
    [ProducesResponseType(typeof(ItemReceitaDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<ActionResult<ItemReceitaDto>> AdicionarComponente(int id, ItemReceitaRequest request, CancellationToken ct)
    {
        var result = await service.AdicionarComponenteAsync(id, request, ct);
        return CreatedAtAction(nameof(Obter), new { id }, result);
    }

    /// <summary>Atualiza quantidade de insumo, atualizando o custo unitário automaticamente.</summary>
    [HttpPut("itens/{id:int}")]
    [ProducesResponseType(typeof(ItemReceitaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ItemReceitaDto>> AtualizarItem(int id, AtualizarItemReceitaRequest request, CancellationToken ct) =>
        Ok(await service.AtualizarItemAsync(id, request, ct));

    /// <summary>Remove um insumo da receita completa.</summary>
    [HttpDelete("itens/{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoverItem(int id, CancellationToken ct)
    {
        await service.RemoverItemAsync(id, ct);
        return NoContent();
    }
}
