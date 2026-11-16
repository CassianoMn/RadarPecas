FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia os arquivos de projeto e restaura dependências
COPY ["Código/backend/RadarPecas.Domain/RadarPecas.Domain.csproj", "RadarPecas.Domain/"]
COPY ["Código/backend/RadarPecas.Application/RadarPecas.Application.csproj", "RadarPecas.Application/"]
COPY ["Código/backend/RadarPecas.Infrastructure/RadarPecas.Infrastructure.csproj", "RadarPecas.Infrastructure/"]
COPY ["Código/backend/RadarPecas.Api/RadarPecas.Api.csproj", "RadarPecas.Api/"]
RUN dotnet restore "RadarPecas.Api/RadarPecas.Api.csproj"

# Copia o restante do código do backend e publica em Release
COPY ["Código/backend/", "."]
WORKDIR /src/RadarPecas.Api
RUN dotnet publish "RadarPecas.Api.csproj" -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "RadarPecas.Api.dll"]
