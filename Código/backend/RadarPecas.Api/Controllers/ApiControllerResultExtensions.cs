using Microsoft.AspNetCore.Mvc;
using RadarPecas.Application.DTOs.Common;

namespace RadarPecas.Api.Controllers;

internal static class ApiControllerResultExtensions
{
    public static IActionResult ToFailureResult<T>(
        this ControllerBase controller,
        ApiResponse<T> result,
        bool allowUnauthorized = false)
    {
        var message = result.Message ?? string.Empty;

        if (allowUnauthorized && IsUnauthorizedMessage(message))
            return controller.Unauthorized(result);

        if (IsForbiddenMessage(message))
            return controller.StatusCode(StatusCodes.Status403Forbidden, result);

        if (IsNotFoundMessage(message))
            return controller.NotFound(result);

        if (IsUnprocessableDomainMessage(message))
            return controller.UnprocessableEntity(result);

        return controller.BadRequest(result);
    }

    private static bool IsUnauthorizedMessage(string message) =>
        message.Contains("Credenciais inválidas", StringComparison.OrdinalIgnoreCase);

    private static bool IsForbiddenMessage(string message) =>
        message.Contains("Acesso negado", StringComparison.OrdinalIgnoreCase)
        || message.Contains("não tem permissão", StringComparison.OrdinalIgnoreCase)
        || message.Contains("pertence a outro", StringComparison.OrdinalIgnoreCase)
        || message.Contains("pertence a outra", StringComparison.OrdinalIgnoreCase);

    private static bool IsNotFoundMessage(string message) =>
        message.Contains("não encontrad", StringComparison.OrdinalIgnoreCase)
        || message.Contains("Nenhuma loja vinculada", StringComparison.OrdinalIgnoreCase);

    private static bool IsUnprocessableDomainMessage(string message) =>
        message.Contains("já está cadastrad", StringComparison.OrdinalIgnoreCase)
        || message.Contains("já existe", StringComparison.OrdinalIgnoreCase)
        || message.Contains("inválid", StringComparison.OrdinalIgnoreCase)
        || message.Contains("não pode", StringComparison.OrdinalIgnoreCase)
        || message.Contains("não é possível", StringComparison.OrdinalIgnoreCase)
        || message.Contains("deve ", StringComparison.OrdinalIgnoreCase)
        || message.Contains("começou", StringComparison.OrdinalIgnoreCase)
        || message.Contains("fabricado até", StringComparison.OrdinalIgnoreCase)
        || message.Contains("incorreta", StringComparison.OrdinalIgnoreCase)
        || message.Contains("Não foi possível localizar", StringComparison.OrdinalIgnoreCase);
}
