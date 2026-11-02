using ConfeitarIA.Domain.Exceptions;

namespace ConfeitarIA.Domain.Entities;

public class Insumo
{
    // Construtor sem parâmetros para o EF Core
    protected Insumo()
    {
        Nome = string.Empty;
        UnidadeMedida = string.Empty;
        RegistrosCompra = new List<RegistroCompra>();
    }

    public Insumo(string nome, string unidadeMedida) : this()
    {
        DefinirNome(nome);
        DefinirUnidadeMedida(unidadeMedida);
        Ativo = true;
        DataCriacao = DateTime.UtcNow;
    }

    public int Id { get; protected set; }
    public string Nome { get; protected set; }
    public string UnidadeMedida { get; protected set; }
    public bool Ativo { get; protected set; }
    public DateTime DataCriacao { get; protected set; }

    public virtual ICollection<RegistroCompra> RegistrosCompra { get; protected set; }

    public void Atualizar(string nome, string unidadeMedida)
    {
        DefinirNome(nome);
        DefinirUnidadeMedida(unidadeMedida);
    }

    public void Inativar()
    {
        Ativo = false;
    }

    public void Reativar()
    {
        Ativo = true;
    }

    private void DefinirNome(string nome)
    {
        if (string.IsNullOrWhiteSpace(nome))
            throw new BusinessRuleException("O nome do insumo é obrigatório.");

        Nome = nome.Trim();
    }

    private void DefinirUnidadeMedida(string unidadeMedida)
    {
        if (string.IsNullOrWhiteSpace(unidadeMedida))
            throw new BusinessRuleException("A unidade de medida é obrigatória.");

        UnidadeMedida = unidadeMedida.Trim();
    }
}

