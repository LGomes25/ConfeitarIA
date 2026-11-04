namespace ConfeitarIA.Application.Interfaces;

public interface INotificationService
{
    Task EnviarEmailAsync(string destinatario, string assunto, string mensagem, CancellationToken cancellationToken);
    Task EnviarWhatsAppAsync(string telefone, string mensagem, CancellationToken cancellationToken);
}
