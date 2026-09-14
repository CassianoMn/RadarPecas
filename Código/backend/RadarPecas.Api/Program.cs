using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using RadarPecas.Api.Middlewares;
using RadarPecas.Application.Interfaces;
using RadarPecas.Application.Services;
using RadarPecas.Infrastructure.Data;
using RadarPecas.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Configuração da Conexão com o PostgreSQL
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Host=localhost;Port=5432;Database=radarpecas_db;Username=radar_user;Password=radar_pass_2026";

builder.Services.AddDbContext<RadarPecasDbContext>(options =>
{
    options.UseNpgsql(connectionString)
           .UseSnakeCaseNamingConvention();
});

builder.Services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<RadarPecasDbContext>());

// 2. Configuração de Injeção de Dependência dos Serviços
builder.Services.AddScoped<IPasswordHasherService, PasswordHasherService>();
builder.Services.AddHttpClient<INominatimGeocodingService, NominatimGeocodingService>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IModeloMotoService, ModeloMotoService>();
builder.Services.AddScoped<IGaragemService, GaragemService>();
builder.Services.AddScoped<IPecaService, PecaService>();
builder.Services.AddScoped<IEstoqueService, EstoqueService>();
builder.Services.AddScoped<ICompatibilidadeService, CompatibilidadeService>();
builder.Services.AddScoped<IGeolocationService, GeolocationService>();
builder.Services.AddScoped<IBuscaRecomendacaoService, BuscaRecomendacaoService>();
builder.Services.AddScoped<ILojaService, LojaService>();
builder.Services.AddScoped<IAvaliacaoService, AvaliacaoService>();
builder.Services.AddScoped<IEstatisticaService, EstatisticaService>();

// 3. Configuração do CORS
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("DefaultCorsPolicy", policy =>
    {
        if (allowedOrigins.Length > 0)
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
        else
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
    });
});

// 4. Configuração da Autenticação JWT
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "radar_pecas_super_secret_key_tcc_ufs_2026_min_32_chars!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "RadarPecasAPI";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "RadarPecasApp";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// 5. Configuração de Controllers e OpenAPI / Swagger com suporte a Bearer Token
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "RadarPeças API",
        Version = "v1",
        Description = "API RESTful do RadarPeças — Plataforma de Geolocalização e Recomendação Inteligente de Motopeças (TCC UFS)."
    });

    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Insira o token JWT no formato: Bearer {seu_token}",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        Reference = new OpenApiReference
        {
            Id = JwtBearerDefaults.AuthenticationScheme,
            Type = ReferenceType.SecurityScheme
        }
    };

    c.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, securityScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { securityScheme, Array.Empty<string>() }
    });
});

var app = builder.Build();

// 6. Inicialização do Banco de Dados e Seed
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<RadarPecasDbContext>();
        logger.LogInformation("Verificando estrutura do banco de dados...");
        await dbContext.Database.EnsureCreatedAsync();
        await DatabaseSeeder.SeedAsync(dbContext, logger);
    }
    catch (Exception ex)
    {
        logger.LogWarning("Não foi possível conectar ao banco de dados no momento da inicialização: {Message}. Verifique as credenciais no appsettings ou variáveis de ambiente.", ex.Message);
    }
}

// 7. Middleware Global de Tratamento de Erros
app.UseMiddleware<GlobalExceptionMiddleware>();

// 8. Pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "RadarPeças API v1");
    });
}

app.UseHttpsRedirection();

// Habilitação do CORS
app.UseCors("DefaultCorsPolicy");

// Habilitação de Autenticação e Autorização
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Endpoint de verificação de integridade (Health Check)
app.MapGet("/api/health", () => Results.Ok(new
{
    status = "Healthy",
    service = "RadarPeças API",
    version = "1.0.0",
    environment = app.Environment.EnvironmentName,
    timestamp = DateTime.UtcNow
}))
.WithName("HealthCheck")
.WithOpenApi();

app.Run();
