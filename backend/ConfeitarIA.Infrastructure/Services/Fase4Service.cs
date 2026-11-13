using System.Globalization;
using System.Text;
using ConfeitarIA.Application.DTOs;
using ConfeitarIA.Application.Interfaces;
using ConfeitarIA.Domain.Entities;
using ConfeitarIA.Domain.Exceptions;
using ConfeitarIA.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace ConfeitarIA.Infrastructure.Services;

public sealed class Fase4Service : IComponentesService, IReceitasCompletasService, IProdutosService, IPrecificacaoService
{
    private readonly ConfeitarIADbContext _db;

    public Fase4Service(ConfeitarIADbContext db) => _db = db;

    Task<IReadOnlyList<ComponenteDto>> IComponentesService.ListarAsync(bool ativos, CancellationToken ct) =>
        ListarComponentesAsync(ativos, ct);
    Task<ComponenteDto?> IComponentesService.ObterAsync(int id, CancellationToken ct) => ObterComponenteAsync(id, ct);
    Task<ComponenteDto> IComponentesService.CriarAsync(CriarComponenteRequest request, CancellationToken ct) => CriarAsync(request, ct);
    Task<ComponenteDto> IComponentesService.AtualizarAsync(int id, AtualizarComponenteRequest request, CancellationToken ct) =>
        AtualizarAsync(id, request, ct);
    Task IComponentesService.InativarAsync(int id, CancellationToken ct) => InativarComponenteAsync(id, ct);
    Task<ItemReceitaDto> IComponentesService.AdicionarItemAsync(int id, ItemReceitaRequest request, CancellationToken ct) =>
        AdicionarItemComponenteAsync(id, request, ct);
    Task<ItemReceitaDto> IComponentesService.AtualizarItemAsync(int id, AtualizarItemReceitaRequest request, CancellationToken ct) =>
        AtualizarItemComponenteAsync(id, request, ct);
    Task IComponentesService.RemoverItemAsync(int id, CancellationToken ct) => RemoverItemComponenteAsync(id, ct);

    Task<IReadOnlyList<ReceitaCompletaDto>> IReceitasCompletasService.ListarAsync(bool ativos, CancellationToken ct) =>
        ListarReceitasAsync(ativos, ct);
    Task<ReceitaCompletaDto?> IReceitasCompletasService.ObterAsync(int id, CancellationToken ct) => ObterReceitaAsync(id, ct);
    Task<ReceitaCompletaDto> IReceitasCompletasService.CriarAsync(CriarReceitaCompletaRequest request, CancellationToken ct) =>
        CriarAsync(request, ct);
    Task<ReceitaCompletaDto> IReceitasCompletasService.AtualizarAsync(int id, AtualizarReceitaCompletaRequest request, CancellationToken ct) =>
        AtualizarAsync(id, request, ct);
    Task IReceitasCompletasService.InativarAsync(int id, CancellationToken ct) => InativarReceitaAsync(id, ct);
    Task<ItemReceitaDto> IReceitasCompletasService.AdicionarItemAsync(int id, ItemReceitaRequest request, CancellationToken ct) =>
        AdicionarItemReceitaAsync(id, request, ct);
    Task<ItemReceitaDto> IReceitasCompletasService.AdicionarComponenteAsync(int id, ItemReceitaRequest request, CancellationToken ct) =>
        AdicionarComponenteReceitaAsync(id, request, ct);
    Task<ItemReceitaDto> IReceitasCompletasService.AtualizarItemAsync(int id, AtualizarItemReceitaRequest request, CancellationToken ct) =>
        AtualizarItemReceitaAsync(id, request, ct);
    Task IReceitasCompletasService.RemoverItemAsync(int id, CancellationToken ct) => RemoverItemReceitaAsync(id, ct);

    Task<ProdutoDto?> IProdutosService.ObterAsync(int id, CancellationToken ct) => ObterProdutoAsync(id, ct);

    public async Task<IReadOnlyList<ComponenteDto>> ListarComponentesAsync(bool ativos, CancellationToken ct)
    {
        var componentes = await _db.Componentes.AsNoTracking().Include(x => x.Itens).ThenInclude(x => x.Insumo)
            .Where(x => x.Ativo == ativos).OrderBy(x => x.Nome).ToListAsync(ct);
        return componentes.Select(ToComponenteDto).ToList();
    }

    public async Task<ComponenteDto?> ObterComponenteAsync(int id, CancellationToken ct)
    {
        var componente = await _db.Componentes.AsNoTracking().Include(x => x.Itens).ThenInclude(x => x.Insumo)
            .SingleOrDefaultAsync(x => x.Id == id, ct);
        return componente is null ? null : ToComponenteDto(componente);
    }

    public async Task<ComponenteDto> CriarAsync(CriarComponenteRequest request, CancellationToken ct)
    {
        var entity = new Componente(request.Nome, request.Descricao, request.TempoPreparoMinutos, request.Ativo);
        _db.Componentes.Add(entity);
        await _db.SaveChangesAsync(ct);
        return (await ObterComponenteAsync(entity.Id, ct))!;
    }

    public async Task<ComponenteDto> AtualizarAsync(int id, AtualizarComponenteRequest request, CancellationToken ct)
    {
        var entity = await _db.Componentes.SingleOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new EntityNotFoundException(nameof(Componente), id);
        entity.Atualizar(request.Nome, request.Descricao, request.TempoPreparoMinutos, request.Ativo);
        await _db.SaveChangesAsync(ct);
        return (await ObterComponenteAsync(id, ct))!;
    }

    public async Task InativarComponenteAsync(int id, CancellationToken ct)
    {
        var entity = await _db.Componentes.SingleOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new EntityNotFoundException(nameof(Componente), id);
        entity.Inativar();
        await _db.SaveChangesAsync(ct);
    }

    public async Task<ItemReceitaDto> AdicionarItemComponenteAsync(int componenteId, ItemReceitaRequest request, CancellationToken ct)
    {
        if (!await _db.Componentes.AnyAsync(x => x.Id == componenteId, ct))
            throw new EntityNotFoundException(nameof(Componente), componenteId);
        await using var tx = await _db.Database.BeginTransactionAsync(ct);
        var insumoId = ExigirInsumo(request);
        var unitCost = await ObterUltimoCustoInsumoAsync(insumoId, ct);
        var item = new ItemReceita(null, componenteId, insumoId, request.Quantidade, unitCost);
        _db.ItensReceita.Add(item);
        await _db.SaveChangesAsync(ct);
        await RecalcularProdutosDoComponenteAsync(componenteId, ct);
        await tx.CommitAsync(ct);
        return await ObterItemReceitaAsync(item.Id, ct);
    }

    public async Task<ItemReceitaDto> AtualizarItemComponenteAsync(int itemId, AtualizarItemReceitaRequest request, CancellationToken ct)
    {
        await using var tx = await _db.Database.BeginTransactionAsync(ct);
        var item = await _db.ItensReceita.SingleOrDefaultAsync(x => x.Id == itemId, ct)
            ?? throw new EntityNotFoundException(nameof(ItemReceita), itemId);
        var componentId = item.ComponenteId;
        var recipeId = item.ReceitaCompletaId;
        var affected = await ObterProdutosPorReceitaOuComponenteAsync(componentId, recipeId, ct);
        var latestCost = item.InsumoId.HasValue
            ? await ObterUltimoCustoInsumoAsync(item.InsumoId.Value, ct)
            : item.ValorUnitarioNoCusto;
        item.Atualizar(request.Quantidade, latestCost);
        await _db.SaveChangesAsync(ct);
        await AtualizarPrecificacoesAsync(affected, ct);
        await tx.CommitAsync(ct);
        return await ObterItemReceitaAsync(itemId, ct);
    }

    public async Task RemoverItemComponenteAsync(int itemId, CancellationToken ct)
    {
        var item = await _db.ItensReceita.SingleOrDefaultAsync(x => x.Id == itemId, ct)
            ?? throw new EntityNotFoundException(nameof(ItemReceita), itemId);
        var affected = await ObterProdutosPorReceitaOuComponenteAsync(item.ComponenteId, item.ReceitaCompletaId, ct);
        _db.ItensReceita.Remove(item);
        await using var tx = await _db.Database.BeginTransactionAsync(ct);
        await _db.SaveChangesAsync(ct);
        await AtualizarPrecificacoesAsync(affected, ct);
        await tx.CommitAsync(ct);
    }

    public async Task<IReadOnlyList<ReceitaCompletaDto>> ListarReceitasAsync(bool ativos, CancellationToken ct)
    {
        var receitas = await _db.ReceitasCompletas.AsNoTracking()
            .Include(x => x.Itens).ThenInclude(x => x.Insumo)
            .Include(x => x.Itens).ThenInclude(x => x.Componente)
            .Where(x => x.Ativo == ativos).OrderBy(x => x.Nome).ToListAsync(ct);
        var componentIds = receitas.SelectMany(x => x.Itens)
            .Where(x => !x.InsumoId.HasValue && x.ComponenteId.HasValue)
            .Select(x => x.ComponenteId!.Value).Distinct().ToArray();
        var componentCosts = componentIds.Length == 0
            ? new Dictionary<int, decimal>()
            : await _db.ItensReceita.AsNoTracking()
                .Where(x => x.ComponenteId.HasValue && componentIds.Contains(x.ComponenteId.Value)
                    && x.ReceitaCompletaId == null && x.InsumoId.HasValue)
                .GroupBy(x => x.ComponenteId!.Value)
                .Select(group => new { ComponenteId = group.Key, Custo = group.Sum(item => item.CustoItem) })
                .ToDictionaryAsync(x => x.ComponenteId, x => x.Custo, ct);
        return receitas.Select(x => ToReceitaDto(x, componentCosts, incluirItensComponentes: false)).ToList();
    }

    public async Task<ReceitaCompletaDto?> ObterReceitaAsync(int id, CancellationToken ct)
    {
        var receita = await ReceitaComItens().AsTracking().SingleOrDefaultAsync(x => x.Id == id, ct);
        return receita is null ? null : ToReceitaDto(receita);
    }

    public async Task<ReceitaCompletaDto> CriarAsync(CriarReceitaCompletaRequest request, CancellationToken ct)
    {
        var entity = new ReceitaCompleta(request.Nome, request.Descricao, request.TempoPreparoMinutos, request.Rendimento, request.Ativo);
        await using var tx = await _db.Database.BeginTransactionAsync(ct);
        _db.ReceitasCompletas.Add(entity);
        await _db.SaveChangesAsync(ct);
        await SincronizarProdutoReceitaAsync(entity, null, ct);
        await tx.CommitAsync(ct);
        return (await ObterReceitaAsync(entity.Id, ct))!;
    }

    public async Task<ReceitaCompletaDto> AtualizarAsync(int id, AtualizarReceitaCompletaRequest request, CancellationToken ct)
    {
        var entity = await _db.ReceitasCompletas.SingleOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new EntityNotFoundException(nameof(ReceitaCompleta), id);
        await using var tx = await _db.Database.BeginTransactionAsync(ct);
        var nomeAnterior = entity.Nome;
        entity.Atualizar(request.Nome, request.Descricao, request.TempoPreparoMinutos, request.Rendimento, request.Ativo);
        await _db.SaveChangesAsync(ct);
        await SincronizarProdutoReceitaAsync(entity, nomeAnterior, ct);
        await tx.CommitAsync(ct);
        return (await ObterReceitaAsync(id, ct))!;
    }

    public async Task InativarReceitaAsync(int id, CancellationToken ct)
    {
        var entity = await _db.ReceitasCompletas.SingleOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new EntityNotFoundException(nameof(ReceitaCompleta), id);
        entity.Inativar();
        await _db.SaveChangesAsync(ct);
    }

    private async Task SincronizarProdutoReceitaAsync(ReceitaCompleta receita, string? nomeAnterior, CancellationToken ct)
    {
        var produto = await _db.Produtos.SingleOrDefaultAsync(x => x.ReceitaCompletaId == receita.Id, ct);
        if (produto is null)
        {
            produto = new Produto(receita.Nome, null, null, null, ativo: true,
                receitaCompletaId: receita.Id, apresentarAoPublico: false);
            _db.Produtos.Add(produto);
            await _db.SaveChangesAsync(ct);
        }
        else
        {
            var nomePublico = nomeAnterior is not null &&
                string.Equals(produto.NomePublico, nomeAnterior, StringComparison.Ordinal)
                ? receita.Nome
                : produto.NomePublico;
            produto.Atualizar(nomePublico, produto.DescricaoPublica, produto.IngredientesPrincipais,
                produto.CategoriaProdutoId, produto.Ativo, receita.Id, produto.SemLactose, produto.SemGluten,
                produto.Vegano, produto.EspecificacaoExtra, produto.ApresentarAoPublico);
            await _db.SaveChangesAsync(ct);
        }
        await CriarOuRecalcularPrecificacaoAsync(produto.Id, ct);
    }

    public async Task<ItemReceitaDto> AdicionarItemReceitaAsync(int receitaId, ItemReceitaRequest request, CancellationToken ct)
    {
        if (!await _db.ReceitasCompletas.AnyAsync(x => x.Id == receitaId, ct))
            throw new EntityNotFoundException(nameof(ReceitaCompleta), receitaId);
        await using var tx = await _db.Database.BeginTransactionAsync(ct);
        var insumoId = ExigirInsumo(request);
        var unitCost = await ObterUltimoCustoInsumoAsync(insumoId, ct);
        var item = new ItemReceita(receitaId, null, insumoId, request.Quantidade, unitCost);
        _db.ItensReceita.Add(item);
        await _db.SaveChangesAsync(ct);
        await RecalcularProdutosDaReceitaAsync(receitaId, ct);
        await tx.CommitAsync(ct);
        return await ObterItemReceitaAsync(item.Id, ct);
    }

    public async Task<ItemReceitaDto> AdicionarComponenteReceitaAsync(int receitaId, ItemReceitaRequest request, CancellationToken ct)
    {
        if (request.InsumoId.HasValue || !request.ComponenteId.HasValue)
            throw new BusinessRuleException("Para adicionar um componente, informe somente o componente.");
        if (!await _db.ReceitasCompletas.AnyAsync(x => x.Id == receitaId, ct))
            throw new EntityNotFoundException(nameof(ReceitaCompleta), receitaId);
        if (!await _db.Componentes.AnyAsync(x => x.Id == request.ComponenteId.Value && x.Ativo, ct))
            throw new EntityNotFoundException(nameof(Componente), request.ComponenteId.Value);

        await using var tx = await _db.Database.BeginTransactionAsync(ct);
        var item = new ItemReceita(receitaId, request.ComponenteId.Value, null, request.Quantidade, 0m);
        _db.ItensReceita.Add(item);
        await _db.SaveChangesAsync(ct);
        await RecalcularProdutosDaReceitaAsync(receitaId, ct);
        await tx.CommitAsync(ct);
        return await ObterItemReceitaAsync(item.Id, ct);
    }

    public async Task<ItemReceitaDto> AtualizarItemReceitaAsync(int itemId, AtualizarItemReceitaRequest request, CancellationToken ct)
    {
        await using var tx = await _db.Database.BeginTransactionAsync(ct);
        var item = await _db.ItensReceita.SingleOrDefaultAsync(x => x.Id == itemId, ct)
            ?? throw new EntityNotFoundException(nameof(ItemReceita), itemId);
        var affected = await ObterProdutosPorReceitaOuComponenteAsync(item.ComponenteId, item.ReceitaCompletaId, ct);
        var latestCost = item.InsumoId.HasValue
            ? await ObterUltimoCustoInsumoAsync(item.InsumoId.Value, ct)
            : item.ValorUnitarioNoCusto;
        item.Atualizar(request.Quantidade, latestCost);
        await _db.SaveChangesAsync(ct);
        await AtualizarPrecificacoesAsync(affected, ct);
        await tx.CommitAsync(ct);
        return await ObterItemReceitaAsync(itemId, ct);
    }

    public async Task RemoverItemReceitaAsync(int itemId, CancellationToken ct)
    {
        var item = await _db.ItensReceita.SingleOrDefaultAsync(x => x.Id == itemId, ct)
            ?? throw new EntityNotFoundException(nameof(ItemReceita), itemId);
        var affected = await ObterProdutosPorReceitaOuComponenteAsync(item.ComponenteId, item.ReceitaCompletaId, ct);
        _db.ItensReceita.Remove(item);
        await using var tx = await _db.Database.BeginTransactionAsync(ct);
        await _db.SaveChangesAsync(ct);
        await AtualizarPrecificacoesAsync(affected, ct);
        await tx.CommitAsync(ct);
    }

    public async Task<IReadOnlyList<ProdutoDto>> ListarAsync(CancellationToken ct)
    {
        var products = await ProdutoComListaDetalhes().AsNoTracking()
            .OrderBy(x => x.NomePublico).ToListAsync(ct);
        return products.Select(ToProductDto).ToList();
    }

    public async Task<IReadOnlyList<ProdutoPublicoDto>> ListarPublicosAsync(CancellationToken ct) =>
        await _db.Produtos.AsNoTracking().Where(x => x.Ativo && x.ApresentarAoPublico).OrderBy(x => x.NomePublico)
            .Select(x => new ProdutoPublicoDto(x.NomePublico, x.DescricaoPublica, x.IngredientesPrincipais))
            .ToListAsync(ct);

    public async Task<ProdutoDto?> ObterProdutoAsync(int id, CancellationToken ct)
    {
        var product = await ProdutoComListaDetalhes().AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct);
        return product is null ? null : ToProductDto(product);
    }

    public async Task<ProdutoPublicoDto?> ObterPublicoAsync(int id, CancellationToken ct) =>
        await _db.Produtos.AsNoTracking().Where(x => x.Id == id && x.Ativo && x.ApresentarAoPublico)
            .Select(x => new ProdutoPublicoDto(x.NomePublico, x.DescricaoPublica, x.IngredientesPrincipais))
            .SingleOrDefaultAsync(ct);

    public Task<ProdutoDto> CriarAsync(CriarProdutoRequest request, CancellationToken ct) =>
        throw new BusinessRuleException("Produtos são criados automaticamente ao salvar uma receita completa.");

    public async Task<ProdutoDto> AtualizarAsync(int id, AtualizarProdutoRequest request, CancellationToken ct)
    {
        var product = await _db.Produtos.SingleOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new EntityNotFoundException(nameof(Produto), id);
        product.Atualizar(request.NomePublico, request.DescricaoPublica, request.IngredientesPrincipais,
            request.CategoriaProdutoId, request.Ativo, product.ReceitaCompletaId, request.SemLactose,
            request.SemGluten, request.Vegano, request.EspecificacaoExtra, request.ApresentarAoPublico);
        await _db.SaveChangesAsync(ct);
        return (await ObterProdutoAsync(id, ct))!;
    }

    public async Task InativarAsync(int id, CancellationToken ct)
    {
        var product = await _db.Produtos.SingleOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new EntityNotFoundException(nameof(Produto), id);
        product.Inativar();
        await _db.SaveChangesAsync(ct);
    }

    public Task<ProdutoComponenteDto> AdicionarComponenteAsync(int produtoId, ProdutoComponenteRequest request, CancellationToken ct) =>
        throw new BusinessRuleException("Vincule componentes à receita completa, não diretamente ao produto.");

    public Task<ProdutoComponenteDto> AtualizarComponenteAsync(int id, ProdutoComponenteRequest request, CancellationToken ct) =>
        throw new BusinessRuleException("Edite componentes dentro da receita completa vinculada ao produto.");

    public Task RemoverComponenteAsync(int id, CancellationToken ct) =>
        throw new BusinessRuleException("Remova componentes da receita completa vinculada ao produto.");

    public async Task<ItemExtraProdutoDto> AdicionarItemExtraAsync(int produtoId, ItemExtraProdutoRequest request, CancellationToken ct)
    {
        await ValidarProdutoAsync(produtoId, ct);
        await using var tx = await _db.Database.BeginTransactionAsync(ct);
        var entity = await CriarItemExtraAsync(produtoId, request, ct);
        _db.ItensExtrasProduto.Add(entity);
        await _db.SaveChangesAsync(ct);
        await CriarOuRecalcularPrecificacaoAsync(produtoId, ct);
        await tx.CommitAsync(ct);
        return (await ObterItemExtraAsync(entity.Id, ct))!;
    }

    public async Task<ItemExtraProdutoDto> AtualizarItemExtraAsync(int id, ItemExtraProdutoRequest request, CancellationToken ct)
    {
        await using var tx = await _db.Database.BeginTransactionAsync(ct);
        var entity = await _db.ItensExtrasProduto.SingleOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new EntityNotFoundException(nameof(ItemExtraProduto), id);
        var productId = entity.ProdutoId;
        var values = await ObterDadosItemExtraAsync(request, ct);
        entity.Atualizar(values.InsumoId, values.Descricao, values.Quantidade, values.ValorUnitario);
        await _db.SaveChangesAsync(ct);
        await CriarOuRecalcularPrecificacaoAsync(productId, ct);
        await tx.CommitAsync(ct);
        return (await ObterItemExtraAsync(id, ct))!;
    }

    public async Task RemoverItemExtraAsync(int id, CancellationToken ct)
    {
        var entity = await _db.ItensExtrasProduto.SingleOrDefaultAsync(x => x.Id == id, ct)
            ?? throw new EntityNotFoundException(nameof(ItemExtraProduto), id);
        var productId = entity.ProdutoId;
        _db.ItensExtrasProduto.Remove(entity);
        await using var tx = await _db.Database.BeginTransactionAsync(ct);
        await _db.SaveChangesAsync(ct);
        await CriarOuRecalcularPrecificacaoAsync(productId, ct);
        await tx.CommitAsync(ct);
    }

    public async Task<PrecificacaoDto?> ObterAsync(int produtoId, CancellationToken ct) =>
        await _db.Precificacoes.AsNoTracking().Where(x => x.ProdutoId == produtoId)
            .Select(x => new PrecificacaoDto(x.ProdutoId, x.CustoTotalInsumos, x.TempoMaoObraMinutos,
                x.ValorHoraMaoObra, x.CustoMaoDeObra, x.CustoTotalAnterior, x.CustoTotal,
                x.VariacaoCustoPercentual, x.AlertaVariacaoPreco, x.MargemSugeridaPercentual,
                x.PrecoSugerido, x.PrecoVendaFinal, x.LucroBruto, x.MargemRealSobreCusto,
                x.MargemRealSobreVenda, ToOffset(x.DataUltimaAtualizacao)))
            .SingleOrDefaultAsync(ct);

    public async Task<PrecificacaoDto> AtualizarAsync(int produtoId, AtualizarPrecificacaoRequest request, CancellationToken ct)
    {
        var pricing = await _db.Precificacoes.SingleOrDefaultAsync(x => x.ProdutoId == produtoId, ct)
            ?? throw new EntityNotFoundException(nameof(Precificacao), produtoId);
        if (request.TempoMaoObraMinutos.HasValue != request.ValorHoraMaoObra.HasValue)
            throw new BusinessRuleException("Informe o tempo de mão de obra e o valor da hora juntos, ou deixe ambos sem alteração.");
        if (request.TempoMaoObraMinutos.HasValue)
        {
            var cost = await CalcularCustoInsumosAsync(produtoId, ct);
            pricing.AtualizarCustos(cost, request.TempoMaoObraMinutos, request.ValorHoraMaoObra);
        }
        pricing.AtualizarPrecoFinal(request.PrecoVendaFinal);
        await _db.SaveChangesAsync(ct);
        return (await ObterAsync(produtoId, ct))!;
    }

    public async Task<ComposicaoCustoDto?> ObterComposicaoAsync(int produtoId, CancellationToken ct)
    {
        var product = await ProdutoComDetalhes().AsTracking().SingleOrDefaultAsync(x => x.Id == produtoId, ct);
        if (product is null)
            return null;

        var rows = new List<ItemComposicaoCustoDto>();
        if (product.ReceitaCompleta is not null)
            AddRecipeComposition(rows, product.ReceitaCompleta, product.ReceitaCompleta.Nome, 1m);
        foreach (var link in product.Componentes.OrderBy(x => x.Ordem).ThenBy(x => x.Id))
        {
            var items = link.Componente?.Itens ?? link.ReceitaCompleta?.Itens;
            var label = link.Componente?.Nome ?? link.ReceitaCompleta?.Nome ?? "Receita";
            if (items is null)
                continue;
            if (link.ReceitaCompleta is not null)
                AddRecipeComposition(rows, link.ReceitaCompleta, label, 1m);
            else
                AddComponentComposition(rows, link.Componente!, label, 1m);
        }

        foreach (var extra in product.ItensExtras)
        {
            var description = extra.Insumo is null ? extra.DescricaoItem! : extra.Insumo.Nome;
            rows.Add(new ItemComposicaoCustoDto("Extra", description, extra.Quantidade ?? 1m,
                extra.ValorUnitario, extra.CustoItem, 0m));
        }

        var itemsByCost = rows.OrderByDescending(x => x.CustoItem).ToList();
        var ingredientCost = itemsByCost.Sum(x => x.CustoItem);
        var all = itemsByCost.Select(x => x with
        {
            PercentualDoCusto = ingredientCost == 0m ? 0m : Math.Round(x.CustoItem / ingredientCost * 100m, 2)
        }).ToList();
        var pareto = new List<ItemComposicaoCustoDto>();
        decimal cumulative = 0m;
        foreach (var item in all)
        {
            if (ingredientCost == 0m || cumulative >= ingredientCost * 0.8m)
                break;
            pareto.Add(item);
            cumulative += item.CustoItem;
        }
        var paretoIds = pareto.ToHashSet();
        var remaining = all.Where(item => !paretoIds.Contains(item)).ToList();
        var pricing = await _db.Precificacoes.AsNoTracking().SingleOrDefaultAsync(x => x.ProdutoId == produtoId, ct);
        return new ComposicaoCustoDto(produtoId, product.NomePublico, ingredientCost,
            pricing?.CustoTotal ?? ingredientCost, all, pareto, remaining, remaining.Sum(x => x.CustoItem));
    }

    public async Task<IReadOnlyList<RelatorioCustoDto>> RelatorioAsync(bool? alerta, bool? margemAbaixoSugerida, CancellationToken ct)
    {
        var query = from product in _db.Produtos.AsNoTracking()
                    join price in _db.Precificacoes.AsNoTracking() on product.Id equals price.ProdutoId
                    where product.Ativo && product.ReceitaCompletaId != null
                    select new { Produto = product, Precificacao = price };
        if (alerta.HasValue)
            query = query.Where(x => x.Precificacao.AlertaVariacaoPreco == alerta.Value);
        if (margemAbaixoSugerida.HasValue)
            query = query.Where(x => margemAbaixoSugerida.Value
                ? x.Precificacao.MargemRealSobreCusto < x.Precificacao.MargemSugeridaPercentual
                : x.Precificacao.MargemRealSobreCusto >= x.Precificacao.MargemSugeridaPercentual);

        var rows = await query.OrderBy(x => x.Produto.NomePublico)
            .Select(x => new
            {
                x.Produto.Id,
                x.Produto.NomePublico,
                x.Precificacao.CustoTotal,
                x.Precificacao.PrecoSugerido,
                x.Precificacao.PrecoVendaFinal,
                x.Precificacao.MargemRealSobreCusto,
                x.Precificacao.MargemRealSobreVenda,
                x.Precificacao.MargemSugeridaPercentual,
                x.Precificacao.AlertaVariacaoPreco,
                x.Precificacao.CustoTotalAnterior,
                x.Precificacao.VariacaoCustoPercentual
            })
            .ToListAsync(ct);

        return rows.Select(x => new RelatorioCustoDto(
            x.Id,
            x.NomePublico,
            x.CustoTotal,
            x.PrecoSugerido,
            x.PrecoVendaFinal,
            x.MargemRealSobreCusto,
            x.MargemRealSobreVenda,
            x.MargemSugeridaPercentual,
            x.AlertaVariacaoPreco,
            x.CustoTotalAnterior,
            x.VariacaoCustoPercentual))
            .ToList();
    }

    public async Task<byte[]> ExportarAsync(bool? alerta, bool? margemAbaixoSugerida, CancellationToken ct)
    {
        var rows = await RelatorioAsync(alerta, margemAbaixoSugerida, ct);
        var csv = new StringBuilder();
        csv.AppendLine("produto_id;nome_publico;custo_total;preco_sugerido;preco_venda_final;margem_real_sobre_custo;margem_real_sobre_venda;alerta_variacao;custo_anterior;variacao_custo_percentual");
        foreach (var row in rows)
        {
            csv.Append(row.ProdutoId).Append(';')
                .Append(Csv(row.NomePublico)).Append(';')
                .Append(Format(row.CustoTotal)).Append(';')
                .Append(Format(row.PrecoSugerido)).Append(';')
                .Append(Format(row.PrecoVendaFinal)).Append(';')
                .Append(Format(row.MargemRealSobreCusto)).Append(';')
                .Append(Format(row.MargemRealSobreVenda)).Append(';')
                .Append(row.AlertaVariacaoPreco ? "true" : "false").Append(';')
                .Append(row.CustoTotalAnterior.HasValue ? Format(row.CustoTotalAnterior.Value) : string.Empty).Append(';')
                .AppendLine(row.VariacaoCustoPercentual.HasValue ? Format(row.VariacaoCustoPercentual.Value) : string.Empty);
        }
        return Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(csv.ToString())).ToArray();
    }

    private async Task<decimal> ObterUltimoCustoInsumoAsync(int insumoId, CancellationToken ct)
    {
        if (!await _db.Insumos.AnyAsync(x => x.Id == insumoId, ct))
            throw new EntityNotFoundException(nameof(Insumo), insumoId);
        var latest = await _db.RegistrosCompra.AsNoTracking().Where(x => x.InsumoId == insumoId)
            .OrderByDescending(x => x.DataCompra).ThenByDescending(x => x.Id)
            .Select(x => (decimal?)x.ValorUnitario).FirstOrDefaultAsync(ct);
        return latest ?? throw new BusinessRuleException($"O insumo {insumoId} ainda não possui compra registrada para determinar o custo unitário.");
    }

    private async Task<ItemReceitaDto> ObterItemReceitaAsync(int id, CancellationToken ct)
    {
        var item = await _db.ItensReceita.AsTracking().Include(x => x.Insumo)
            .Include(x => x.Componente).ThenInclude(x => x!.Itens).ThenInclude(x => x.Insumo)
            .SingleAsync(x => x.Id == id, ct);
        return ToItemDto(item);
    }

    private static int ExigirInsumo(ItemReceitaRequest request)
    {
        if (!request.InsumoId.HasValue || request.ComponenteId.HasValue)
            throw new BusinessRuleException("Informe somente um insumo para adicionar ao componente ou à receita.");
        return request.InsumoId.Value;
    }

    private IQueryable<ReceitaCompleta> ReceitaComItens() =>
        _db.ReceitasCompletas.Include(x => x.Itens).ThenInclude(x => x.Insumo)
            .Include(x => x.Itens).ThenInclude(x => x.Componente).ThenInclude(x => x!.Itens).ThenInclude(x => x.Insumo);

    private static ComponenteDto ToComponenteDto(Componente componente)
    {
        var items = componente.Itens.Where(x => x.InsumoId.HasValue).OrderBy(x => x.Id)
            .Select(item => ToItemDto(item)).ToList();
        return new ComponenteDto(componente.Id, componente.Nome, componente.Descricao, componente.TempoPreparoMinutos,
            componente.Ativo, ToOffset(componente.DataCriacao), ToOffset(componente.DataUltimaAlteracao),
            items.Sum(x => x.CustoItem), items);
    }

    private static ReceitaCompletaDto ToReceitaDto(
        ReceitaCompleta receita, IReadOnlyDictionary<int, decimal>? componentCosts = null, bool incluirItensComponentes = true)
    {
        var items = receita.Itens.OrderBy(x => x.Id)
            .Select(item => ToItemDto(item, componentCosts, incluirItensComponentes)).ToList();
        return new ReceitaCompletaDto(receita.Id, receita.Nome, receita.Descricao, receita.TempoPreparoMinutos,
            receita.Rendimento, receita.Ativo, ToOffset(receita.DataCriacao), ToOffset(receita.DataUltimaAlteracao),
            items.Sum(x => x.CustoItem), items);
    }

    private static ItemReceitaDto ToItemDto(
        ItemReceita item, IReadOnlyDictionary<int, decimal>? componentCosts = null, bool incluirItensComponentes = true)
    {
        var componentItems = item.InsumoId.HasValue
            ? null
            : incluirItensComponentes
                ? item.Componente?.Itens.Where(x => x.InsumoId.HasValue).OrderBy(x => x.Id)
                    .Select(child => ToItemDto(child)).ToList()
                    ?? new List<ItemReceitaDto>()
                : null;
        var componentCost = componentItems?.Sum(x => x.CustoItem)
            ?? (item.ComponenteId.HasValue && componentCosts is not null &&
                componentCosts.TryGetValue(item.ComponenteId.Value, out var savedCost) ? savedCost : 0m);
        var cost = item.InsumoId.HasValue ? item.CustoItem : componentCost * item.Quantidade;
        return new ItemReceitaDto(item.Id, item.InsumoId, item.Insumo?.Nome, item.Insumo?.UnidadeMedida,
            item.InsumoId.HasValue ? null : item.ComponenteId,
            item.InsumoId.HasValue ? null : item.Componente?.Nome,
            item.Quantidade, item.ValorUnitarioNoCusto, cost, ToOffset(item.DataUltimaAlteracao), componentItems);
    }

    private static void AddRecipeComposition(
        ICollection<ItemComposicaoCustoDto> rows, ReceitaCompleta receita, string label, decimal multiplier)
    {
        foreach (var item in receita.Itens)
        {
            if (item.InsumoId.HasValue)
            {
                rows.Add(new ItemComposicaoCustoDto("Receita completa",
                    $"{label} — {item.Insumo?.Nome ?? "Insumo"}", item.Quantidade * multiplier,
                    item.ValorUnitarioNoCusto, item.CustoItem * multiplier, 0m));
            }
            else if (item.Componente is not null)
            {
                AddComponentComposition(rows, item.Componente, $"{label} — {item.Componente.Nome}",
                    multiplier * item.Quantidade);
            }
        }
    }

    private static void AddComponentComposition(
        ICollection<ItemComposicaoCustoDto> rows, Componente componente, string label, decimal multiplier)
    {
        foreach (var item in componente.Itens.Where(x => x.InsumoId.HasValue))
        {
            rows.Add(new ItemComposicaoCustoDto("Componente",
                $"{label} — {item.Insumo?.Nome ?? "Insumo"}", item.Quantidade * multiplier,
                item.ValorUnitarioNoCusto, item.CustoItem * multiplier, 0m));
        }
    }

    private async Task<int[]> ObterProdutosPorReceitaOuComponenteAsync(int? componenteId, int? receitaId, CancellationToken ct)
    {
        var query = _db.ProdutoComponentes.AsNoTracking().AsQueryable();
        if (componenteId.HasValue)
            query = query.Where(x => x.ComponenteId == componenteId);
        else
            query = query.Where(x => x.ReceitaCompletaId == receitaId);
        var products = query.Select(x => x.ProdutoId);
        if (receitaId.HasValue)
            products = products.Concat(_db.Produtos.AsNoTracking().Where(x => x.ReceitaCompletaId == receitaId).Select(x => x.Id));
        if (componenteId.HasValue)
            products = products.Concat(_db.Produtos.AsNoTracking().Where(x => x.ReceitaCompleta!.Itens.Any(item => item.ComponenteId == componenteId && item.InsumoId == null)).Select(x => x.Id));
        return await products.Distinct().ToArrayAsync(ct);
    }

    private async Task RecalcularProdutosDoComponenteAsync(int id, CancellationToken ct) =>
        await AtualizarPrecificacoesAsync(await ObterProdutosPorReceitaOuComponenteAsync(id, null, ct), ct);

    private async Task RecalcularProdutosDaReceitaAsync(int id, CancellationToken ct) =>
        await AtualizarPrecificacoesAsync(await ObterProdutosPorReceitaOuComponenteAsync(null, id, ct), ct);

    private async Task AtualizarPrecificacoesAsync(IEnumerable<int> produtoIds, CancellationToken ct)
    {
        foreach (var id in produtoIds.Distinct())
            await CriarOuRecalcularPrecificacaoAsync(id, ct);
    }

    private async Task CriarOuRecalcularPrecificacaoAsync(int produtoId, CancellationToken ct)
    {
        var product = await ProdutoComDetalhes().SingleOrDefaultAsync(x => x.Id == produtoId, ct)
            ?? throw new EntityNotFoundException(nameof(Produto), produtoId);
        var cost = CalcularCustoInsumos(product);
        var pricing = await _db.Precificacoes.SingleOrDefaultAsync(x => x.ProdutoId == produtoId, ct);
        if (pricing is null)
            _db.Precificacoes.Add(new Precificacao(produtoId, cost, null, null));
        else
            pricing.AtualizarCustos(cost, pricing.TempoMaoObraMinutos, pricing.ValorHoraMaoObra);
        await _db.SaveChangesAsync(ct);
    }

    private async Task<decimal> CalcularCustoInsumosAsync(int produtoId, CancellationToken ct)
    {
        var product = await ProdutoComDetalhes().AsTracking().SingleOrDefaultAsync(x => x.Id == produtoId, ct)
            ?? throw new EntityNotFoundException(nameof(Produto), produtoId);
        return CalcularCustoInsumos(product);
    }

    private static decimal CalcularCustoInsumos(Produto product) =>
        (product.ReceitaCompleta is null ? 0m : CustoItensReceita(product.ReceitaCompleta.Itens))
        + product.Componentes.Sum(link => link.Componente is not null
            ? CustoItensComponente(link.Componente.Itens)
            : link.ReceitaCompleta is not null ? CustoItensReceita(link.ReceitaCompleta.Itens) : 0m)
        + product.ItensExtras.Sum(item => item.CustoItem);

    private static decimal CustoItensReceita(IEnumerable<ItemReceita> items) =>
        items.Sum(item => item.InsumoId.HasValue
            ? item.CustoItem
            : item.Quantidade * CustoItensComponente(item.Componente?.Itens ?? Array.Empty<ItemReceita>()));

    private static decimal CustoItensComponente(IEnumerable<ItemReceita> items) =>
        items.Where(item => item.InsumoId.HasValue).Sum(item => item.CustoItem);

    private IQueryable<Produto> ProdutoComDetalhes() =>
        _db.Produtos.Include(x => x.ReceitaCompleta).ThenInclude(x => x!.Itens).ThenInclude(x => x.Insumo)
            .Include(x => x.ReceitaCompleta).ThenInclude(x => x!.Itens).ThenInclude(x => x.Componente).ThenInclude(x => x!.Itens).ThenInclude(x => x.Insumo)
            .Include(x => x.Componentes).ThenInclude(x => x.Componente).ThenInclude(x => x!.Itens).ThenInclude(x => x.Insumo)
            .Include(x => x.Componentes).ThenInclude(x => x.ReceitaCompleta).ThenInclude(x => x!.Itens)
            .ThenInclude(x => x.Insumo)
            .Include(x => x.ItensExtras).ThenInclude(x => x.Insumo);

    private IQueryable<Produto> ProdutoComListaDetalhes() =>
        _db.Produtos.Include(x => x.ReceitaCompleta)
            .Include(x => x.Componentes).ThenInclude(x => x.Componente)
            .Include(x => x.Componentes).ThenInclude(x => x.ReceitaCompleta)
            .Include(x => x.ItensExtras).ThenInclude(x => x.Insumo);

    private async Task ValidarProdutoAsync(int id, CancellationToken ct)
    {
        if (!await _db.Produtos.AnyAsync(x => x.Id == id, ct))
            throw new EntityNotFoundException(nameof(Produto), id);
    }

    private async Task ValidarComponentesAsync(IEnumerable<ProdutoComponenteRequest> links, CancellationToken ct)
    {
        foreach (var link in links)
            await ValidarComponenteAsync(link.ComponenteId, link.ReceitaCompletaId, ct);
    }

    private async Task ValidarComponenteAsync(int? componenteId, int? receitaId, CancellationToken ct)
    {
        if ((componenteId.HasValue ? 1 : 0) + (receitaId.HasValue ? 1 : 0) != 1)
            throw new BusinessRuleException("Informe exatamente um componente ou uma receita completa.");
        if (componenteId.HasValue && !await _db.Componentes.AnyAsync(x => x.Id == componenteId && x.Ativo, ct))
            throw new EntityNotFoundException(nameof(Componente), componenteId.Value);
        if (receitaId.HasValue && !await _db.ReceitasCompletas.AnyAsync(x => x.Id == receitaId && x.Ativo, ct))
            throw new EntityNotFoundException(nameof(ReceitaCompleta), receitaId.Value);
    }

    private async Task<ItemExtraProduto> CriarItemExtraAsync(int produtoId, ItemExtraProdutoRequest request, CancellationToken ct)
    {
        var values = await ObterDadosItemExtraAsync(request, ct);
        return new ItemExtraProduto(produtoId, values.InsumoId, values.Descricao, values.Quantidade, values.ValorUnitario);
    }

    private async Task<(int? InsumoId, string? Descricao, decimal? Quantidade, decimal ValorUnitario)> ObterDadosItemExtraAsync(
        ItemExtraProdutoRequest request, CancellationToken ct)
    {
        if (request.InsumoId.HasValue)
        {
            if (request.Quantidade is null or <= 0 || !string.IsNullOrWhiteSpace(request.DescricaoItem))
                throw new BusinessRuleException("Para item vinculado a insumo, informe uma quantidade positiva e não informe descrição livre.");
            var unitCost = await ObterUltimoCustoInsumoAsync(request.InsumoId.Value, ct);
            return (request.InsumoId, null, request.Quantidade, unitCost);
        }
        if (string.IsNullOrWhiteSpace(request.DescricaoItem) || request.ValorUnitario is null || request.Quantidade.HasValue)
            throw new BusinessRuleException("Item livre requer descrição, valor unitário e não aceita quantidade.");
        return (null, request.DescricaoItem.Trim(), null, request.ValorUnitario.Value);
    }

    private async Task<ProdutoComponenteDto?> ObterComponenteProdutoAsync(int id, CancellationToken ct) =>
        await _db.ProdutoComponentes.AsNoTracking().Where(x => x.Id == id)
            .Select(x => new ProdutoComponenteDto(x.Id, x.ComponenteId, x.Componente!.Nome,
                x.ReceitaCompletaId, x.ReceitaCompleta!.Nome, x.Ordem)).SingleOrDefaultAsync(ct);

    private async Task<ItemExtraProdutoDto?> ObterItemExtraAsync(int id, CancellationToken ct) =>
        await _db.ItensExtrasProduto.AsNoTracking().Where(x => x.Id == id)
            .Select(x => new ItemExtraProdutoDto(x.Id, x.InsumoId, x.DescricaoItem, x.Quantidade,
                x.ValorUnitario, x.CustoItem, x.Insumo == null ? null : x.Insumo.Nome)).SingleOrDefaultAsync(ct);

    private static ProdutoDto ToProductDto(Produto x) =>
        new(x.Id, x.NomePublico, x.DescricaoPublica, x.IngredientesPrincipais, x.CategoriaProdutoId,
            x.ReceitaCompletaId, x.ReceitaCompleta?.Nome, x.SemLactose, x.SemGluten, x.Vegano,
            x.EspecificacaoExtra, x.ApresentarAoPublico, x.Ativo, ToOffset(x.DataCriacao), ToOffset(x.DataUltimaAlteracao),
            x.Componentes.OrderBy(c => c.Ordem).ThenBy(c => c.Id)
                .Select(c => new ProdutoComponenteDto(c.Id, c.ComponenteId, c.Componente?.Nome,
                    c.ReceitaCompletaId, c.ReceitaCompleta?.Nome, c.Ordem)).ToList(),
            x.ItensExtras.OrderBy(e => e.Id).Select(e => new ItemExtraProdutoDto(e.Id, e.InsumoId,
                e.DescricaoItem, e.Quantidade, e.ValorUnitario, e.CustoItem, e.Insumo?.Nome)).ToList());

    private static DateTimeOffset ToOffset(DateTime value) =>
        new(DateTime.SpecifyKind(value, DateTimeKind.Utc));

    private static string Format(decimal value) => value.ToString("0.00", CultureInfo.InvariantCulture);

    private static string Csv(string value)
    {
        var safeValue = value.Length > 0 && "=+-@".Contains(value[0]) ? "'" + value : value;
        return "\"" + safeValue.Replace("\"", "\"\"") + "\"";
    }
}
