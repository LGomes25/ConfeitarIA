using System.ComponentModel.DataAnnotations;

namespace ConfeitarIA.Application.DTOs;

public sealed class CadastroRequest
{
    [Required, StringLength(100, MinimumLength = 3)]
    public string NomeApelido { get; init; } = string.Empty;
    [EmailAddress, StringLength(150)]
    public string? Email { get; init; }
    [StringLength(20)]
    public string? Telefone { get; init; }
    [Required, MinLength(6)]
    public string Senha { get; init; } = string.Empty;
    public bool NotificarPorWhatsApp { get; init; } = true;
    public bool NotificarPorEmail { get; init; } = true;
}

public sealed class LoginRequest
{
    [Required]
    public string TipoLogin { get; init; } = string.Empty;
    [Required]
    public string Identificador { get; init; } = string.Empty;
    [Required]
    public string Senha { get; init; } = string.Empty;
}

public sealed record UsuarioResumoDto(
    string Id,
    string NomeApelido,
    string? Email,
    string? Telefone,
    bool Ativo,
    bool SenhaTemporaria,
    IReadOnlyList<string> Perfis);

public sealed record SessaoDto(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt,
    UsuarioResumoDto Usuario);

public sealed class RefreshRequest
{
    [Required]
    public string RefreshToken { get; init; } = string.Empty;
}

public sealed class LogoutRequest
{
    [Required]
    public string RefreshToken { get; init; } = string.Empty;
}

public sealed class RecuperarSenhaRequest
{
    [Required]
    public string Identificador { get; init; } = string.Empty;
}

public sealed class RedefinirSenhaRequest
{
    [Required]
    public string Identificador { get; init; } = string.Empty;
    [Required]
    public string Token { get; init; } = string.Empty;
    [Required, MinLength(6)]
    public string NovaSenha { get; init; } = string.Empty;
}

public sealed class AlterarSenhaRequest
{
    [Required]
    public string SenhaAtual { get; init; } = string.Empty;
    [Required, MinLength(6)]
    public string NovaSenha { get; init; } = string.Empty;
}

public sealed class AlterarPerfisRequest
{
    [Required, MinLength(1)]
    public List<string> Perfis { get; init; } = [];
}

public sealed record EnderecoDto(
    long? Id,
    string Tipo,
    string? Logradouro,
    string? Numero,
    string? Bairro,
    string? Cidade,
    string? UF,
    string? CEP,
    string? Complemento);

public sealed class AtualizarPerfilRequest
{
    [Required, StringLength(100, MinimumLength = 3)]
    public string NomeApelido { get; init; } = string.Empty;
    [EmailAddress, StringLength(150)]
    public string? Email { get; init; }
    [StringLength(20)]
    public string? Telefone { get; init; }
    public bool NotificarPorWhatsApp { get; init; } = true;
    public bool NotificarPorEmail { get; init; } = true;
}

public sealed record MeuPerfilDto(
    string Id,
    string NomeApelido,
    string? Email,
    string? Telefone,
    bool NotificarPorWhatsApp,
    bool NotificarPorEmail,
    bool SenhaTemporaria,
    IReadOnlyList<string> Perfis,
    IReadOnlyList<EnderecoDto> Enderecos);

public sealed class SalvarEnderecoRequest
{
    [Required]
    public string Tipo { get; init; } = string.Empty;
    [StringLength(200)]
    public string? Logradouro { get; init; }
    [StringLength(20)]
    public string? Numero { get; init; }
    [StringLength(100)]
    public string? Bairro { get; init; }
    [StringLength(100)]
    public string? Cidade { get; init; }
    [StringLength(2)]
    public string? UF { get; init; }
    [StringLength(10)]
    public string? CEP { get; init; }
    public string? Complemento { get; init; }
}
