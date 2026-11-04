namespace ConfeitarIA.Infrastructure.Persistence.Entities;

public class Endereco
{
    public long Id { get; set; }
    public string UsuarioId { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public string? Logradouro { get; set; }
    public string? Numero { get; set; }
    public string? Bairro { get; set; }
    public string? Cidade { get; set; }
    public string? UF { get; set; }
    public string? CEP { get; set; }
    public string? Complemento { get; set; }
    public ApplicationUser Usuario { get; set; } = null!;
}
