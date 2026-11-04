using System.Security.Claims;
using ConfeitarIA.API.Services;
using ConfeitarIA.Application.DTOs;
using ConfeitarIA.Application.Interfaces;
using ConfeitarIA.Infrastructure.Persistence.Context;
using ConfeitarIA.Infrastructure.Persistence.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ConfeitarIA.API.Controllers;

[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public sealed class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _users;
    private readonly ConfeitarIADbContext _db;
    private readonly JwtTokenService _tokens;
    private readonly INotificationService _notifications;

    public AuthController(
        UserManager<ApplicationUser> users,
        ConfeitarIADbContext db,
        JwtTokenService tokens,
        INotificationService notifications)
    {
        _users = users;
        _db = db;
        _tokens = tokens;
        _notifications = notifications;
    }

    [AllowAnonymous]
    [HttpPost("cadastro")]
    public async Task<IActionResult> Cadastro(CadastroRequest request)
    {
        var email = NormalizeOptional(request.Email);
        var phone = NormalizePhone(request.Telefone);
        if (email is null && phone is null)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Dados de cadastro inválidos",
                Detail = "Informe um email ou telefone para criar sua conta.",
                Status = StatusCodes.Status400BadRequest
            });
        }
        if (!string.IsNullOrWhiteSpace(request.Telefone) && phone is null)
        {
            ModelState.AddModelError(nameof(request.Telefone), "Informe um telefone válido.");
            return ValidationProblem(ModelState);
        }
        if (email is not null && await _users.FindByEmailAsync(email) is not null)
        {
            ModelState.AddModelError(nameof(request.Email), "Este email já está cadastrado.");
            return ValidationProblem(ModelState);
        }
        if (phone is not null && await PhoneInUseAsync(phone))
        {
            ModelState.AddModelError(nameof(request.Telefone), "Este telefone já está cadastrado.");
            return ValidationProblem(ModelState);
        }

        var user = new ApplicationUser
        {
            UserName = email ?? phone,
            Email = email,
            PhoneNumber = phone,
            NomeApelido = request.NomeApelido.Trim(),
            NotificarPorEmail = request.NotificarPorEmail,
            NotificarPorWhatsApp = request.NotificarPorWhatsApp,
            Ativo = true,
            LockoutEnabled = true
        };
        var result = await _users.CreateAsync(user, request.Senha);
        if (!result.Succeeded)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Não foi possível criar a conta",
                Detail = string.Join(" ", result.Errors.Select(error => TranslateIdentityError(error.Code))),
                Status = StatusCodes.Status400BadRequest
            });
        }

        var roleResult = await _users.AddToRoleAsync(user, "Customer");
        if (!roleResult.Succeeded)
        {
            await _users.DeleteAsync(user);
            return Problem(
                title: "Não foi possível concluir o cadastro.",
                detail: "Tente novamente mais tarde.",
                statusCode: StatusCodes.Status500InternalServerError);
        }

        return Ok(new { mensagem = "Conta criada com sucesso! Já pode entrar." });
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<SessaoDto>> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var identifier = request.TipoLogin.Equals("Email", StringComparison.OrdinalIgnoreCase)
            ? NormalizeOptional(request.Identificador)
            : request.TipoLogin.Equals("Telefone", StringComparison.OrdinalIgnoreCase)
                ? NormalizePhone(request.Identificador)
                : null;
        if (identifier is null)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Forma de login inválida",
                Detail = "Escolha entrar com email ou telefone.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        var user = request.TipoLogin.Equals("Email", StringComparison.OrdinalIgnoreCase)
            ? await _users.FindByEmailAsync(identifier)
            : await _db.Users.SingleOrDefaultAsync(u => u.PhoneNumber == identifier, cancellationToken);
        if (user is null || !user.Ativo)
        {
            return Unauthorized(new { mensagem = "Email, telefone ou senha incorretos." });
        }
        if (user.LockoutEnd is { } lockoutEnd && lockoutEnd > DateTimeOffset.UtcNow)
        {
            return StatusCode(StatusCodes.Status423Locked, new
            {
                mensagem = "Conta bloqueada por 10 minutos. Tente novamente mais tarde.",
                desbloqueioEm = lockoutEnd
            });
        }

        if (!await _users.CheckPasswordAsync(user, request.Senha))
        {
            var failureResult = await _users.AccessFailedAsync(user);
            if (!failureResult.Succeeded)
            {
                return Problem(
                    title: "Não foi possível validar o acesso.",
                    detail: "Tente novamente mais tarde.",
                    statusCode: StatusCodes.Status500InternalServerError);
            }
            if (await _users.IsLockedOutAsync(user))
            {
                return StatusCode(StatusCodes.Status423Locked, new
                {
                    mensagem = "Conta bloqueada por 10 minutos. Tente novamente mais tarde.",
                    desbloqueioEm = user.LockoutEnd
                });
            }
            return Unauthorized(new { mensagem = "Email, telefone ou senha incorretos." });
        }
        var resetFailureCount = await _users.ResetAccessFailedCountAsync(user);
        if (!resetFailureCount.Succeeded)
        {
            return Problem(
                title: "Não foi possível validar o acesso.",
                detail: "Tente novamente mais tarde.",
                statusCode: StatusCodes.Status500InternalServerError);
        }

        var session = await _tokens.CriarSessaoAsync(user, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
        return Ok(session);
    }

    [AllowAnonymous]
    [HttpPost("refresh")]
    public async Task<ActionResult<SessaoDto>> Refresh(RefreshRequest request, CancellationToken cancellationToken)
    {
        var tokenHash = JwtTokenService.HashRefreshToken(request.RefreshToken);
        var storedToken = await _db.RefreshTokens
            .Include(token => token.Usuario)
            .SingleOrDefaultAsync(token => token.Token == tokenHash, cancellationToken);
        if (storedToken is null || storedToken.RevogadoEm is not null
            || storedToken.ExpiraEm <= DateTime.UtcNow || !storedToken.Usuario.Ativo)
        {
            return Unauthorized(new { mensagem = "Sua sessão expirou. Entre novamente." });
        }

        storedToken.RevogadoEm = DateTime.UtcNow;
        var session = await _tokens.CriarSessaoAsync(storedToken.Usuario, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
        return Ok(session);
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout(LogoutRequest request, CancellationToken cancellationToken)
    {
        var tokenHash = JwtTokenService.HashRefreshToken(request.RefreshToken);
        var storedToken = await _db.RefreshTokens.SingleOrDefaultAsync(
            token => token.Token == tokenHash,
            cancellationToken);
        if (storedToken is not null && storedToken.UsuarioId == User.FindFirstValue(ClaimTypes.NameIdentifier))
        {
            storedToken.RevogadoEm = DateTime.UtcNow;
            await _db.SaveChangesAsync(cancellationToken);
        }
        return NoContent();
    }

    [AllowAnonymous]
    [HttpPost("esqueci-senha")]
    public async Task<IActionResult> EsqueciSenha(
        RecuperarSenhaRequest request,
        CancellationToken cancellationToken)
    {
        var user = await FindUserByIdentifierAsync(request.Identificador, cancellationToken);
        if (user is not null && user.Ativo)
        {
            var token = await _users.GeneratePasswordResetTokenAsync(user);
            var message = $"Use este código para redefinir sua senha: {token}";
            var notifications = new List<Task>();
            if (user.NotificarPorEmail && !string.IsNullOrWhiteSpace(user.Email))
            {
                notifications.Add(_notifications.EnviarEmailAsync(
                    user.Email,
                    "Recuperação de senha - ConfeitarIA",
                    message,
                    cancellationToken));
            }
            if (user.NotificarPorWhatsApp && !string.IsNullOrWhiteSpace(user.PhoneNumber))
            {
                notifications.Add(_notifications.EnviarWhatsAppAsync(
                    user.PhoneNumber,
                    message,
                    cancellationToken));
            }
            await Task.WhenAll(notifications);
        }

        return Ok(new
        {
            mensagem = "Se os dados estiverem cadastrados, enviaremos as instruções de recuperação."
        });
    }

    [AllowAnonymous]
    [HttpPost("redefinir-senha")]
    public async Task<IActionResult> RedefinirSenha(RedefinirSenhaRequest request, CancellationToken cancellationToken)
    {
        var user = await FindUserByIdentifierAsync(request.Identificador, cancellationToken);
        if (user is null || !user.Ativo)
        {
            return BadRequest(new { mensagem = "Não foi possível redefinir a senha. Confira os dados enviados." });
        }

        var result = await _users.ResetPasswordAsync(user, request.Token, request.NovaSenha);
        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                mensagem = string.Join(" ", result.Errors.Select(error => TranslateIdentityError(error.Code)))
            });
        }

        user.SenhaTemporaria = false;
        await RevokeAllRefreshTokensAsync(user.Id, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
        return Ok(new { mensagem = "Senha redefinida com sucesso. Você já pode entrar." });
    }

    [Authorize]
    [HttpPost("trocar-senha")]
    public async Task<ActionResult<SessaoDto>> TrocarSenha(
        AlterarSenhaRequest request,
        CancellationToken cancellationToken)
    {
        var user = await _users.GetUserAsync(User);
        if (user is null)
        {
            return Unauthorized();
        }

        var result = await _users.ChangePasswordAsync(user, request.SenhaAtual, request.NovaSenha);
        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                mensagem = string.Join(" ", result.Errors.Select(error => TranslateIdentityError(error.Code)))
            });
        }

        user.SenhaTemporaria = false;
        await RevokeAllRefreshTokensAsync(user.Id, cancellationToken);
        var session = await _tokens.CriarSessaoAsync(user, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
        return Ok(session);
    }

    private async Task<ApplicationUser?> FindUserByIdentifierAsync(string identifier, CancellationToken cancellationToken)
    {
        var email = NormalizeOptional(identifier);
        if (email is not null && email.Contains('@'))
        {
            return await _users.FindByEmailAsync(email);
        }
        var phone = NormalizePhone(identifier);
        return phone is null
            ? null
            : await _db.Users.SingleOrDefaultAsync(user => user.PhoneNumber == phone, cancellationToken);
    }

    private async Task<bool> PhoneInUseAsync(string phone) =>
        await _db.Users.AnyAsync(user => user.PhoneNumber == phone);

    private async Task RevokeAllRefreshTokensAsync(string userId, CancellationToken cancellationToken)
    {
        await _db.RefreshTokens
            .Where(token => token.UsuarioId == userId && token.RevogadoEm == null)
            .ExecuteUpdateAsync(setters => setters.SetProperty(token => token.RevogadoEm, DateTime.UtcNow), cancellationToken);
    }

    public static string? NormalizePhone(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }
        if (value.Any(character => !char.IsDigit(character) && character is not '+' and not '(' and not ')' and not '-' and not ' '))
        {
            return null;
        }

        var digits = new string(value.Where(char.IsDigit).ToArray());
        return digits.Length is >= 10 and <= 13 ? digits : null;
    }

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static string TranslateIdentityError(string code) => code switch
    {
        "DuplicateEmail" or "DuplicateUserName" => "Este email ou telefone já está cadastrado.",
        "PasswordTooShort" => "A senha deve ter pelo menos 6 caracteres.",
        "PasswordRequiresDigit" => "A senha deve conter pelo menos um número.",
        "PasswordRequiresLower" or "PasswordRequiresUpper" => "A senha deve conter pelo menos uma letra.",
        "PasswordMismatch" => "A senha atual não confere.",
        "InvalidToken" => "O código de recuperação é inválido ou expirou.",
        _ => "Confira os dados informados e tente novamente."
    };
}
