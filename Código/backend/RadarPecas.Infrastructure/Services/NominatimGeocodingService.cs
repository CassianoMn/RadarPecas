using System.Collections.Concurrent;
using System.Globalization;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using RadarPecas.Application.DTOs.Geocoding;
using RadarPecas.Application.Interfaces;

namespace RadarPecas.Infrastructure.Services;

public class NominatimGeocodingService : INominatimGeocodingService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<NominatimGeocodingService> _logger;
    private readonly ConcurrentDictionary<string, (DateTime ExpiresAt, List<LocalizacaoSugestaoResponse> Items)> _cache = new();

    public NominatimGeocodingService(HttpClient httpClient, ILogger<NominatimGeocodingService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;

        if (!_httpClient.DefaultRequestHeaders.Contains("User-Agent"))
        {
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "RadarPecas-Backend/1.0 (contato@radarpecas.ufs.br)");
        }
    }

    public async Task<(decimal Latitude, decimal Longitude)?> GeocodeAddressAsync(string address, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(address))
        {
            return null;
        }

        try
        {
            var url = $"https://nominatim.openstreetmap.org/search?q={Uri.EscapeDataString(address)}&format=json&limit=1";
            var response = await _httpClient.GetAsync(url, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Geocodificação via Nominatim retornou status {StatusCode} para o endereço: {Address}", response.StatusCode, address);
                return null;
            }

            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            using var doc = JsonDocument.Parse(content);

            if (doc.RootElement.ValueKind == JsonValueKind.Array && doc.RootElement.GetArrayLength() > 0)
            {
                var first = doc.RootElement[0];
                if (first.TryGetProperty("lat", out var latProp) && first.TryGetProperty("lon", out var lonProp))
                {
                    var latStr = latProp.GetString();
                    var lonStr = lonProp.GetString();

                    if (decimal.TryParse(latStr, NumberStyles.Any, CultureInfo.InvariantCulture, out var lat) &&
                        decimal.TryParse(lonStr, NumberStyles.Any, CultureInfo.InvariantCulture, out var lon))
                    {
                        return (lat, lon);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Falha ao consultar serviço de geocodificação Nominatim para o endereço: {Address}", address);
        }

        return null;
    }

    public async Task<List<LocalizacaoSugestaoResponse>> BuscarSugestoesAsync(string query, int limite = 15, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(query) || query.Trim().Length < 2)
        {
            return new List<LocalizacaoSugestaoResponse>();
        }

        var normalizedQuery = query.Trim();
        limite = Math.Clamp(limite, 1, 15);

        if (_cache.TryGetValue(normalizedQuery.ToLowerInvariant(), out var cached) && cached.ExpiresAt > DateTime.UtcNow)
        {
            return cached.Items;
        }

        var sugestoes = await BuscarViaPhotonAsync(normalizedQuery, limite, cancellationToken);
        if (sugestoes.Count == 0)
        {
            sugestoes = await BuscarViaNominatimAsync(normalizedQuery, limite, cancellationToken);
        }

        if (sugestoes.Count > 0)
        {
            _cache[normalizedQuery.ToLowerInvariant()] = (DateTime.UtcNow.AddMinutes(10), sugestoes);
        }

        return sugestoes;
    }

    private async Task<List<LocalizacaoSugestaoResponse>> BuscarViaPhotonAsync(string query, int limite, CancellationToken cancellationToken)
    {
        var sugestoes = new List<LocalizacaoSugestaoResponse>();

        try
        {
            var url = $"https://photon.komoot.io/api/?q={Uri.EscapeDataString(query)}&limit={limite}&lang=default";
            var response = await _httpClient.GetAsync(url, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                return sugestoes;
            }

            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            using var doc = JsonDocument.Parse(content);

            if (doc.RootElement.TryGetProperty("features", out var features) && features.ValueKind == JsonValueKind.Array)
            {
                foreach (var feature in features.EnumerateArray())
                {
                    if (!feature.TryGetProperty("geometry", out var geom) ||
                        !geom.TryGetProperty("coordinates", out var coords) ||
                        coords.ValueKind != JsonValueKind.Array ||
                        coords.GetArrayLength() < 2)
                    {
                        continue;
                    }

                    var lon = coords[0].GetDecimal();
                    var lat = coords[1].GetDecimal();

                    if (!feature.TryGetProperty("properties", out var props))
                    {
                        continue;
                    }

                    var name = props.TryGetProperty("name", out var n) ? n.GetString() : null;
                    var city = props.TryGetProperty("city", out var c) ? c.GetString() : null;
                    var state = props.TryGetProperty("state", out var s) ? s.GetString() : null;
                    var country = props.TryGetProperty("country", out var cntry) ? cntry.GetString() : null;
                    var street = props.TryGetProperty("street", out var st) ? st.GetString() : null;
                    var district = props.TryGetProperty("district", out var d) ? d.GetString() : null;
                    var type = props.TryGetProperty("type", out var t) ? t.GetString() : null;

                    string? rua = !string.IsNullOrWhiteSpace(street) ? street.Trim() : null;
                    if (string.IsNullOrWhiteSpace(rua) && !string.IsNullOrWhiteSpace(name) && EhPrefixoLogradouro(name))
                    {
                        rua = name.Trim();
                    }

                    string? cidade = !string.IsNullOrWhiteSpace(city) ? city.Trim() :
                                     (!string.IsNullOrWhiteSpace(district) ? district.Trim() : null);
                    if (string.IsNullOrWhiteSpace(cidade) && (type == "city" || type == "district"))
                    {
                        cidade = name?.Trim();
                    }

                    string? estado = !string.IsNullOrWhiteSpace(state) ? state.Trim() : null;

                    string titulo;
                    if (!string.IsNullOrWhiteSpace(rua))
                    {
                        titulo = rua;
                    }
                    else if (!string.IsNullOrWhiteSpace(name))
                    {
                        titulo = name.Trim();
                    }
                    else if (!string.IsNullOrWhiteSpace(cidade))
                    {
                        titulo = cidade;
                    }
                    else
                    {
                        titulo = estado ?? "Localização";
                    }

                    var parts = new List<string>();
                    if (!string.IsNullOrWhiteSpace(cidade) && cidade != titulo) parts.Add(cidade);
                    if (!string.IsNullOrWhiteSpace(estado) && estado != titulo) parts.Add(estado);
                    if (!string.IsNullOrWhiteSpace(country) && country != titulo) parts.Add(country);

                    string subtitulo = string.Join(", ", parts);
                    string displayName = string.IsNullOrWhiteSpace(subtitulo) ? titulo : $"{titulo}, {subtitulo}";
                    string nomeFormatadoPadrao = FormatarNomePadrao(rua, cidade, estado, titulo);

                    sugestoes.Add(new LocalizacaoSugestaoResponse
                    {
                        DisplayName = displayName,
                        Titulo = titulo,
                        Subtitulo = string.IsNullOrWhiteSpace(subtitulo) ? null : subtitulo,
                        Rua = rua,
                        Cidade = cidade,
                        Estado = estado,
                        Pais = country,
                        NomeFormatadoPadrao = nomeFormatadoPadrao,
                        Latitude = lat,
                        Longitude = lon,
                        Tipo = type
                    });

                    if (sugestoes.Count >= limite)
                    {
                        break;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Falha ao consultar Photon para autocomplete: {Query}", query);
        }

        return sugestoes;
    }

    private async Task<List<LocalizacaoSugestaoResponse>> BuscarViaNominatimAsync(string query, int limite, CancellationToken cancellationToken)
    {
        var sugestoes = new List<LocalizacaoSugestaoResponse>();

        try
        {
            var url = $"https://nominatim.openstreetmap.org/search?q={Uri.EscapeDataString(query)}&format=json&limit={limite}&countrycodes=br&addressdetails=1";
            var response = await _httpClient.GetAsync(url, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Nominatim retornou status {StatusCode} para busca de sugestões: {Query}", response.StatusCode, query);
                return sugestoes;
            }

            var content = await response.Content.ReadAsStringAsync(cancellationToken);
            using var doc = JsonDocument.Parse(content);

            if (doc.RootElement.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in doc.RootElement.EnumerateArray())
                {
                    if (!item.TryGetProperty("lat", out var latProp) || !item.TryGetProperty("lon", out var lonProp))
                        continue;

                    if (!decimal.TryParse(latProp.GetString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var lat) ||
                        !decimal.TryParse(lonProp.GetString(), NumberStyles.Any, CultureInfo.InvariantCulture, out var lon))
                        continue;

                    var displayName = item.TryGetProperty("display_name", out var dnProp) ? dnProp.GetString() ?? string.Empty : string.Empty;
                    var name = item.TryGetProperty("name", out var nProp) ? nProp.GetString() : null;
                    var type = item.TryGetProperty("type", out var tProp) ? tProp.GetString() : null;

                    string? rua = null;
                    string? cidade = null;
                    string? estado = null;
                    string? country = null;

                    if (item.TryGetProperty("address", out var addrProp) && addrProp.ValueKind == JsonValueKind.Object)
                    {
                        var road = addrProp.TryGetProperty("road", out var r) ? r.GetString() : null;
                        var suburb = addrProp.TryGetProperty("suburb", out var s) ? s.GetString() : null;
                        var city = addrProp.TryGetProperty("city", out var c) ? c.GetString() :
                                   addrProp.TryGetProperty("town", out var tw) ? tw.GetString() :
                                   addrProp.TryGetProperty("municipality", out var m) ? m.GetString() : null;
                        var state = addrProp.TryGetProperty("state", out var st) ? st.GetString() : null;
                        var cntry = addrProp.TryGetProperty("country", out var cy) ? cy.GetString() : null;

                        rua = !string.IsNullOrWhiteSpace(road) ? road.Trim() : null;
                        if (string.IsNullOrWhiteSpace(rua) && !string.IsNullOrWhiteSpace(name) && EhPrefixoLogradouro(name))
                        {
                            rua = name.Trim();
                        }

                        cidade = !string.IsNullOrWhiteSpace(city) ? city.Trim() :
                                 (!string.IsNullOrWhiteSpace(suburb) ? suburb.Trim() : null);
                        if (string.IsNullOrWhiteSpace(cidade) && type == "city")
                        {
                            cidade = name?.Trim();
                        }

                        estado = !string.IsNullOrWhiteSpace(state) ? state.Trim() : null;
                        country = !string.IsNullOrWhiteSpace(cntry) ? cntry.Trim() : null;
                    }
                    else
                    {
                        if (!string.IsNullOrWhiteSpace(name) && EhPrefixoLogradouro(name))
                        {
                            rua = name.Trim();
                        }
                    }

                    string titulo = !string.IsNullOrWhiteSpace(rua) ? rua :
                                    (!string.IsNullOrWhiteSpace(name) ? name.Trim() :
                                    (cidade ?? estado ?? displayName.Split(',')[0].Trim()));

                    var parts = new List<string>();
                    if (!string.IsNullOrWhiteSpace(cidade) && cidade != titulo) parts.Add(cidade);
                    if (!string.IsNullOrWhiteSpace(estado) && estado != titulo) parts.Add(estado);
                    if (!string.IsNullOrWhiteSpace(country) && country != titulo) parts.Add(country);

                    string subtitulo = parts.Count > 0 ? string.Join(", ", parts) : displayName;
                    string nomeFormatadoPadrao = FormatarNomePadrao(rua, cidade, estado, titulo);

                    sugestoes.Add(new LocalizacaoSugestaoResponse
                    {
                        DisplayName = displayName,
                        Titulo = titulo,
                        Subtitulo = string.IsNullOrWhiteSpace(subtitulo) ? null : subtitulo,
                        Rua = rua,
                        Cidade = cidade,
                        Estado = estado,
                        Pais = country,
                        NomeFormatadoPadrao = nomeFormatadoPadrao,
                        Latitude = lat,
                        Longitude = lon,
                        Tipo = type
                    });

                    if (sugestoes.Count >= limite)
                        break;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar sugestões no Nominatim para '{Query}'", query);
        }

        return sugestoes;
    }

    private static readonly Dictionary<string, string> EstadosUf = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Acre"] = "AC",
        ["Alagoas"] = "AL",
        ["Amapá"] = "AP",
        ["Amapa"] = "AP",
        ["Amazonas"] = "AM",
        ["Bahia"] = "BA",
        ["Ceará"] = "CE",
        ["Ceara"] = "CE",
        ["Distrito Federal"] = "DF",
        ["Espírito Santo"] = "ES",
        ["Espirito Santo"] = "ES",
        ["Goiás"] = "GO",
        ["Goias"] = "GO",
        ["Maranhão"] = "MA",
        ["Maranhao"] = "MA",
        ["Mato Grosso"] = "MT",
        ["Mato Grosso do Sul"] = "MS",
        ["Minas Gerais"] = "MG",
        ["Pará"] = "PA",
        ["Para"] = "PA",
        ["Paraíba"] = "PB",
        ["Paraiba"] = "PB",
        ["Paraná"] = "PR",
        ["Parana"] = "PR",
        ["Pernambuco"] = "PE",
        ["Piauí"] = "PI",
        ["Piaui"] = "PI",
        ["Rio de Janeiro"] = "RJ",
        ["Rio Grande do Norte"] = "RN",
        ["Rio Grande do Sul"] = "RS",
        ["Rondônia"] = "RO",
        ["Rondonia"] = "RO",
        ["Roraima"] = "RR",
        ["Santa Catarina"] = "SC",
        ["São Paulo"] = "SP",
        ["Sao Paulo"] = "SP",
        ["Sergipe"] = "SE",
        ["Tocantins"] = "TO"
    };

    private static string? ObterUfOuEstado(string? estado)
    {
        if (string.IsNullOrWhiteSpace(estado)) return null;
        var trimmed = estado.Trim();
        if (trimmed.Length == 2) return trimmed.ToUpperInvariant();
        if (EstadosUf.TryGetValue(trimmed, out var uf)) return uf;
        return trimmed;
    }

    private static string FormatarNomePadrao(string? rua, string? cidade, string? estado, string? tituloFallback)
    {
        var ufOuEstado = ObterUfOuEstado(estado);

        if (!string.IsNullOrWhiteSpace(rua))
        {
            var parts = new List<string> { rua.Trim() };
            if (!string.IsNullOrWhiteSpace(cidade)) parts.Add(cidade.Trim());
            if (!string.IsNullOrWhiteSpace(ufOuEstado) && ufOuEstado != cidade) parts.Add(ufOuEstado);
            return string.Join(", ", parts);
        }

        var local = !string.IsNullOrWhiteSpace(cidade) ? cidade.Trim() : tituloFallback?.Trim();
        if (!string.IsNullOrWhiteSpace(local))
        {
            if (!string.IsNullOrWhiteSpace(ufOuEstado) && ufOuEstado != local)
            {
                return $"{local}, {ufOuEstado}";
            }
            return local;
        }

        return tituloFallback ?? "Localização selecionada";
    }

    private static bool EhPrefixoLogradouro(string texto)
    {
        if (string.IsNullOrWhiteSpace(texto)) return false;
        var t = texto.Trim().ToLowerInvariant();
        return t.StartsWith("rua") || t.StartsWith("avenida") || t.StartsWith("av.") ||
               t.StartsWith("rodovia") || t.StartsWith("rod.") || t.StartsWith("alameda") ||
               t.StartsWith("al.") || t.StartsWith("travessa") || t.StartsWith("tv.") ||
               t.StartsWith("estrada") || t.StartsWith("est.") || t.StartsWith("praça") ||
               t.StartsWith("praca") || t.StartsWith("via") || t.StartsWith("viela");
    }
}
