namespace ConfeitarIA.Domain.Exceptions;

public class EntityNotFoundException : DomainException
{
    public EntityNotFoundException(string entityName, object key)
        : base($"{entityName} com identificador '{key}' não foi encontrado(a).")
    {
    }
}

