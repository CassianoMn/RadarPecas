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
                    new() { Marca = "Honda", Modelo = "PCX 160", AnoInicio = 2022, AnoFim = 2026 },
                    
                    // Yamaha
                    new() { Marca = "Yamaha", Modelo = "Fazer FZ25", AnoInicio = 2018, AnoFim = 2026 },
                    new() { Marca = "Yamaha", Modelo = "Factor 125i", AnoInicio = 2017, AnoFim = 2026 },
                    new() { Marca = "Yamaha", Modelo = "Factor 150", AnoInicio = 2016, AnoFim = 2026 },
                    new() { Marca = "Yamaha", Modelo = "Crosser 150", AnoInicio = 2015, AnoFim = 2026 },
                    new() { Marca = "Yamaha", Modelo = "Lander 250", AnoInicio = 2019, AnoFim = 2026 },
                    new() { Marca = "Yamaha", Modelo = "NMAX 160", AnoInicio = 2016, AnoFim = 2026 },
                    new() { Marca = "Yamaha", Modelo = "MT-03", AnoInicio = 2016, AnoFim = 2026 },
                    new() { Marca = "Yamaha", Modelo = "Fluo 125", AnoInicio = 2022, AnoFim = 2026 }
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
                    },
                    new()
                    {
                        Sku = "CABO-EMB-MOTOBOR-CG160",
                        CodigoEan = "7893214569871",
                        Nome = "Cabo de Embreagem Reforçado Motobor CG 160",
                        Categoria = "Cabos & Comandos",
                        Descricao = "Cabo de embreagem com teflon interno de acionamento ultra macio e resistente.",
                        FotoPecaUrl = "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=500",
                        Especificacoes = "{\"revestimento\": \"Teflon\", \"comprimento\": \"105cm\", \"garantia\": \"6 meses\"}"
                    },
                    new()
                    {
                        Sku = "CORREIA-GATES-NMAX",
                        CodigoEan = "7896547893215",
                        Nome = "Correia de Transmissão CVT Gates Powerlink NMAX 160",
                        Categoria = "Transmissão",
                        Descricao = "Correia dentada de alta durabilidade e dissipação térmica para scooter.",
                        FotoPecaUrl = "https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=500",
                        Especificacoes = "{\"material\": \"EPDM com cordonéis de aramida\", \"perfil\": \"CVT\", \"scooter\": \"NMAX 160\"}"
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
                var nmax = await context.ModelosMoto.FirstOrDefaultAsync(m => m.Modelo.Contains("NMAX"));

                var vela = await context.Pecas.FirstOrDefaultAsync(p => p.Sku == "VELA-NGK-CPR8EA9");
                var pastilha = await context.Pecas.FirstOrDefaultAsync(p => p.Sku == "PAST-COBREQ-N917");
                var filtroOleo = await context.Pecas.FirstOrDefaultAsync(p => p.Sku == "FILT-OLEO-FRAM-CH6015");
                var kitRelacao = await context.Pecas.FirstOrDefaultAsync(p => p.Sku == "KIT-VAZ-CG160-RET");
                var pneu = await context.Pecas.FirstOrDefaultAsync(p => p.Sku == "PNEU-PIRELLI-CITY-9090");
                var bateria = await context.Pecas.FirstOrDefaultAsync(p => p.Sku == "BAT-HELIAR-HTZ6L");
                var oleo = await context.Pecas.FirstOrDefaultAsync(p => p.Sku == "OLEO-MOBIL-10W30-4T");
                var lampada = await context.Pecas.FirstOrDefaultAsync(p => p.Sku == "LAMP-LED-PHILIPS-H4");
                var caboEmb = await context.Pecas.FirstOrDefaultAsync(p => p.Sku == "CABO-EMB-MOTOBOR-CG160");
                var correia = await context.Pecas.FirstOrDefaultAsync(p => p.Sku == "CORREIA-GATES-NMAX");

                var compatibilidades = new List<CompatibilidadePecaMoto>();

                void AddComp(Peca? p, ModeloMoto? m)
                {
                    if (p != null && m != null)
                    {
                        compatibilidades.Add(new CompatibilidadePecaMoto { PecaId = p.Id, ModeloMotoId = m.Id });
                    }
                }

                // Vela
                AddComp(vela, cg160Titan);
                AddComp(vela, cg160Fan);
                AddComp(vela, bros160);
                AddComp(vela, factor150);

                // Pastilha Cobreq
                AddComp(pastilha, cg160Titan);
                AddComp(pastilha, cg160Fan);
                AddComp(pastilha, cb300f);
                AddComp(pastilha, fazer250);

                // Filtro de Óleo
                AddComp(filtroOleo, fazer250);
                AddComp(filtroOleo, cb300f);

                // Kit Relação
                AddComp(kitRelacao, cg160Titan);
                AddComp(kitRelacao, cg160Fan);

                // Pneu 90/90-18
                AddComp(pneu, cg160Titan);
                AddComp(pneu, cg160Fan);
                AddComp(pneu, factor150);

                // Bateria
                AddComp(bateria, cg160Titan);
                AddComp(bateria, cg160Fan);
                AddComp(bateria, bros160);
                AddComp(bateria, factor150);

                // Óleo 10W30
                AddComp(oleo, cg160Titan);
                AddComp(oleo, cg160Fan);
                AddComp(oleo, bros160);
                AddComp(oleo, cb300f);

                // Lâmpada H4
                AddComp(lampada, cg160Titan);
                AddComp(lampada, cg160Fan);
                AddComp(lampada, fazer250);
                AddComp(lampada, factor150);

                // Cabo Embreagem
                AddComp(caboEmb, cg160Titan);
                AddComp(caboEmb, cg160Fan);

                // Correia CVT
                AddComp(correia, nmax);

                await context.CompatibilidadesPecaMoto.AddRangeAsync(compatibilidades);
                await context.SaveChangesAsync();
                logger.LogInformation("Compatibilidades cadastradas com sucesso.");
            }

            // 4. Seed de Usuários, Lojas e Garagem Virtual
            if (!await context.Usuarios.AnyAsync(u => u.TipoUsuario == TipoUsuario.LOJISTA))
            {
                logger.LogInformation("Criando múltiplos usuários, lojas demonstrativas e garagens...");
                
                // Lojista 1 - Centro Aracaju
                var lojista1 = new Usuario
                {
                    Nome = "Carlos Alberto (Lojista)",
                    Email = "lojista@gmail.com",
                    SenhaHash = BCrypt.Net.BCrypt.HashPassword("123456", 11),
                    TipoUsuario = TipoUsuario.LOJISTA,
                    DataCadastro = DateTime.UtcNow
                };

                // Lojista 2 - Siqueira Campos Aracaju
                var lojista2 = new Usuario
                {
                    Nome = "Mariana Costa (Lojista)",
                    Email = "mariana@gmail.com",
                    SenhaHash = BCrypt.Net.BCrypt.HashPassword("123456", 11),
                    TipoUsuario = TipoUsuario.LOJISTA,
                    DataCadastro = DateTime.UtcNow
                };

                // Motociclista 1 - Cliente com Garagem Virtual
                var motociclista = new Usuario
                {
                    Nome = "Lucas Oliveira (Motociclista)",
                    Email = "motociclista@radarpecas.com.br",
                    SenhaHash = BCrypt.Net.BCrypt.HashPassword("123456", 11),
                    TipoUsuario = TipoUsuario.MOTOCICLISTA,
                    DataCadastro = DateTime.UtcNow
                };

                await context.Usuarios.AddRangeAsync(lojista1, lojista2, motociclista);
                await context.SaveChangesAsync();

                // Loja 1
                var loja1 = new Loja
                {
                    UsuarioId = lojista1.Id,
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

                // Loja 2
                var loja2 = new Loja
                {
                    UsuarioId = lojista2.Id,
                    NomeFantasia = "MotoPower Peças & Oficina",
                    Cnpj = "98.765.432/0001-10",
                    EnderecoCompleto = "Rua Mariano Salmeron, 250 - Siqueira Campos, Aracaju - SE",
                    Latitude = -10.92340000m,
                    Longitude = -37.07210000m,
                    TelefoneContato = "(79) 98877-6655",
                    EmailContato = "vendas@motopower.com.br",
                    HorariosFuncionamento = "{\"seg_sex\": \"07:30 - 18:00\", \"sab\": \"08:00 - 12:00\"}",
                    FotoPerfilUrl = "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=500",
                    GaleriaFotosUrls = new[] { "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800" },
                    Ativa = true
                };

                await context.Lojas.AddRangeAsync(loja1, loja2);
                await context.SaveChangesAsync();

                // 5. Garagem Virtual para o Motociclista
                var modeloCg = await context.ModelosMoto.FirstOrDefaultAsync(m => m.Modelo.Contains("CG 160 Titan"));
                var modeloFz = await context.ModelosMoto.FirstOrDefaultAsync(m => m.Modelo.Contains("FZ25"));

                if (modeloCg != null)
                {
                    await context.GaragemVirtual.AddAsync(new GaragemVirtual
                    {
                        UsuarioId = motociclista.Id,
                        ModeloMotoId = modeloCg.Id,
                        AnoFabricacao = 2022,
                        Apelido = "Titan 160 do Dia a Dia",
                        FotoMotoUrl = "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=500"
                    });
                }

                if (modeloFz != null)
                {
                    await context.GaragemVirtual.AddAsync(new GaragemVirtual
                    {
                        UsuarioId = motociclista.Id,
                        ModeloMotoId = modeloFz.Id,
                        AnoFabricacao = 2023,
                        Apelido = "Fazer 250 de Viagem",
                        FotoMotoUrl = "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=500"
                    });
                }
                await context.SaveChangesAsync();

                // 6. Estoque variado para Loja 1 e Loja 2
                var todasPecas = await context.Pecas.ToListAsync();
                var estoques = new List<EstoqueLoja>();

                foreach (var peca in todasPecas)
                {
                    decimal precoBase1 = peca.Categoria switch
                    {
                        "Ignição" => 35.00m,
                        "Freios" => 48.50m,
                        "Filtros" => 28.00m,
                        "Transmissão" => 165.00m,
                        "Pneus" => 210.00m,
                        "Elétrica" => 180.00m,
                        "Lubrificantes" => 38.00m,
                        "Iluminação" => 85.00m,
                        "Cabos & Comandos" => 32.00m,
                        _ => 50.00m
                    };

                    // Loja 1 tem certas promoções
                    bool promo1 = peca.Sku is "VELA-NGK-CPR8EA9" or "OLEO-MOBIL-10W30-4T";
                    decimal? precoPromo1 = promo1 ? Math.Round(precoBase1 * 0.85m, 2) : null;

                    var estoque1 = new EstoqueLoja
                    {
                        LojaId = loja1.Id,
                        PecaId = peca.Id,
                        QuantidadeEstoque = 15,
                        AlertaEstoqueMinimo = 3,
                        PrecoVenda = precoBase1,
                        EmPromocao = promo1,
                        PrecoPromocional = precoPromo1,
                        DataInicioPromocao = promo1 ? DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-2)) : null,
                        DataFimPromocao = promo1 ? DateOnly.FromDateTime(DateTime.UtcNow.AddDays(15)) : null,
                        DataAtualizacao = DateTime.UtcNow
                    };
                    estoques.Add(estoque1);

                    // Loja 2 (preços competitivos concorrentes e promoções diferentes)
                    decimal precoBase2 = Math.Round(precoBase1 * 0.95m, 2);
                    bool promo2 = peca.Sku is "PAST-COBREQ-N917" or "KIT-VAZ-CG160-RET";
                    decimal? precoPromo2 = promo2 ? Math.Round(precoBase2 * 0.88m, 2) : null;

                    var estoque2 = new EstoqueLoja
                    {
                        LojaId = loja2.Id,
                        PecaId = peca.Id,
                        QuantidadeEstoque = 10,
                        AlertaEstoqueMinimo = 2,
                        PrecoVenda = precoBase2,
                        EmPromocao = promo2,
                        PrecoPromocional = precoPromo2,
                        DataInicioPromocao = promo2 ? DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-5)) : null,
                        DataFimPromocao = promo2 ? DateOnly.FromDateTime(DateTime.UtcNow.AddDays(10)) : null,
                        DataAtualizacao = DateTime.UtcNow
                    };
                    estoques.Add(estoque2);
                }

                await context.EstoqueLojas.AddRangeAsync(estoques);
                await context.SaveChangesAsync();

                // 7. Estatísticas de visualização e cliques para as ofertas
                var hoje = DateOnly.FromDateTime(DateTime.UtcNow);
                var stats = new List<EstatisticaOferta>();
                foreach (var est in estoques.Take(6))
                {
                    stats.Add(new EstatisticaOferta
                    {
                        EstoqueLojaId = est.Id,
                        Visualizacoes = new Random().Next(25, 120),
                        Cliques = new Random().Next(5, 30),
                        DataRegistro = hoje
                    });
                }
                await context.EstatisticasOferta.AddRangeAsync(stats);
                await context.SaveChangesAsync();

                // 8. Avaliações com feedbacks realistas
                var avaliacoes = new List<AvaliacaoLoja>
                {
                    new()
                    {
                        LojaId = loja1.Id,
                        UsuarioId = motociclista.Id,
                        Nota = 5,
                        Comentario = "Excelente loja! Atendimento rápido e grande estoque de peças originais.",
                        Recomenda = true,
                        DataAvaliacao = DateTime.UtcNow.AddDays(-2)
                    },
                    new()
                    {
                        LojaId = loja2.Id,
                        UsuarioId = motociclista.Id,
                        Nota = 4,
                        Comentario = "Ótimos preços e mecânicos capacitados. Recomendo.",
                        Recomenda = true,
                        DataAvaliacao = DateTime.UtcNow.AddDays(-1)
                    }
                };
                await context.AvaliacoesLoja.AddRangeAsync(avaliacoes);
                await context.SaveChangesAsync();

                logger.LogInformation("Lojas, garagens, estoques variados e avaliações inseridos com sucesso!");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao executar o seed do banco de dados.");
        }
    }
}
