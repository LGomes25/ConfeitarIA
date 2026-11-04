using System.Net;
using System.Net.Http.Headers;
using System.Net.Mail;
using System.Net.Mime;
using System.Text;
using System.Text.Json;
using ConfeitarIA.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace ConfeitarIA.Infrastructure.Notifications;

public sealed class NotificationService : INotificationService
{
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;

    public NotificationService(IConfiguration configuration, IHttpClientFactory httpClientFactory)
    {
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
    }

    public async Task EnviarEmailAsync(
        string destinatario,
        string assunto,
        string mensagem,
        CancellationToken cancellationToken)
    {
        var host = _configuration["Notifications:Email:SmtpHost"];
        var sender = _configuration["Notifications:Email:Sender"];
        if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(sender))
        {
            throw new InvalidOperationException("O envio de email não está configurado.");
        }

        var port = _configuration.GetValue<int?>("Notifications:Email:SmtpPort") ?? 587;
        using var client = new SmtpClient(host, port)
        {
            EnableSsl = _configuration.GetValue("Notifications:Email:EnableSsl", true)
        };
        var username = _configuration["Notifications:Email:Username"];
        var password = _configuration["Notifications:Email:Password"];
        if (!string.IsNullOrWhiteSpace(username))
        {
            client.Credentials = new NetworkCredential(username, password);
        }

        using var mail = new MailMessage(sender, destinatario, assunto, mensagem)
        {
            BodyEncoding = Encoding.UTF8,
            SubjectEncoding = Encoding.UTF8,
            IsBodyHtml = false,
            BodyTransferEncoding = TransferEncoding.Base64
        };
        await client.SendMailAsync(mail, cancellationToken);
    }

    public async Task EnviarWhatsAppAsync(
        string telefone,
        string mensagem,
        CancellationToken cancellationToken)
    {
        var endpoint = _configuration["Notifications:WhatsApp:Endpoint"];
        var accessToken = _configuration["Notifications:WhatsApp:AccessToken"];
        if (!Uri.TryCreate(endpoint, UriKind.Absolute, out var uri)
            || string.IsNullOrWhiteSpace(accessToken))
        {
            throw new InvalidOperationException("O envio por WhatsApp não está configurado.");
        }

        using var request = new HttpRequestMessage(HttpMethod.Post, uri)
        {
            Content = new StringContent(
                JsonSerializer.Serialize(new { to = telefone, message = mensagem }),
                Encoding.UTF8,
                MediaTypeNames.Application.Json)
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        using var response = await _httpClientFactory.CreateClient().SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();
    }
}
