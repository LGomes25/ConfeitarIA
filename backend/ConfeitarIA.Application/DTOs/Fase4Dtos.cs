using System.ComponentModel.DataAnnotations;

namespace ConfeitarIA.Application.DTOs;

/// <summary>Insumo e seu custo atual dentro de uma receita ou componente.</summary>
public sealed record ItemReceitaDto(int Id, int? InsumoId, string? InsumoNome, string? UnidadeMedida,
    int? ComponenteId, string? ComponenteNome, decimal Quantidade, decimal ValorUnitarioNoCusto,
    decimal CustoItem, DateTimeOffset DataUltimaAlteracao, IReadOnlyList<ItemReceitaDto>? ItensComponente = null);

/// <summary>Componente com itens e custo de seus insumos.</summary>
public sealed record ComponenteDto(int Id, string Nome, string? Descricao, int? TempoPreparoMinutos, bool Ativo,
    DateTimeOffset DataCriacao, DateTimeOffset DataUltimaAlteracao, decimal CustoTotal, IReadOnlyList<ItemReceitaDto> Itens);

/// <summary>Dados para cadastrar um componente.</summary>
public sealed record CriarComponenteRequest
{
    [Required, StringLength(150, MinimumLength = 1)]
    public required string Nome { get; init; }
    public string? Descricao { get; init; }
    [Range(0, 100000)]
    public int? TempoPreparoMinutos { get; init; }
    public bool Ativo { get; init; } = true;
}

/// <summary>Dados para atualizar um componente.</summary>
public sealed record AtualizarComponenteRequest
{
    [Required, StringLength(150, MinimumLength = 1)]
    public required string Nome { get; init; }
    public string? Descricao { get; init; }
    [Range(0, 100000)]
    public int? TempoPreparoMinutos { get; init; }
    public bool Ativo { get; init; } = true;
}

/// <summary>Insumo e quantidade a incluir em uma receita ou componente.</summary>
public sealed record ItemReceitaRequest
{
    [Range(1, int.MaxValue)]
    public int? InsumoId { get; init; }
    [Range(1, int.MaxValue)]
    public int? ComponenteId { get; init; }
    [DecimalRange("0,0001", "99999999,9999")]
    public decimal Quantidade { get; init; }
}

/// <summary>Nova quantidade de um insumo; o custo unitário é obtido da compra mais recente.</summary>
public sealed record AtualizarItemReceitaRequest
{
    [DecimalRange("0,0001", "99999999,9999")]
    public decimal Quantidade { get; init; }
}

/// <summary>Receita completa com itens e custo dos insumos.</summary>
public sealed record ReceitaCompletaDto(int Id, string Nome, string? Descricao, int? TempoPreparoMinutos,
    string? Rendimento, bool Ativo, DateTimeOffset DataCriacao, DateTimeOffset DataUltimaAlteracao,
    decimal CustoTotal, IReadOnlyList<ItemReceitaDto> Itens);

/// <summary>Dados para cadastrar uma receita completa.</summary>
public sealed record CriarReceitaCompletaRequest
{
    [Required, StringLength(150, MinimumLength = 1)]
    public required string Nome { get; init; }
    public string? Descricao { get; init; }
    [Range(0, 100000)]
    public int? TempoPreparoMinutos { get; init; }
    [StringLength(100)]
    public string? Rendimento { get; init; }
    public bool Ativo { get; init; } = true;
}

/// <summary>Dados para atualizar uma receita completa.</summary>
public sealed record AtualizarReceitaCompletaRequest
{
    [Required, StringLength(150, MinimumLength = 1)]
    public required string Nome { get; init; }
    public string? Descricao { get; init; }
    [Range(0, 100000)]
    public int? TempoPreparoMinutos { get; init; }
    [StringLength(100)]
    public string? Rendimento { get; init; }
    public bool Ativo { get; init; } = true;
}

/// <summary>Campos permitidos na vitrine pública.</summary>
public sealed record ProdutoPublicoDto(string NomePublico, string? DescricaoPublica, string? IngredientesPrincipais);

/// <summary>Componente ou receita completa vinculada a um produto.</summary>
public sealed record ProdutoComponenteDto(int Id, int? ComponenteId, string? ComponenteNome,
    int? ReceitaCompletaId, string? ReceitaCompletaNome, int Ordem);

/// <summary>Item adicional de composição do produto.</summary>
public sealed record ItemExtraProdutoDto(int Id, int? InsumoId, string? DescricaoItem, decimal? Quantidade,
    decimal ValorUnitario, decimal CustoItem, string? InsumoNome);

/// <summary>Produto com composição detalhada para perfis autorizados.</summary>
public sealed record ProdutoDto(int Id, string NomePublico, string? DescricaoPublica, string? IngredientesPrincipais,
    int? CategoriaProdutoId, int? ReceitaCompletaId, string? ReceitaCompletaNome, bool SemLactose,
    bool SemGluten, bool Vegano, string? EspecificacaoExtra, bool ApresentarAoPublico, bool Ativo,
    DateTimeOffset DataCriacao, DateTimeOffset DataUltimaAlteracao,
    IReadOnlyList<ProdutoComponenteDto> Componentes, IReadOnlyList<ItemExtraProdutoDto> ItensExtras);

/// <summary>Componente ou receita a vincular ao produto.</summary>
public sealed record ProdutoComponenteRequest
{
    public int? ComponenteId { get; init; }
    public int? ReceitaCompletaId { get; init; }
    [Range(0, int.MaxValue)]
    public int Ordem { get; init; }
}

/// <summary>Item extra cadastrado ou descrição livre.</summary>
public sealed record ItemExtraProdutoRequest
{
    public int? InsumoId { get; init; }
    [StringLength(200)]
    public string? DescricaoItem { get; init; }
    [DecimalRange("0,0001", "99999999,9999")]
    public decimal? Quantidade { get; init; }
    [DecimalRange("0", "999999,999999")]
    public decimal? ValorUnitario { get; init; }
}

/// <summary>Dados para criar produto e, opcionalmente, sua composição inicial.</summary>
public sealed record CriarProdutoRequest
{
    [Required, StringLength(200, MinimumLength = 1)]
    public required string NomePublico { get; init; }
    public string? DescricaoPublica { get; init; }
    public string? IngredientesPrincipais { get; init; }
    [Range(1, int.MaxValue)]
    public int? CategoriaProdutoId { get; init; }
    public int? ReceitaCompletaId { get; init; }
    public bool SemLactose { get; init; }
    public bool SemGluten { get; init; }
    public bool Vegano { get; init; }
    [StringLength(100)]
    public string? EspecificacaoExtra { get; init; }
    public bool ApresentarAoPublico { get; init; }
    public bool Ativo { get; init; } = true;
    [Required]
    public IReadOnlyList<ProdutoComponenteRequest> Componentes { get; init; } = Array.Empty<ProdutoComponenteRequest>();
    [Required]
    public IReadOnlyList<ItemExtraProdutoRequest> ItensExtras { get; init; } = Array.Empty<ItemExtraProdutoRequest>();
}

/// <summary>Dados públicos e status para atualizar um produto.</summary>
public sealed record AtualizarProdutoRequest
{
    [Required, StringLength(200, MinimumLength = 1)]
    public required string NomePublico { get; init; }
    public string? DescricaoPublica { get; init; }
    public string? IngredientesPrincipais { get; init; }
    [Range(1, int.MaxValue)]
    public int? CategoriaProdutoId { get; init; }
    public bool SemLactose { get; init; }
    public bool SemGluten { get; init; }
    public bool Vegano { get; init; }
    [StringLength(100)]
    public string? EspecificacaoExtra { get; init; }
    public bool ApresentarAoPublico { get; init; }
    public bool Ativo { get; init; } = true;
}

/// <summary>Custos, preço sugerido e margens calculadas de um produto.</summary>
public sealed record PrecificacaoDto(int ProdutoId, decimal CustoTotalInsumos, int? TempoMaoObraMinutos,
    decimal? ValorHoraMaoObra, decimal? CustoMaoDeObra, decimal? CustoTotalAnterior, decimal CustoTotal,
    decimal? VariacaoCustoPercentual, bool AlertaVariacaoPreco, decimal MargemSugeridaPercentual,
    decimal PrecoSugerido, decimal PrecoVendaFinal, decimal LucroBruto, decimal MargemRealSobreCusto,
    decimal MargemRealSobreVenda, DateTimeOffset DataUltimaAtualizacao);

/// <summary>Preço final e valores opcionais de mão de obra.</summary>
public sealed record AtualizarPrecificacaoRequest
{
    [DecimalRange("0", "99999999,99")]
    public required decimal PrecoVendaFinal { get; init; }
    [Range(0, 100000)]
    public int? TempoMaoObraMinutos { get; init; }
    [DecimalRange("0", "99999999,99")]
    public decimal? ValorHoraMaoObra { get; init; }
}

/// <summary>Insumo ou item extra que compõe o custo do produto.</summary>
public sealed record ItemComposicaoCustoDto(string Tipo, string Descricao, decimal Quantidade,
    decimal ValorUnitario, decimal CustoItem, decimal PercentualDoCusto);

/// <summary>Composição completa, itens Pareto e demais itens de custo.</summary>
public sealed record ComposicaoCustoDto(int ProdutoId, string ProdutoNome, decimal CustoTotalInsumos,
    decimal CustoTotal, IReadOnlyList<ItemComposicaoCustoDto> Itens,
    IReadOnlyList<ItemComposicaoCustoDto> ItensPareto, IReadOnlyList<ItemComposicaoCustoDto> DemaisItens,
    decimal CustoDemaisItens);

/// <summary>Resumo de custo, preço, margem e alerta no relatório.</summary>
public sealed record RelatorioCustoDto(int ProdutoId, string NomePublico, decimal CustoTotal,
    decimal PrecoSugerido, decimal PrecoVendaFinal, decimal MargemRealSobreCusto,
    decimal MargemRealSobreVenda, decimal MargemSugeridaPercentual, bool AlertaVariacaoPreco,
    decimal? CustoTotalAnterior, decimal? VariacaoCustoPercentual);
