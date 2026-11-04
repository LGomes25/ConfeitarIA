using System.Security.Cryptography;
using ConfeitarIA.Application.DTOs;
using ConfeitarIA.Infrastructure.Persistence.Context;
using ConfeitarIA.Infrastructure.Persistence.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ConfeitarIA.API.Controllers;

[ApiController]
[Route("api/usuarios")]
[Authorize(Roles = "Admin")]
[Produces("application/json")]
public sealed class UsuariosController : ControllerBase
{
    private static readonly string[] PerfisPermitidos = ["Admin", "Manager", "Team", "Customer"];
    private readonly UserManager<ApplicationUser> _users;
    private readonly ConfeitarIADbContext _db;

    public UsuariosController(UserManager<ApplicationUser> users, ConfeitarIADbContext db)
    {
        _users = users;
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<UsuarioResumoDto>>> Listar(CancellationToken cancellationToken)
    {
        var users = await _db.Users.AsNoTracking().OrderBy(user => user.NomeApelido).ToListAsync(cancellationToken);
        var result = new List<UsuarioResumoDto>(users.Count);
        foreach (var user in users)
        {
            var roles = await _users.GetRolesAsync(user);
            result.Add(new UsuarioResumoDto(
                user.Id,
                user.NomeApelido,
                user.Email,
                user.PhoneNumber,
                user.Ativo,
                user.SenhaTemporaria,
                roles.ToArray()));
        }
        return Ok(result);
    }

    [HttpPatch("{id}/perfil")]
    public async Task<IActionResult> AlterarPerfil(string id, AlterarPerfisRequest request)
    {
        if (request.Perfis.Any(role => !PerfisPermitidos.Contains(role, StringComparer.Ordinal)))
        {
            return BadRequest(new { mensagem = "Selecione um perfil válido." });
        }
        var user = await _users.FindByIdAsync(id);
        if (user is null)
        {
            return NotFound(new { mensagem = "Usuário não encontrado." });
        }

        var currentRoles = await _users.GetRolesAsync(user);
        var removeResult = await _users.RemoveFromRolesAsync(user, currentRoles);
        if (!removeResult.Succeeded)
        {
            return Problem(title: "Não foi possível atualizar o perfil.", statusCode: 500);
        }
        var addResult = await _users.AddToRolesAsync(user, request.Perfis.Distinct(StringComparer.Ordinal));
        if (!addResult.Succeeded)
        {
            await _users.AddToRolesAsync(user, currentRoles);
            return Problem(title: "Não foi possível atualizar o perfil.", statusCode: 500);
        }

        return NoContent();
    }

    [HttpPost("{id}/senha-temporaria")]
    public async Task<IActionResult> GerarSenhaTemporaria(string id, CancellationToken cancellationToken)
    {
        var user = await _users.FindByIdAsync(id);
        if (user is null)
        {
            return NotFound(new { mensagem = "Usuário não encontrado." });
        }

        var password = $"Aa1{Convert.ToBase64String(RandomNumberGenerator.GetBytes(18)).Replace("+", "").Replace("/", "").Replace("=", "")}";
        var resetToken = await _users.GeneratePasswordResetTokenAsync(user);
        var resetResult = await _users.ResetPasswordAsync(user, resetToken, password);
        if (!resetResult.Succeeded)
        {
            return BadRequest(new { mensagem = "Não foi possível gerar uma senha temporária." });
        }

        user.SenhaTemporaria = true;
        await _db.RefreshTokens
            .Where(token => token.UsuarioId == user.Id && token.RevogadoEm == null)
            .ExecuteUpdateAsync(setters => setters.SetProperty(token => token.RevogadoEm, DateTime.UtcNow), cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
        return Ok(new { mensagem = "Senha temporária gerada.", senhaTemporaria = password });
    }

    [HttpPatch("{id}/bloquear")]
    public async Task<IActionResult> Bloquear(string id, CancellationToken cancellationToken)
    {
        var user = await _users.FindByIdAsync(id);
        if (user is null)
        {
            return NotFound(new { mensagem = "Usuário não encontrado." });
        }

        user.Ativo = false;
        user.LockoutEnabled = true;
        user.LockoutEnd = DateTimeOffset.MaxValue;
        var result = await _users.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return Problem(title: "Não foi possível bloquear o usuário.", statusCode: 500);
        }
        await _db.RefreshTokens
            .Where(token => token.UsuarioId == user.Id && token.RevogadoEm == null)
            .ExecuteUpdateAsync(setters => setters.SetProperty(token => token.RevogadoEm, DateTime.UtcNow), cancellationToken);
        return NoContent();
    }

    [HttpPatch("{id}/desbloquear")]
    public async Task<IActionResult> Desbloquear(string id)
    {
        var user = await _users.FindByIdAsync(id);
        if (user is null)
        {
            return NotFound(new { mensagem = "Usuário não encontrado." });
        }

        user.Ativo = true;
        user.LockoutEnd = null;
        user.AccessFailedCount = 0;
        var result = await _users.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return Problem(title: "Não foi possível desbloquear o usuário.", statusCode: 500);
        }
        return NoContent();
    }
}
