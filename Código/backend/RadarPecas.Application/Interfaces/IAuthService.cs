using RadarPecas.Application.DTOs.Auth;
using RadarPecas.Application.DTOs.Common;

namespace RadarPecas.Application.Interfaces;

public interface IAuthService
{
    Task<ApiResponse<LoginResponse>> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<LoginResponse>> RegisterMotociclistaAsync(RegisterMotociclistaRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<LoginResponse>> RegisterLojistaAsync(RegisterLojistaRequest request, CancellationToken cancellationToken = default);
    Task<ApiResponse<UserProfileResponse>> GetProfileAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<ApiResponse<UserProfileResponse>> UpdateProfileAsync(Guid userId, UpdateProfileRequest request, CancellationToken cancellationToken = default);
}
