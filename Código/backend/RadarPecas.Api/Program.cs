using RadarPecas.Api.Middlewares;

var builder = WebApplication.CreateBuilder(args);

// Configuração do CORS
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

// Configuração de Controllers e OpenAPI / Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Middleware Global de Tratamento de Erros
app.UseMiddleware<GlobalExceptionMiddleware>();

// Pipeline HTTP
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
