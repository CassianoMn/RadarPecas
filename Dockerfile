FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia os arquivos de projeto preservando a estrutura de pastas
COPY ["Código/backend/RadarPecas.Domain/RadarPecas.Domain.csproj", "Código/backend/RadarPecas.Domain/"]
COPY ["Código/backend/RadarPecas.Application/RadarPecas.Application.csproj", "Código/backend/RadarPecas.Application/"]
COPY ["Código/backend/RadarPecas.Infrastructure/RadarPecas.Infrastructure.csproj", "Código/backend/RadarPecas.Infrastructure/"]
COPY ["Código/backend/RadarPecas.Api/RadarPecas.Api.csproj", "Código/backend/RadarPecas.Api/"]
RUN dotnet restore "Código/backend/RadarPecas.Api/RadarPecas.Api.csproj"

# Copia o restante do backend e o script SQL referenciado pelo Infrastructure
COPY ["Código/backend/", "Código/backend/"]
COPY ["AnaliseProjeto/DB_radarPecas.sql", "AnaliseProjeto/DB_radarPecas.sql"]

WORKDIR /src/Código/backend/RadarPecas.Api
RUN dotnet publish "RadarPecas.Api.csproj" -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "RadarPecas.Api.dll"]
