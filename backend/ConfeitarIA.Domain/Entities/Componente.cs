using ConfeitarIA.Domain.Exceptions;

namespace ConfeitarIA.Domain.Entities;

public class Componente
{
    protected Componente() => Nome = string.Empty;

    public Componente(string nome, string? descricao, int? tempoPreparoMinutos, bool ativo = true)
        : this()
    {
        Atualizar(nome, descricao, tempoPreparoMinutos, ativo);
        DataCriacao = DateTime.UtcNow;
        DataUltimaAlteracao = DataCriacao;
    }

    public int Id { get; protected set; }
    public string Nome { get; protected set; }
    public string? Descricao { get; protected set; }
    public int? TempoPreparoMinutos { get; protected set; }
    public bool Ativo { get; protected set; }
    public DateTime DataCriacao { get; protected set; }
    public DateTime DataUltimaAlteracao { get; protected set; }
    public virtual ICollection<ItemReceita> Itens { get; protected set; } = new List<ItemReceita>();
    public virtual ICollection<ProdutoComponente> Produtos { get; protected set; } = new List<ProdutoComponente>();

    public void Atualizar(string nome, string? descricao, int? tempoPreparoMinutos, bool ativo)
    {
        if (string.IsNullOrWhiteSpace(nome) || nome.Trim().Length > 150)
            throw new BusinessRuleException("O nome do componente é obrigatório e deve ter até 150 caracteres.");
        if (tempoPreparoMinutos < 0)
            throw new BusinessRuleException("O tempo de preparo não pode ser negativo.");
        Nome = nome.Trim();
        Descricao = string.IsNullOrWhiteSpace(descricao) ? null : descricao.Trim();
        TempoPreparoMinutos = tempoPreparoMinutos;
        Ativo = ativo;
        DataUltimaAlteracao = DateTime.UtcNow;
    }

    public void Inativar()
    {
        Ativo = false;
        DataUltimaAlteracao = DateTime.UtcNow;
    }
}
