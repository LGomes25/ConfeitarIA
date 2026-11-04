namespace ConfeitarIA.Infrastructure.Persistence.Entities;

public class RefreshToken
{
    public long Id { get; set; }
    public string UsuarioId { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiraEm { get; set; }
    public DateTime? RevogadoEm { get; set; }
    public ApplicationUser Usuario { get; set; } = null!;
}
