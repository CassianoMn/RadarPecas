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

    public static bool CnpjValido(string? cnpj)
    {
        if (string.IsNullOrWhiteSpace(cnpj)) return false;

        var digitos = new string(cnpj.Where(char.IsDigit).ToArray());
        if (digitos.Length != 14) return false;

        // Rejeita sequências repetidas (ex.: 00000000000000, 11111111111111)
        if (digitos.All(c => c == digitos[0])) return false;

        int[] mult1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        int[] mult2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

        var soma = 0;
        for (var i = 0; i < 12; i++)
        {
            soma += (digitos[i] - '0') * mult1[i];
        }
        var resto = soma % 11;
        var dv1 = resto < 2 ? 0 : 11 - resto;

        if ((digitos[12] - '0') != dv1) return false;

        soma = 0;
        for (var i = 0; i < 13; i++)
        {
            soma += (digitos[i] - '0') * mult2[i];
        }
        resto = soma % 11;
        var dv2 = resto < 2 ? 0 : 11 - resto;

        return (digitos[13] - '0') == dv2;
    }

    public static bool CoordenadasValidas(decimal latitude, decimal longitude)
    {
        if (latitude == 0m && longitude == 0m) return false;
        return latitude >= -90m && latitude <= 90m && longitude >= -180m && longitude <= 180m;
    }
}
