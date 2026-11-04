using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using ConfeitarIA.Application.DTOs;
using ConfeitarIA.Infrastructure.Persistence.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace ConfeitarIA.API.Services;

public sealed class JwtTokenService
{
    private readonly IConfiguration _configuration;
    private readonly UserManager<ApplicationUser> _userManager;

    public JwtTokenService(IConfiguration configuration, UserManager<ApplicationUser> userManager)
    {
        _configuration = configuration;
        _userManager = userManager;
    }

    public async Task<SessaoDto> CriarSessaoAsync(ApplicationUser user, CancellationToken cancellationToken)
    {
        var minutes = _configuration.GetValue<int>("Jwt:AccessTokenMinutes", 30);
        var expiresAt = DateTime.UtcNow.AddMinutes(minutes);
        var roles = await _userManager.GetRolesAsync(user);
        var refreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(48));
        var refreshTokenHash = HashRefreshToken(refreshToken);
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, user.NomeApelido),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new("rtid", refreshTokenHash),
            new("senhaTemporaria", user.SenhaTemporaria.ToString().ToLowerInvariant())
        };
        if (!string.IsNullOrWhiteSpace(user.Email))
        {
            claims.Add(new Claim(JwtRegisteredClaimNames.Email, user.Email));
        }

        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"]!));
        var signingCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: expiresAt,
            signingCredentials: signingCredentials);
        var accessToken = new JwtSecurityTokenHandler().WriteToken(token);

        user.RefreshTokens.Add(new RefreshToken
        {
            Token = refreshTokenHash,
            ExpiraEm = DateTime.UtcNow.AddDays(7)
        });

        return new SessaoDto(
            accessToken,
            refreshToken,
            expiresAt,
            new UsuarioResumoDto(
                user.Id,
                user.NomeApelido,
                user.Email,
                user.PhoneNumber,
                user.Ativo,
                user.SenhaTemporaria,
                roles.ToArray()));
    }

    public static string HashRefreshToken(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
}
