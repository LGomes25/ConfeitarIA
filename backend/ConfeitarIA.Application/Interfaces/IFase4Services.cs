using ConfeitarIA.Application.DTOs;

namespace ConfeitarIA.Application.Interfaces;

public interface IComponentesService
{
    Task<IReadOnlyList<ComponenteDto>> ListarAsync(bool ativos, CancellationToken ct);
    Task<ComponenteDto?> ObterAsync(int id, CancellationToken ct);
    Task<ComponenteDto> CriarAsync(CriarComponenteRequest request, CancellationToken ct);
    Task<ComponenteDto> AtualizarAsync(int id, AtualizarComponenteRequest request, CancellationToken ct);
    Task InativarAsync(int id, CancellationToken ct);
    Task<ItemReceitaDto> AdicionarItemAsync(int componenteId, ItemReceitaRequest request, CancellationToken ct);
    Task<ItemReceitaDto> AtualizarItemAsync(int itemId, AtualizarItemReceitaRequest request, CancellationToken ct);
    Task RemoverItemAsync(int itemId, CancellationToken ct);
}

public interface IReceitasCompletasService
{
    Task<IReadOnlyList<ReceitaCompletaDto>> ListarAsync(bool ativos, CancellationToken ct);
    Task<ReceitaCompletaDto?> ObterAsync(int id, CancellationToken ct);
    Task<ReceitaCompletaDto> CriarAsync(CriarReceitaCompletaRequest request, CancellationToken ct);
    Task<ReceitaCompletaDto> AtualizarAsync(int id, AtualizarReceitaCompletaRequest request, CancellationToken ct);
    Task InativarAsync(int id, CancellationToken ct);
    Task<ItemReceitaDto> AdicionarItemAsync(int receitaId, ItemReceitaRequest request, CancellationToken ct);
    Task<ItemReceitaDto> AdicionarComponenteAsync(int receitaId, ItemReceitaRequest request, CancellationToken ct);
    Task<ItemReceitaDto> AtualizarItemAsync(int itemId, AtualizarItemReceitaRequest request, CancellationToken ct);
    Task RemoverItemAsync(int itemId, CancellationToken ct);
}

public interface IProdutosService
{
    Task<IReadOnlyList<ProdutoDto>> ListarAsync(CancellationToken ct);
    Task<IReadOnlyList<ProdutoPublicoDto>> ListarPublicosAsync(CancellationToken ct);
    Task<ProdutoDto?> ObterAsync(int id, CancellationToken ct);
    Task<ProdutoPublicoDto?> ObterPublicoAsync(int id, CancellationToken ct);
    Task<ProdutoDto> CriarAsync(CriarProdutoRequest request, CancellationToken ct);
    Task<ProdutoDto> AtualizarAsync(int id, AtualizarProdutoRequest request, CancellationToken ct);
    Task InativarAsync(int id, CancellationToken ct);
    Task<ProdutoComponenteDto> AdicionarComponenteAsync(int produtoId, ProdutoComponenteRequest request, CancellationToken ct);
    Task<ProdutoComponenteDto> AtualizarComponenteAsync(int id, ProdutoComponenteRequest request, CancellationToken ct);
    Task RemoverComponenteAsync(int id, CancellationToken ct);
    Task<ItemExtraProdutoDto> AdicionarItemExtraAsync(int produtoId, ItemExtraProdutoRequest request, CancellationToken ct);
    Task<ItemExtraProdutoDto> AtualizarItemExtraAsync(int id, ItemExtraProdutoRequest request, CancellationToken ct);
    Task RemoverItemExtraAsync(int id, CancellationToken ct);
}

public interface IPrecificacaoService
{
    Task<PrecificacaoDto?> ObterAsync(int produtoId, CancellationToken ct);
    Task<PrecificacaoDto> AtualizarAsync(int produtoId, AtualizarPrecificacaoRequest request, CancellationToken ct);
    Task<ComposicaoCustoDto?> ObterComposicaoAsync(int produtoId, CancellationToken ct);
    Task<IReadOnlyList<RelatorioCustoDto>> RelatorioAsync(bool? alerta, bool? margemAbaixoSugerida, CancellationToken ct);
    Task<byte[]> ExportarAsync(bool? alerta, bool? margemAbaixoSugerida, CancellationToken ct);
}
