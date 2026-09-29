using System.Net.Mail;

namespace RadarPecas.Application.Services;

/// <summary>
/// Regras de segurança para credenciais (e-mail e senha), compartilhadas pelos
/// fluxos de registro e troca de senha. Política de senha: mínimo 8 caracteres,
/// com ao menos 1 letra e 1 número.
/// </summary>
public static class SegurancaValidacao
{
    public const int SenhaTamanhoMinimo = 8;

    public static bool EmailValido(string? email)
    {
        if (string.IsNullOrWhiteSpace(email)) return false;
        try
        {
            var addr = new MailAddress(email.Trim());
            // Exige TLD (ex.: "sem@dominio" é tecnicamente válido, mas inútil p/ cadastro).
            return addr.Address == email.Trim() && addr.Host.Contains('.');
        }
        catch
        {
            return false;
        }
    }

    public static bool SenhaForte(string? senha)
    {
        if (string.IsNullOrEmpty(senha) || senha.Length < SenhaTamanhoMinimo) return false;
        var temLetra = senha.Any(char.IsLetter);
        var temDigito = senha.Any(char.IsDigit);
        return temLetra && temDigito;
    }
}
