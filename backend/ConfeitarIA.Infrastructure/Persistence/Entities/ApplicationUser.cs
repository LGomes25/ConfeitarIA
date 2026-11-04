using Microsoft.AspNetCore.Identity;

namespace ConfeitarIA.Infrastructure.Persistence.Entities;

public class ApplicationUser : IdentityUser
{
    public string NomeApelido { get; set; } = string.Empty;
    public bool NotificarPorWhatsApp { get; set; } = true;
    public bool NotificarPorEmail { get; set; } = true;
    public bool Ativo { get; set; } = true;
    public bool SenhaTemporaria { get; set; }
    public DateTimeOffset DataCriacao { get; set; } = DateTimeOffset.UtcNow;
    public ICollection<Endereco> Enderecos { get; set; } = new List<Endereco>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
