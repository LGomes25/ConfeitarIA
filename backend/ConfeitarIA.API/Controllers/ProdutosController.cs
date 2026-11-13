using ConfeitarIA.Application.DTOs;
using ConfeitarIA.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ConfeitarIA.API.Controllers;

[ApiController]
[Route("api/produtos")]
public sealed class ProdutosController(IProdutosService service) : ControllerBase
{
    /// <summary>Lista produtos internos com composição.</summary>
    [HttpGet]
    [Authorize(Roles = "Admin,Manager,Team")]
    [ProducesResponseType(typeof(IReadOnlyList<ProdutoDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<ProdutoDto>>> Listar(CancellationToken ct)
    {
        var produtos = await service.ListarAsync(ct);
        return Ok(PodeVerItensExtras() ? produtos : produtos.Select(OcultarItensExtras));
    }

    /// <summary>Lista apenas campos públicos dos produtos ativos para a vitrine.</summary>
    [HttpGet("ativos")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IReadOnlyList<ProdutoPublicoDto>), StatusCodes.Status200OK)]
    public Task<IReadOnlyList<ProdutoPublicoDto>> ListarPublicos(CancellationToken ct) => service.ListarPublicosAsync(ct);

    /// <summary>Obtém os detalhes internos do produto.</summary>
    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,Manager,Team")]
    [ProducesResponseType(typeof(ProdutoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProdutoDto>> Obter(int id, CancellationToken ct)
    {
        var result = await service.ObterAsync(id, ct);
        if (result is null)
            return NotFound();
        return Ok(PodeVerItensExtras() ? result : OcultarItensExtras(result));
    }

    /// <summary>Obtém somente os campos públicos de um produto ativo.</summary>
    [HttpGet("{id:int}/publico")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ProdutoPublicoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProdutoPublicoDto>> ObterPublico(int id, CancellationToken ct)
    {
        var result = await service.ObterPublicoAsync(id, ct);
        return result is null ? NotFound() : Ok(result);
    }

    /// <summary>Cria produto e composição inicial.</summary>
    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    [ProducesResponseType(typeof(ProdutoDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ProdutoDto>> Criar(CriarProdutoRequest request, CancellationToken ct)
    {
        var result = await service.CriarAsync(request, ct);
        return CreatedAtAction(nameof(Obter), new { id = result.Id }, result);
    }

    /// <summary>Atualiza dados públicos e status do produto.</summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,Manager")]
    [ProducesResponseType(typeof(ProdutoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProdutoDto>> Atualizar(int id, AtualizarProdutoRequest request, CancellationToken ct) =>
        Ok(await service.AtualizarAsync(id, request, ct));

    /// <summary>Inativa o produto e o remove da vitrine pública.</summary>
    [HttpPatch("{id:int}/inativar")]
    [Authorize(Roles = "Admin,Manager")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Inativar(int id, CancellationToken ct)
    {
        await service.InativarAsync(id, ct);
        return NoContent();
    }

    /// <summary>Adiciona um componente ou receita à composição.</summary>
    [HttpPost("{id:int}/componentes")]
    [Authorize(Roles = "Admin,Manager")]
    [ProducesResponseType(typeof(ProdutoComponenteDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<ProdutoComponenteDto>> AdicionarComponente(int id, ProdutoComponenteRequest request, CancellationToken ct)
    {
        var result = await service.AdicionarComponenteAsync(id, request, ct);
        return CreatedAtAction(nameof(Obter), new { id }, result);
    }

    /// <summary>Atualiza um item existente da composição.</summary>
    [HttpPut("componentes/{id:int}")]
    [Authorize(Roles = "Admin,Manager")]
    [ProducesResponseType(typeof(ProdutoComponenteDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProdutoComponenteDto>> AtualizarComponente(int id, ProdutoComponenteRequest request, CancellationToken ct) =>
        Ok(await service.AtualizarComponenteAsync(id, request, ct));

    /// <summary>Remove um componente da composição.</summary>
    [HttpDelete("componentes/{id:int}")]
    [Authorize(Roles = "Admin,Manager")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoverComponente(int id, CancellationToken ct)
    {
        await service.RemoverComponenteAsync(id, ct);
        return NoContent();
    }

    /// <summary>Adiciona insumo cadastrado ou item livre extra.</summary>
    [HttpPost("{id:int}/itens-extras")]
    [Authorize(Roles = "Admin,Manager")]
    [ProducesResponseType(typeof(ItemExtraProdutoDto), StatusCodes.Status201Created)]
    public async Task<ActionResult<ItemExtraProdutoDto>> AdicionarItemExtra(int id, ItemExtraProdutoRequest request, CancellationToken ct)
    {
        var result = await service.AdicionarItemExtraAsync(id, request, ct);
        return CreatedAtAction(nameof(Obter), new { id }, result);
    }

    /// <summary>Atualiza item extra.</summary>
    [HttpPut("itens-extras/{id:int}")]
    [Authorize(Roles = "Admin,Manager")]
    [ProducesResponseType(typeof(ItemExtraProdutoDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ItemExtraProdutoDto>> AtualizarItemExtra(int id, ItemExtraProdutoRequest request, CancellationToken ct) =>
        Ok(await service.AtualizarItemExtraAsync(id, request, ct));

    /// <summary>Remove item extra da composição.</summary>
    [HttpDelete("itens-extras/{id:int}")]
    [Authorize(Roles = "Admin,Manager")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoverItemExtra(int id, CancellationToken ct)
    {
        await service.RemoverItemExtraAsync(id, ct);
        return NoContent();
    }

    private bool PodeVerItensExtras() => User.IsInRole("Admin") || User.IsInRole("Manager");

    private static ProdutoDto OcultarItensExtras(ProdutoDto produto) => produto with
    {
        ItensExtras = Array.Empty<ItemExtraProdutoDto>()
    };
}
