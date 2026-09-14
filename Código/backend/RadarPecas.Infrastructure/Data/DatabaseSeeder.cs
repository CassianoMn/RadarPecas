using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using RadarPecas.Domain.Entities;
using RadarPecas.Domain.Enums;

namespace RadarPecas.Infrastructure.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(RadarPecasDbContext context, ILogger logger)
    {
        try
        {
            // 1. Seed de Modelos de Motocicletas
            if (!await context.ModelosMoto.AnyAsync())
            {
                logger.LogInformation("Iniciando seed de Modelos de Motocicletas...");
                var modelos = new List<ModeloMoto>
                {
                    // Honda
                    new() { Marca = "Honda", Modelo = "CG 160 Titan", AnoInicio = 2016, AnoFim = 2026 },
                    new() { Marca = "Honda", Modelo = "CG 160 Fan", AnoInicio = 2016, AnoFim = 2026 },
                    new() { Marca = "Honda", Modelo = "NXR 160 Bros", AnoInicio = 2015, AnoFim = 2026 },
                    new() { Marca = "Honda", Modelo = "CB 300F Twister", AnoInicio = 2023, AnoFim = 2026 },
                    new() { Marca = "Honda", Modelo = "CB 250F Twister", AnoInicio = 2016, AnoFim = 2022 },
                    new() { Marca = "Honda", Modelo = "XRE 300", AnoInicio = 2010, AnoFim = 2023 },
                    new() { Marca = "Honda", Modelo = "XRE 190", AnoInicio = 2016, AnoFim = 2026 },
                    new() { Marca = "Honda", Modelo = "Biz 125", AnoInicio = 2011, AnoFim = 2026 },
                    new() { Marca = "Honda", Modelo = "Pop 110i", AnoInicio = 2016, AnoFim = 2026 },
                    
                    // Yamaha
                    new() { Marca = "Yamaha", Modelo = "Fazer FZ25", AnoInicio = 2018, AnoFim = 2026 },
                    new() { Marca = "Yamaha", Modelo = "Factor 125i", AnoInicio = 2017, AnoFim = 2026 },
                    new() { Marca = "Yamaha", Modelo = "Factor 150", AnoInicio = 2016, AnoFim = 2026 },
                    new() { Marca = "Yamaha", Modelo = "Crosser 150", AnoInicio = 2015, AnoFim = 2026 },
                    new() { Marca = "Yamaha", Modelo = "Lander 250", AnoInicio = 2019, AnoFim = 2026 },
                    new() { Marca = "Yamaha", Modelo = "NMAX 160", AnoInicio = 2016, AnoFim = 2026 },
                    new() { Marca = "Yamaha", Modelo = "MT-03", AnoInicio = 2016, AnoFim = 2026 }
                };

                await context.ModelosMoto.AddRangeAsync(modelos);
                await context.SaveChangesAsync();
                logger.LogInformation("Modelos de motocicletas cadastrados com sucesso.");
            }

            // 2. Seed de Peças do Catálogo
            if (!await context.Pecas.AnyAsync())
            {
                logger.LogInformation("Iniciando seed do Catálogo de Peças...");
                var pecas = new List<Peca>
                {
                    new()
                    {
                        Sku = "VELA-NGK-CPR8EA9",
                        CodigoEan = "7897707504268",
                        Nome = "Vela de Ignição NGK CPR8EA-9",
                        Categoria = "Ignição",
                        Descricao = "Vela de ignição padrão resistiva NGK para motores monocilíndricos.",
                        FotoPecaUrl = "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500",
                        Especificacoes = "{\"grau_termico\": \"8\", \"rosca\": \"10mm\", \"eletrodo\": \"Níquel\"}"
                    },
                    new()
                    {
                        Sku = "PAST-COBREQ-N917",
                        CodigoEan = "7892679091702",
                        Nome = "Pastilha de Freio Dianteira Cobreq Street N-917",
                        Categoria = "Freios",
                        Descricao = "Pastilha orgânica para disco dianteiro, alta durabilidade e frenagem precisa.",
                        FotoPecaUrl = "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=500",
                        Especificacoes = "{\"posicao\": \"Dianteira\", \"material\": \"Orgânica\", \"linha\": \"Street\"}"
                    },
                    new()
                    {
                        Sku = "FILT-OLEO-FRAM-CH6015",
                        CodigoEan = "7896489311024",
                        Nome = "Filtro de Óleo Fram CH6015",
                        Categoria = "Filtros",
                        Descricao = "Filtro de óleo de alta retenção de impurezas para proteção do motor.",
                        FotoPecaUrl = "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=500",
                        Especificacoes = "{\"tipo\": \"Refil interno\", \"meio_filtrante\": \"Celulose microfibra\"}"
                    },
                    new()
                    {
                        Sku = "KIT-VAZ-CG160-RET",
                        CodigoEan = "7891234567890",
                        Nome = "Kit Relação Transmissão Vaz com Retentor Aço 1045",
                        Categoria = "Transmissão",
                        Descricao = "Kit completo de transmissão (coroa, pinhão e corrente com o-ring retentor).",
                        FotoPecaUrl = "https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=500",
                        Especificacoes = "{\"coroa\": \"44D\", \"pinhao\": \"15D\", \"corrente\": \"428HO-118L com retentor\", \"aco\": \"1045\"}"
                    },
                    new()
                    {
                        Sku = "PNEU-PIRELLI-CITY-9090",
                        CodigoEan = "7898523697412",
                        Nome = "Pneu Traseiro Pirelli City Dragon 90/90-18 57P TT",
                        Categoria = "Pneus",
                        Descricao = "Pneu para uso urbano com excelente rendimento quilométrico e aderência no molhado.",
                        FotoPecaUrl = "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500",
                        Especificacoes = "{\"medida\": \"90/90-18\", \"posicao\": \"Traseiro\", \"indice_carga\": \"57 (230 kg)\", \"indice_vel\": \"P (150 km/h)\"}"
                    },
                    new()
                    {
                        Sku = "BAT-HELIAR-HTZ6L",
                        CodigoEan = "7891472583690",
                        Nome = "Bateria Selada Heliar 12V 5Ah HTZ6L AGM",
                        Categoria = "Elétrica",
                        Descricao = "Bateria livre de manutenção com tecnologia AGM e alta corrente de partida.",
                        FotoPecaUrl = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500",
                        Especificacoes = "{\"tensao\": \"12V\", \"capacidade\": \"5Ah\", \"cca\": \"50A\", \"tecnologia\": \"AGM / VRLA\"}"
                    },
                    new()
                    {
                        Sku = "OLEO-MOBIL-10W30-4T",
                        CodigoEan = "7896541230987",
                        Nome = "Óleo de Motor Mobil Super Moto 4T 10W-30 Semissintético 1L",
                        Categoria = "Lubrificantes",
                        Descricao = "Lubrificante semissintético de alta performance atendendo API SL e JASO MA2.",
                        FotoPecaUrl = "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500",
                        Especificacoes = "{\"viscosidade\": \"10W-30\", \"base\": \"Semissintético\", \"normas\": \"API SL / JASO MA2\", \"volume\": \"1 Litro\"}"
                    },
                    new()
                    {
                        Sku = "LAMP-LED-PHILIPS-H4",
                        CodigoEan = "7894561237895",
                        Nome = "Lâmpada de Farol H4 LED Philips Ultinon Moto 6000K",
                        Categoria = "Iluminação",
                        Descricao = "Lâmpada LED automotiva de feixe concentrado sem ofuscamento e luz branca pura.",
                        FotoPecaUrl = "https://images.unsplash.com/photo-1563720223185-11003d516935?w=500",
                        Especificacoes = "{\"encaixe\": \"H4\", \"temperatura_cor\": \"6000K\", \"potencia\": \"12W\", \"durabilidade\": \"1500h\"}"
                    }
                };

                await context.Pecas.AddRangeAsync(pecas);
                await context.SaveChangesAsync();
                logger.LogInformation("Peças cadastradas com sucesso.");
            }

            // 3. Seed de Compatibilidade Peca x Modelo Moto
            if (!await context.CompatibilidadesPecaMoto.AnyAsync())
            {
                logger.LogInformation("Vinculando compatibilidades de peças e modelos...");
                var cg160Titan = await context.ModelosMoto.FirstOrDefaultAsync(m => m.Modelo.Contains("CG 160 Titan"));
                var cg160Fan = await context.ModelosMoto.FirstOrDefaultAsync(m => m.Modelo.Contains("CG 160 Fan"));
                var bros160 = await context.ModelosMoto.FirstOrDefaultAsync(m => m.Modelo.Contains("Bros"));
                var fazer250 = await context.ModelosMoto.FirstOrDefaultAsync(m => m.Modelo.Contains("FZ25"));
                var factor150 = await context.ModelosMoto.FirstOrDefaultAsync(m => m.Modelo.Contains("Factor 150"));
                var cb300f = await context.ModelosMoto.FirstOrDefaultAsync(m => m.Modelo.Contains("CB 300F"));

                var vela = await context.Pecas.FirstOrDefaultAsync(p => p.Sku == "VELA-NGK-CPR8EA9");
                var pastilha = await context.Pecas.FirstOrDefaultAsync(p => p.Sku == "PAST-COBREQ-N917");
                var filtroOleo = await context.Pecas.FirstOrDefaultAsync(p => p.Sku == "FILT-OLEO-FRAM-CH6015");
                var kitRelacao = await context.Pecas.FirstOrDefaultAsync(p => p.Sku == "KIT-VAZ-CG160-RET");
                var pneu = await context.Pecas.FirstOrDefaultAsync(p => p.Sku == "PNEU-PIRELLI-CITY-9090");
                var bateria = await context.Pecas.FirstOrDefaultAsync(p => p.Sku == "BAT-HELIAR-HTZ6L");
                var oleo = await context.Pecas.FirstOrDefaultAsync(p => p.Sku == "OLEO-MOBIL-10W30-4T");
                var lampada = await context.Pecas.FirstOrDefaultAsync(p => p.Sku == "LAMP-LED-PHILIPS-H4");

                var compatibilidades = new List<CompatibilidadePecaMoto>();

                void AddComp(Peca? p, ModeloMoto? m)
                {
                    if (p != null && m != null)
                    {
                        compatibilidades.Add(new CompatibilidadePecaMoto { PecaId = p.Id, ModeloMotoId = m.Id });
                    }
                }

                // Vela: CG 160 Titan, Fan, Bros 160, Factor 150
                AddComp(vela, cg160Titan);
                AddComp(vela, cg160Fan);
                AddComp(vela, bros160);
                AddComp(vela, factor150);

                // Pastilha Cobreq: CG 160 Titan, Fan, CB 300F, Fazer 250
                AddComp(pastilha, cg160Titan);
                AddComp(pastilha, cg160Fan);
                AddComp(pastilha, cb300f);
                AddComp(pastilha, fazer250);

                // Filtro de Óleo: Fazer 250, CB 300F
                AddComp(filtroOleo, fazer250);
                AddComp(filtroOleo, cb300f);

                // Kit Relação: CG 160 Titan, Fan
                AddComp(kitRelacao, cg160Titan);
                AddComp(kitRelacao, cg160Fan);

                // Pneu 90/90-18: CG 160 Titan, Fan, Factor 150
                AddComp(pneu, cg160Titan);
                AddComp(pneu, cg160Fan);
                AddComp(pneu, factor150);

                // Bateria: CG 160 Titan, Fan, Bros 160, Factor 150
                AddComp(bateria, cg160Titan);
                AddComp(bateria, cg160Fan);
                AddComp(bateria, bros160);
                AddComp(bateria, factor150);

                // Óleo 10W30: CG 160 Titan, Fan, Bros, CB 300F
                AddComp(oleo, cg160Titan);
                AddComp(oleo, cg160Fan);
                AddComp(oleo, bros160);
                AddComp(oleo, cb300f);

                // Lâmpada H4: CG 160 Titan, Fan, Fazer 250, Factor 150
                AddComp(lampada, cg160Titan);
                AddComp(lampada, cg160Fan);
                AddComp(lampada, fazer250);
                AddComp(lampada, factor150);

                await context.CompatibilidadesPecaMoto.AddRangeAsync(compatibilidades);
                await context.SaveChangesAsync();
                logger.LogInformation("Compatibilidades cadastradas com sucesso.");
            }

            // 4. Seed de Usuário Lojista e Loja Demonstrativa (Aracaju - SE)
            if (!await context.Usuarios.AnyAsync(u => u.TipoUsuario == TipoUsuario.LOJISTA))
            {
                logger.LogInformation("Criando usuário lojista e loja demonstrativa...");
                var lojista = new Usuario
                {
                    Nome = "Carlos Alberto (Lojista)",
                    Email = "lojista@radarpecas.com.br",
                    SenhaHash = BCrypt.Net.BCrypt.HashPassword("RadarPecas@2026", 11),
                    TipoUsuario = TipoUsuario.LOJISTA,
                    DataCadastro = DateTime.UtcNow
                };

                await context.Usuarios.AddAsync(lojista);
                await context.SaveChangesAsync();

                var loja = new Loja
                {
                    UsuarioId = lojista.Id,
                    NomeFantasia = "Radar Motos & Peças Central",
                    Cnpj = "12.345.678/0001-90",
                    EnderecoCompleto = "Av. Barão de Maruim, 500 - Centro, Aracaju - SE",
                    Latitude = -10.91670000m,
                    Longitude = -37.05000000m,
                    TelefoneContato = "(79) 99988-7766",
                    EmailContato = "contato@radarmotosaracaju.com.br",
                    HorariosFuncionamento = "{\"seg_sex\": \"08:00 - 18:00\", \"sab\": \"08:00 - 13:00\"}",
                    FotoPerfilUrl = "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500",
                    GaleriaFotosUrls = new[] { "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800" },
                    Ativa = true
                };

                await context.Lojas.AddAsync(loja);
                await context.SaveChangesAsync();

                // Adicionar estoque inicial para a loja
                var todasPecas = await context.Pecas.ToListAsync();
                var estoques = new List<EstoqueLoja>();

                foreach (var peca in todasPecas)
                {
                    decimal precoBase = peca.Categoria switch
                    {
                        "Ignição" => 35.00m,
                        "Freios" => 48.50m,
                        "Filtros" => 28.00m,
                        "Transmissão" => 165.00m,
                        "Pneus" => 210.00m,
                        "Elétrica" => 180.00m,
                        "Lubrificantes" => 38.00m,
                        "Iluminação" => 85.00m,
                        _ => 50.00m
                    };

                    bool emPromocao = peca.Sku is "VELA-NGK-CPR8EA9" or "OLEO-MOBIL-10W30-4T";
                    decimal? precoPromo = emPromocao ? Math.Round(precoBase * 0.85m, 2) : null;

                    estoques.Add(new EstoqueLoja
                    {
                        LojaId = loja.Id,
                        PecaId = peca.Id,
                        QuantidadeEstoque = 15,
                        AlertaEstoqueMinimo = 3,
                        PrecoVenda = precoBase,
                        EmPromocao = emPromocao,
                        PrecoPromocional = precoPromo,
                        DataInicioPromocao = emPromocao ? DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-2)) : null,
                        DataFimPromocao = emPromocao ? DateOnly.FromDateTime(DateTime.UtcNow.AddDays(15)) : null,
                        DataAtualizacao = DateTime.UtcNow
                    });
                }

                await context.EstoqueLojas.AddRangeAsync(estoques);
                await context.SaveChangesAsync();

                // Avaliação inicial
                var avaliacao = new AvaliacaoLoja
                {
                    LojaId = loja.Id,
                    UsuarioId = lojista.Id,
                    Nota = 5,
                    Comentario = "Excelente loja! Atendimento rápido e grande estoque de peças originais.",
                    Recomenda = true,
                    DataAvaliacao = DateTime.UtcNow
                };
                await context.AvaliacoesLoja.AddAsync(avaliacao);
                await context.SaveChangesAsync();

                logger.LogInformation("Loja demonstrativa e estoques configurados com sucesso.");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao executar o seed do banco de dados.");
        }
    }
}
