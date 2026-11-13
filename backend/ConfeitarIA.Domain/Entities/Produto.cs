using ConfeitarIA.Domain.Exceptions;

namespace ConfeitarIA.Domain.Entities;

public class Produto
{
    protected Produto() => NomePublico = string.Empty;

    public Produto(string nomePublico, string? descricaoPublica, string? ingredientesPrincipais, int? categoriaProdutoId,
        bool ativo = true, int? receitaCompletaId = null, bool semLactose = false, bool semGluten = false,
        bool vegano = false, string? especificacaoExtra = null, bool apresentarAoPublico = false)
        : this()
    {
        Atualizar(nomePublico, descricaoPublica, ingredientesPrincipais, categoriaProdutoId, ativo,
            receitaCompletaId, semLactose, semGluten, vegano, especificacaoExtra, apresentarAoPublico);
        DataCriacao = DateTime.UtcNow;
        DataUltimaAlteracao = DataCriacao;
    }

    public int Id { get; protected set; }
    public string NomePublico { get; protected set; }
    public string? DescricaoPublica { get; protected set; }
    public string? IngredientesPrincipais { get; protected set; }
    public int? CategoriaProdutoId { get; protected set; }
    public int? ReceitaCompletaId { get; protected set; }
    public ReceitaCompleta? ReceitaCompleta { get; protected set; }
    public bool SemLactose { get; protected set; }
    public bool SemGluten { get; protected set; }
    public bool Vegano { get; protected set; }
    public string? EspecificacaoExtra { get; protected set; }
    public bool ApresentarAoPublico { get; protected set; }
    public bool Ativo { get; protected set; }
    public DateTime DataCriacao { get; protected set; }
    public DateTime DataUltimaAlteracao { get; protected set; }
    public virtual ICollection<ProdutoComponente> Componentes { get; protected set; } = new List<ProdutoComponente>();
    public virtual ICollection<ItemExtraProduto> ItensExtras { get; protected set; } = new List<ItemExtraProduto>();
    public virtual Precificacao? Precificacao { get; protected set; }

    public void Atualizar(string nomePublico, string? descricaoPublica, string? ingredientesPrincipais, int? categoriaProdutoId,
        bool ativo, int? receitaCompletaId = null, bool semLactose = false, bool semGluten = false,
        bool vegano = false, string? especificacaoExtra = null, bool apresentarAoPublico = false)
    {
        if (string.IsNullOrWhiteSpace(nomePublico) || nomePublico.Trim().Length > 200)
            throw new BusinessRuleException("O nome público é obrigatório e deve ter até 200 caracteres.");
        NomePublico = nomePublico.Trim();
        DescricaoPublica = string.IsNullOrWhiteSpace(descricaoPublica) ? null : descricaoPublica.Trim();
        IngredientesPrincipais = string.IsNullOrWhiteSpace(ingredientesPrincipais) ? null : ingredientesPrincipais.Trim();
        CategoriaProdutoId = categoriaProdutoId;
        ReceitaCompletaId = receitaCompletaId;
        SemLactose = semLactose;
        SemGluten = semGluten;
        Vegano = vegano;
        EspecificacaoExtra = string.IsNullOrWhiteSpace(especificacaoExtra) ? null : especificacaoExtra.Trim();
        ApresentarAoPublico = apresentarAoPublico;
        Ativo = ativo;
        DataUltimaAlteracao = DateTime.UtcNow;
    }

    public void Inativar()
    {
        Ativo = false;
        DataUltimaAlteracao = DateTime.UtcNow;
    }
}
