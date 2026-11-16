FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia os arquivos de projeto e restaura dependências
COPY RadarPecas.Domain/RadarPecas.Domain.csproj RadarPecas.Domain/
COPY RadarPecas.Application/RadarPecas.Application.csproj RadarPecas.Application/
COPY RadarPecas.Infrastructure/RadarPecas.Infrastructure.csproj RadarPecas.Infrastructure/
COPY RadarPecas.Api/RadarPecas.Api.csproj RadarPecas.Api/
RUN dotnet restore RadarPecas.Api/RadarPecas.Api.csproj

# Copia o restante do código e publica em Release
COPY . .
WORKDIR /src/RadarPecas.Api
RUN dotnet publish RadarPecas.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Render/Railway/Fly injetam PORT; padrão 8080
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "RadarPecas.Api.dll"]
