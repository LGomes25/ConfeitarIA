using System.Security.Claims;
using ConfeitarIA.Application.DTOs;
using ConfeitarIA.API.Controllers;
using ConfeitarIA.Infrastructure.Persistence.Context;
using ConfeitarIA.Infrastructure.Persistence.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ConfeitarIA.API.Controllers;

[ApiController]
[Route("api/meu-perfil")]
[Authorize]
[Produces("application/json")]
public sealed class MeuPerfilController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _users;
    private readonly ConfeitarIADbContext _db;

    public MeuPerfilController(UserManager<ApplicationUser> users, ConfeitarIADbContext db)
    {
        _users = users;
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<MeuPerfilDto>> Obter(CancellationToken cancellationToken)
    {
        var user = await _db.Users
            .Include(item => item.Enderecos)
            .SingleOrDefaultAsync(item => item.Id == UsuarioId(), cancellationToken);
        if (user is null)
        {
            return Unauthorized();
        }

        var roles = await _users.GetRolesAsync(user);
        return Ok(new MeuPerfilDto(
            user.Id,
            user.NomeApelido,
            user.Email,
            user.PhoneNumber,
            user.NotificarPorWhatsApp,
            user.NotificarPorEmail,
            user.SenhaTemporaria,
            roles.ToArray(),
            user.Enderecos.Select(ToDto).ToArray()));
    }

    [HttpPut]
    public async Task<IActionResult> Atualizar(AtualizarPerfilRequest request)
    {
        var user = await _users.FindByIdAsync(UsuarioId());
        if (user is null)
        {
            return Unauthorized();
        }

        var email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim();
        var phone = AuthController.NormalizePhone(request.Telefone);
        if (email is null && phone is null)
        {
            return BadRequest(new { mensagem = "Informe um email ou telefone para manter sua conta acessível." });
        }
        if (!string.IsNullOrWhiteSpace(request.Telefone) && phone is null)
        {
            return BadRequest(new { mensagem = "Informe um telefone válido." });
        }
        if (email is not null)
        {
            var emailUser = await _users.FindByEmailAsync(email);
            if (emailUser is not null && emailUser.Id != user.Id)
            {
                return BadRequest(new { mensagem = "Este email já está cadastrado." });
            }
        }
        if (phone is not null && await _db.Users.AnyAsync(item => item.PhoneNumber == phone && item.Id != user.Id))
        {
            return BadRequest(new { mensagem = "Este telefone já está cadastrado." });
        }

        user.NomeApelido = request.NomeApelido.Trim();
        user.Email = email;
        user.PhoneNumber = phone;
        user.NotificarPorEmail = request.NotificarPorEmail;
        user.NotificarPorWhatsApp = request.NotificarPorWhatsApp;
        if (string.IsNullOrWhiteSpace(user.UserName))
        {
            user.UserName = email ?? phone;
        }
        var result = await _users.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest(new { mensagem = "Não foi possível atualizar seus dados." });
        }
        return NoContent();
    }

    [HttpPost("endereco-{tipo}")]
    [HttpPut("endereco-{tipo}")]
    public async Task<ActionResult<EnderecoDto>> SalvarEndereco(
        string tipo,
        SalvarEnderecoRequest request,
        CancellationToken cancellationToken)
    {
        var canonicalType = tipo.Equals("residencial", StringComparison.OrdinalIgnoreCase)
            ? "Residencial"
            : tipo.Equals("entrega", StringComparison.OrdinalIgnoreCase)
                ? "Entrega"
                : null;
        if (canonicalType is null)
        {
            return BadRequest(new { mensagem = "Tipo de endereço inválido." });
        }

        var userId = UsuarioId();
        var address = await _db.Enderecos.SingleOrDefaultAsync(
            item => item.UsuarioId == userId && item.Tipo == canonicalType,
            cancellationToken);
        if (address is null)
        {
            address = new Endereco { UsuarioId = userId, Tipo = canonicalType };
            _db.Enderecos.Add(address);
        }

        address.Logradouro = request.Logradouro?.Trim();
        address.Numero = request.Numero?.Trim();
        address.Bairro = request.Bairro?.Trim();
        address.Cidade = request.Cidade?.Trim();
        address.UF = request.UF?.Trim().ToUpperInvariant();
        address.CEP = request.CEP?.Trim();
        address.Complemento = request.Complemento?.Trim();
        await _db.SaveChangesAsync(cancellationToken);
        return Ok(ToDto(address));
    }

    private string UsuarioId() => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;

    private static EnderecoDto ToDto(Endereco address) => new(
        address.Id,
        address.Tipo,
        address.Logradouro,
        address.Numero,
        address.Bairro,
        address.Cidade,
        address.UF,
        address.CEP,
        address.Complemento);
}
