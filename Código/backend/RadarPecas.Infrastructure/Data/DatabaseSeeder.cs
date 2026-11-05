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
                        FotoPecaUrl = "https://http2.mlstatic.com/D_NQ_NP_876209-MLB108040626802_032026-O.webp",
                        Especificacoes = "{\"grau_termico\": \"8\", \"rosca\": \"10mm\", \"eletrodo\": \"Níquel\"}"
                    },
                    new()
                    {
                        Sku = "PAST-COBREQ-N917",
                        CodigoEan = "7892679091702",
                        Nome = "Pastilha de Freio Dianteira Cobreq Street N-917",
                        Categoria = "Freios",
                        Descricao = "Pastilha orgânica para disco dianteiro, alta durabilidade e frenagem precisa.",
                        FotoPecaUrl = "https://karhub-images.karhub.com.br/234957-pastilha-de-freio-dianteira-1726498351871.jpeg",
                        Especificacoes = "{\"posicao\": \"Dianteira\", \"material\": \"Orgânica\", \"linha\": \"Street\"}"
                    },
                    new()
                    {
                        Sku = "FILT-OLEO-FRAM-CH6015",
                        CodigoEan = "7896489311024",
                        Nome = "Filtro de Óleo Fram CH6015",
                        Categoria = "Filtros",
                        Descricao = "Filtro de óleo de alta retenção de impurezas para proteção do motor.",
                        FotoPecaUrl = "https://fortnine.ca/media/catalog/product/cache/dd4850ad4231b6306bceadf38a0bbeed/catalogimages/fram/extra-guard-oil-filter-cartridge-ch6015.jpg",
                        Especificacoes = "{\"tipo\": \"Refil interno\", \"meio_filtrante\": \"Celulose microfibra\"}"
                    },
                    new()
                    {
                        Sku = "KIT-VAZ-CG160-RET",
                        CodigoEan = "7891234567890",
                        Nome = "Kit Relação Transmissão Vaz com Retentor Aço 1045",
                        Categoria = "Transmissão",
                        Descricao = "Kit completo de transmissão (coroa, pinhão e corrente com o-ring retentor).",
                        FotoPecaUrl = "https://http2.mlstatic.com/D_NQ_NP_2X_881930-MLU75562498498_042024-F.webp",
                        Especificacoes = "{\"coroa\": \"44D\", \"pinhao\": \"15D\", \"corrente\": \"428HO-118L com retentor\", \"aco\": \"1045\"}"
                    },
                    new()
                    {
                        Sku = "PNEU-PIRELLI-CITY-9090",
                        CodigoEan = "7898523697412",
                        Nome = "Pneu Traseiro Pirelli City Dragon 90/90-18 57P TT",
                        Categoria = "Pneus",
                        Descricao = "Pneu para uso urbano com excelente rendimento quilométrico e aderência no molhado.",
                        FotoPecaUrl = "https://tyre-images.pirelli.com/MKTData/MOTO/files/2094/mototopimage/pirelli_moto_city_dragon_base_1_992x992.png",
                        Especificacoes = "{\"medida\": \"90/90-18\", \"posicao\": \"Traseiro\", \"indice_carga\": \"57 (230 kg)\", \"indice_vel\": \"P (150 km/h)\"}"
                    },
                    new()
                    {
                        Sku = "BAT-HELIAR-HTZ6L",
                        CodigoEan = "7891472583690",
                        Nome = "Bateria Selada Heliar 12V 5Ah HTZ6L AGM",
                        Categoria = "Elétrica",
                        Descricao = "Bateria livre de manutenção com tecnologia AGM e alta corrente de partida.",
                        FotoPecaUrl = "https://http2.mlstatic.com/D_NQ_NP_2X_871209-MLU72521367498_102023-F.webp",
                        Especificacoes = "{\"tensao\": \"12V\", \"capacidade\": \"5Ah\", \"cca\": \"50A\", \"tecnologia\": \"AGM / VRLA\"}"
                    },
                    new()
                    {
                        Sku = "OLEO-MOBIL-10W30-4T",
                        CodigoEan = "7896541230987",
                        Nome = "Óleo de Motor Mobil Super Moto 4T 10W-30 Semissintético 1L",
                        Categoria = "Lubrificantes",
                        Descricao = "Lubrificante semissintético de alta performance atendendo API SL e JASO MA2.",
                        FotoPecaUrl = "https://cdn.awsli.com.br/600x450/877/877231/produto/221477213/mobil-4t-10w30-3egdm9prtu.png",
                        Especificacoes = "{\"viscosidade\": \"10W-30\", \"base\": \"Semissintético\", \"normas\": \"API SL / JASO MA2\", \"volume\": \"1 Litro\"}"
                    },
                    new()
                    {
                        Sku = "LAMP-LED-PHILIPS-H4",
                        CodigoEan = "7894561237895",
                        Nome = "Lâmpada de Farol H4 LED Philips Ultinon Moto 6000K",
                        Categoria = "Iluminação",
                        Descricao = "Lâmpada LED automotiva de feixe concentrado sem ofuscamento e luz branca pura.",
                        FotoPecaUrl = "https://fortbras.vteximg.com.br/arquivos/ids/318302/lampada-philips-ultinon-led-moto-luz-branca-hs1-h4-12v-9w-6000k-farol-11458umx1-hipervarejo-1.jpg",
                        Especificacoes = "{\"encaixe\": \"H4\", \"temperatura_cor\": \"6000K\", \"potencia\": \"12W\", \"durabilidade\": \"1500h\"}"
                    },
                    new()
                    {
                        Sku = "CABO-EMB-MOTOBOR-CG160",
                        CodigoEan = "7893214569871",
                        Nome = "Cabo de Embreagem Reforçado Motobor CG 160",
                        Categoria = "Cabos & Comandos",
                        Descricao = "Cabo de embreagem com teflon interno de acionamento ultra macio e resistente.",
                        FotoPecaUrl = "https://www.motokart.com.br/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/c/a/cabo_embreagem_titan_fan_start_160_1_2.jpg",
                        Especificacoes = "{\"revestimento\": \"Teflon\", \"comprimento\": \"105cm\", \"garantia\": \"6 meses\"}"
                    },
                    new()
                    {
                        Sku = "CORREIA-GATES-NMAX",
                        CodigoEan = "7896547893215",
                        Nome = "Correia de Transmissão CVT Gates Powerlink NMAX 160",
                        Categoria = "Transmissão",
                        Descricao = "Correia dentada de alta durabilidade e dissipação térmica para scooter.",
                        FotoPecaUrl = "https://http2.mlstatic.com/D_NQ_NP_2X_938589-MLU74021834718_012024-F.webp",
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

            // 4. Seed de Usuário Motociclista e Garagem Virtual
            var motociclista = await context.Usuarios.FirstOrDefaultAsync(u => u.Email == "motociclista@radarpecas.com.br");
            if (motociclista == null)
            {
                motociclista = new Usuario
                {
                    Id = Guid.Parse("cf8828f2-1aa1-4534-844b-1899e5803a8c"),
                    Nome = "Lucas Oliveira (Motociclista)",
                    Email = "motociclista@radarpecas.com.br",
                    SenhaHash = BCrypt.Net.BCrypt.HashPassword("Moto#2026", 11),
                    TipoUsuario = TipoUsuario.MOTOCICLISTA,
                    DataCadastro = DateTime.UtcNow
                };
                await context.Usuarios.AddAsync(motociclista);
                await context.SaveChangesAsync();

                var modeloCg = await context.ModelosMoto.FirstOrDefaultAsync(m => m.Modelo.Contains("CG 160 Titan"));
                var modeloFz = await context.ModelosMoto.FirstOrDefaultAsync(m => m.Modelo.Contains("FZ25"));

                if (modeloCg != null)
                {
                    await context.GaragemVirtual.AddAsync(new GaragemVirtual
                    {
                        Id = Guid.Parse("e611f1da-cd4a-4c9c-80ea-5cdac07887a8"),
                        UsuarioId = motociclista.Id,
                        ModeloMotoId = modeloCg.Id,
                        AnoFabricacao = 2022,
                        Apelido = "Titan 160 do Dia a Dia",
                        FotoMotoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Honda_CG_150_Titan.jpg/800px-Honda_CG_150_Titan.jpg"
                    });
                }

                if (modeloFz != null)
                {
                    await context.GaragemVirtual.AddAsync(new GaragemVirtual
                    {
                        Id = Guid.Parse("58646842-6376-4903-878f-323973d90766"),
                        UsuarioId = motociclista.Id,
                        ModeloMotoId = modeloFz.Id,
                        AnoFabricacao = 2023,
                        Apelido = "Fazer 250 de Viagem",
                        FotoMotoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/YAMAHA_FZ-S.jpg/800px-YAMAHA_FZ-S.jpg"
                    });
                }
                await context.SaveChangesAsync();
                logger.LogInformation("Motociclista demonstrativo cadastrado com sucesso.");
            }

            // 5. Seed de Usuários Lojistas e Lojas (Itabaiana como polo prioritário, Aracaju, Lagarto, Campo do Brito, Ribeirópolis, Moita Bonita e Malhador)
            var todasPecas = await context.Pecas.OrderBy(p => p.Id).ToListAsync();
            var hoje = DateOnly.FromDateTime(DateTime.UtcNow);
            var senhaPadraoLojista = BCrypt.Net.BCrypt.HashPassword("Loja#2026", 11);

            var listaLojasDef = new (
                Guid LojaId,
                Guid UsuarioId,
                string LojistaNome,
                string LojistaEmail,
                string NomeFantasia,
                string Cnpj,
                string Endereco,
                decimal Lat,
                decimal Lon,
                string Telefone,
                string Email,
                string Horarios,
                string FotoPerfil,
                string[] Galeria,
                decimal Multiplicador,
                string[] PromoPecas,
                int Nota,
                string Comentario
            )[]
            {
                (
                    Guid.Parse("3c262f1f-fc16-4f8c-b78c-dc8b2e414327"),
                    Guid.Parse("334e7d2b-26a3-4d29-b048-807ac9e0b646"),
                    "Carlos Alberto (Lojista)",
                    "lojista@gmail.com",
                    "Radar Motos & Peças Central",
                    "12.345.678/0001-90",
                    "Av. Barão de Maruim, 500 - Centro, Aracaju - SE",
                    -10.91841000m,
                    -37.04928000m,
                    "(79) 99988-7766",
                    "contato@radarmotosaracaju.com.br",
                    "{\"seg_sex\": \"08:00 - 18:00\", \"sab\": \"08:00 - 13:00\"}",
                    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600",
                    new[] { "https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=600" },
                    1.00m,
                    new[] { "VELA-NGK-CPR8EA9", "OLEO-MOBIL-10W30-4T" },
                    5,
                    "Excelente loja! Atendimento rápido e grande estoque de peças originais."
                ),
                (
                    Guid.Parse("803b36f8-a433-4f85-ba75-0cfc13534110"),
                    Guid.Parse("5dfadb41-6ebd-41c2-86f0-803991b5379a"),
                    "Mariana Costa (Lojista)",
                    "mariana@gmail.com",
                    "MotoPower Peças & Oficina",
                    "98.765.432/0001-10",
                    "Rua Mariano Salmeron, 250 - Siqueira Campos, Aracaju - SE",
                    -10.91097000m,
                    -37.07108000m,
                    "(79) 98877-6655",
                    "vendas@motopower.com.br",
                    "{\"seg_sex\": \"07:30 - 18:00\", \"sab\": \"08:00 - 12:00\"}",
                    "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600",
                    new[] { "https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=600" },
                    0.95m,
                    new[] { "PAST-COBREQ-N917", "KIT-VAZ-CG160-RET" },
                    4,
                    "Ótimos preços e mecânicos capacitados. Recomendo."
                ),
                (
                    Guid.Parse("a1111111-1111-4111-8111-111111111103"),
                    Guid.Parse("b1111111-1111-4111-8111-111111111103"),
                    "Jorge Cavalcante (Lojista)",
                    "jorge@jcmotos.com.br",
                    "J&C Motos e Peças",
                    "09.345.120/0001-38",
                    "Rua Mariano Salmeron, 535 - Siqueira Campos, Aracaju - SE",
                    -10.91180000m,
                    -37.07250000m,
                    "(79) 3241-8383",
                    "jcmotos@jcmotos.com.br",
                    "{\"seg_sex\": \"08:00 - 18:00\", \"sab\": \"08:00 - 12:30\"}",
                    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600",
                    new[] { "https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=600" },
                    0.98m,
                    new[] { "PNEU-PIRELLI-CITY-9090", "BAT-HELIAR-HTZ6L" },
                    5,
                    "Grande variedade de peças no Siqueira Campos, encontrei tudo de primeira."
                ),
                (
                    Guid.Parse("a1111111-1111-4111-8111-111111111104"),
                    Guid.Parse("b1111111-1111-4111-8111-111111111104"),
                    "Gilvan Matos (Lojista)",
                    "gilvan@ciclomotosaju.com.br",
                    "Ciclo Motos Peças",
                    "16.789.231/0001-99",
                    "Rua Mariano Salmeron, 483 - Siqueira Campos, Aracaju - SE",
                    -10.91140000m,
                    -37.07180000m,
                    "(79) 3241-7243",
                    "contato@ciclomotosaju.com.br",
                    "{\"seg_sex\": \"07:30 - 18:00\", \"sab\": \"08:00 - 13:00\"}",
                    "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600",
                    new[] { "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600" },
                    0.96m,
                    new[] { "FILT-OLEO-FRAM-CH6015", "LAMP-LED-PHILIPS-H4" },
                    4,
                    "Atendimento muito atencioso e preço justo em motopeças."
                ),
                (
                    Guid.Parse("a1111111-1111-4111-8111-111111111105"),
                    Guid.Parse("b1111111-1111-4111-8111-111111111105"),
                    "Everton Lima (Lojista)",
                    "everton@itabaianamotos.com.br",
                    "Itabaiana Motos Honda",
                    "05.823.114/0001-45",
                    "Av. Dr. Luiz Magalhães, 1597 - Marianga, Itabaiana - SE",
                    -10.69595000m,
                    -37.42788000m,
                    "(79) 3421-2000",
                    "contato@itabaianamotos.com.br",
                    "{\"seg_sex\": \"07:30 - 18:00\", \"sab\": \"08:00 - 12:30\"}",
                    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600",
                    new[] { "https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=600" },
                    1.05m,
                    new[] { "VELA-NGK-CPR8EA9", "PAST-COBREQ-N917" },
                    5,
                    "Concessionária nota 10! Peças genuínas Honda e oficina impecável."
                ),
                (
                    Guid.Parse("a1111111-1111-4111-8111-111111111106"),
                    Guid.Parse("b1111111-1111-4111-8111-111111111106"),
                    "Halley Santos (Lojista)",
                    "halley@halleymotopecas.com.br",
                    "Halley Moto Peças",
                    "14.238.901/0001-82",
                    "Av. 28 de Agosto, 1724 - Marianga, Itabaiana - SE",
                    -10.69720000m,
                    -37.42704000m,
                    "(79) 3431-1933",
                    "halley@halleymotopecas.com.br",
                    "{\"seg_sex\": \"07:30 - 18:00\", \"sab\": \"07:30 - 13:00\"}",
                    "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600",
                    new[] { "https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=600" },
                    0.94m,
                    new[] { "KIT-VAZ-CG160-RET", "PNEU-PIRELLI-CITY-9090" },
                    5,
                    "Tradição em Itabaiana! Grande estoque, preço excelente e serviço de retífica confiável."
                ),
                (
                    Guid.Parse("a1111111-1111-4111-8111-111111111107"),
                    Guid.Parse("b1111111-1111-4111-8111-111111111107"),
                    "Osias Mendonça (Lojista)",
                    "osias@osiasmotopecas.com.br",
                    "Osias Moto Peças",
                    "08.451.239/0001-63",
                    "Rua Percílio Andrade, 2021 - Bananeiras, Itabaiana - SE",
                    -10.68197000m,
                    -37.41855000m,
                    "(79) 3431-1852",
                    "osias@osiasmotopecas.com.br",
                    "{\"seg_sex\": \"08:00 - 18:00\", \"sab\": \"08:00 - 13:00\"}",
                    "https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=600",
                    new[] { "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600" },
                    0.93m,
                    new[] { "BAT-HELIAR-HTZ6L", "OLEO-MOBIL-10W30-4T" },
                    5,
                    "Melhor preço de baterias e lubrificantes da cidade, recomendo demais."
                ),
                (
                    Guid.Parse("a1111111-1111-4111-8111-111111111108"),
                    Guid.Parse("b1111111-1111-4111-8111-111111111108"),
                    "Marcos Joya (Lojista)",
                    "marcos@joyamotopecas.com.br",
                    "Joya Moto Peças",
                    "13.912.445/0001-20",
                    "Rua Marechal Deodoro da Fonseca, 711 - Mamede Paes Mendonça, Itabaiana - SE",
                    -10.68445000m,
                    -37.42433000m,
                    "(79) 99873-3737",
                    "vendas@joyamotopecas.com.br",
                    "{\"seg_sex\": \"07:30 - 17:30\", \"sab\": \"07:30 - 12:00\"}",
                    "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600",
                    new[] { "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600" },
                    0.92m,
                    new[] { "FILT-OLEO-FRAM-CH6015", "CABO-EMB-MOTOBOR-CG160" },
                    4,
                    "Distribuição forte com ótimo preço tanto no atacado quanto no varejo."
                ),
                (
                    Guid.Parse("a1111111-1111-4111-8111-111111111109"),
                    Guid.Parse("b1111111-1111-4111-8111-111111111109"),
                    "Rafael Luz (Lojista)",
                    "rafael@rafaelluzmotopecas.com.br",
                    "Motopeças Rafael Luz",
                    "22.115.890/0001-33",
                    "Rua Percílio Andrade, 1898 - Centro, Itabaiana - SE",
                    -10.68350000m,
                    -37.42050000m,
                    "(79) 99984-4950",
                    "rafael@rafaelluzmotopecas.com.br",
                    "{\"seg_sex\": \"08:00 - 18:00\", \"sab\": \"08:00 - 12:00\"}",
                    "https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=600",
                    new[] { "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600" },
                    0.95m,
                    new[] { "LAMP-LED-PHILIPS-H4", "CORREIA-GATES-NMAX" },
                    5,
                    "Atendimento prestativo e honesto. Troca de peças rápida no centro de Itabaiana."
                ),
                (
                    Guid.Parse("a1111111-1111-4111-8111-111111111110"),
                    Guid.Parse("b1111111-1111-4111-8111-111111111110"),
                    "Luís Fernando (Lojista)",
                    "luis@luismotopecas.com.br",
                    "Luís Moto Peças",
                    "19.340.582/0001-77",
                    "Rua José Paulo Santana, 636 - Centro, Itabaiana - SE",
                    -10.68650000m,
                    -37.42620000m,
                    "(79) 99912-3489",
                    "luismotopecas@gmail.com",
                    "{\"seg_sex\": \"07:30 - 18:00\", \"sab\": \"07:30 - 13:00\"}",
                    "https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=600",
                    new[] { "https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=600" },
                    0.95m,
                    new[] { "VELA-NGK-CPR8EA9", "KIT-VAZ-CG160-RET" },
                    4,
                    "Sempre tem peças de reposição rápida para CG e Fan com preço justo."
                ),
                (
                    Guid.Parse("a1111111-1111-4111-8111-111111111111"),
                    Guid.Parse("b1111111-1111-4111-8111-111111111111"),
                    "Marcelo Santos (Lojista)",
                    "marcelo@marcelomotopecas.com.br",
                    "Marcelo Moto Peças",
                    "27.810.450/0001-12",
                    "Rua Nova Brasília, s/n - Centro, Malhador - SE",
                    -10.66230000m,
                    -37.30889000m,
                    "(79) 99646-8837",
                    "marcelo@marcelomotopecas.com.br",
                    "{\"seg_sex\": \"07:30 - 17:30\", \"sab\": \"07:30 - 12:00\"}",
                    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600",
                    new[] { "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600" },
                    0.98m,
                    new[] { "PAST-COBREQ-N917", "OLEO-MOBIL-10W30-4T" },
                    5,
                    "Referência em motopeças em Malhador! Salvou meu dia com uma relação pronta entrega."
                ),
                (
                    Guid.Parse("a1111111-1111-4111-8111-111111111112"),
                    Guid.Parse("b1111111-1111-4111-8111-111111111112"),
                    "Tadeu Teixeira (Lojista)",
                    "tadeu@tadeumotopecas.com.br",
                    "Tadeu Moto Peças",
                    "15.670.392/0001-88",
                    "Av. Dr. Carlos Firpo, 28 - Centro, Ribeirópolis - SE",
                    -10.53980000m,
                    -37.42250000m,
                    "(79) 99943-5063",
                    "tadeu@tadeumotopecas.com.br",
                    "{\"seg_sex\": \"07:30 - 17:30\", \"sab\": \"07:30 - 12:00\"}",
                    "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600",
                    new[] { "https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=600" },
                    0.97m,
                    new[] { "VELA-NGK-CPR8EA9", "BAT-HELIAR-HTZ6L" },
                    5,
                    "Tadeu é muito gente boa, atendimento prestativo e ótimo estoque em Ribeirópolis."
                ),
                (
                    Guid.Parse("a1111111-1111-4111-8111-111111111113"),
                    Guid.Parse("b1111111-1111-4111-8111-111111111113"),
                    "Marcos Souza (Lojista)",
                    "marcos@marcossouzamotos.com.br",
                    "Motopeças Marcos Souza",
                    "31.420.781/0001-05",
                    "Avenida da Paz, 95 - Centro, Ribeirópolis - SE",
                    -10.53880000m,
                    -37.42100000m,
                    "(79) 99662-8115",
                    "marcos@marcossouzamotos.com.br",
                    "{\"seg_sex\": \"08:00 - 18:00\", \"sab\": \"08:00 - 12:00\"}",
                    "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600",
                    new[] { "https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=600" },
                    0.96m,
                    new[] { "KIT-VAZ-CG160-RET", "OLEO-MOBIL-10W30-4T" },
                    4,
                    "Boa oficina mecânica e motopeças variadas."
                ),
                (
                    Guid.Parse("a1111111-1111-4111-8111-111111111114"),
                    Guid.Parse("b1111111-1111-4111-8111-111111111114"),
                    "Yuri Santana (Lojista)",
                    "yuri@yurimotopecas.com.br",
                    "Yuri Moto Peças",
                    "28.514.890/0001-94",
                    "Rua Nossa Senhora de Lourdes, s/n - Centro, Moita Bonita - SE",
                    -10.57545000m,
                    -37.34052000m,
                    "(79) 99890-6318",
                    "yuri@yurimotopecas.com.br",
                    "{\"seg_sex\": \"07:30 - 17:30\", \"sab\": \"07:30 - 12:00\"}",
                    "https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=600",
                    new[] { "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600" },
                    0.98m,
                    new[] { "FILT-OLEO-FRAM-CH6015", "PNEU-PIRELLI-CITY-9090" },
                    5,
                    "Excelente loja em Moita Bonita! Peças novas com garantia."
                ),
                (
                    Guid.Parse("a1111111-1111-4111-8111-111111111115"),
                    Guid.Parse("b1111111-1111-4111-8111-111111111115"),
                    "José Carlos Nenê (Lojista)",
                    "nene@nenemotopecas.com.br",
                    "Nenê Moto Peças",
                    "33.621.198/0001-41",
                    "Rua Ernesto Geisel, 190 - Centro, Moita Bonita - SE",
                    -10.57720000m,
                    -37.34180000m,
                    "(79) 99812-7744",
                    "nene@nenemotopecas.com.br",
                    "{\"seg_sex\": \"08:00 - 18:00\", \"sab\": \"08:00 - 12:30\"}",
                    "https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=600",
                    new[] { "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600" },
                    0.97m,
                    new[] { "PAST-COBREQ-N917", "LAMP-LED-PHILIPS-H4" },
                    4,
                    "Atendimento cordial e serviços rápidos em motos na Moita."
                ),
                (
                    Guid.Parse("a1111111-1111-4111-8111-111111111116"),
                    Guid.Parse("b1111111-1111-4111-8111-111111111116"),
                    "Claudemir Britense (Lojista)",
                    "britense@britensemotopecas.com.br",
                    "Moto Peças Britense",
                    "07.214.568/0001-70",
                    "Rodovia João Paulo II, 117 - Centro, Campo do Brito - SE",
                    -10.73334000m,
                    -37.48706000m,
                    "(79) 99905-0830",
                    "britense@britensemotopecas.com.br",
                    "{\"seg_sex\": \"07:30 - 18:00\", \"sab\": \"07:30 - 12:30\"}",
                    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600",
                    new[] { "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600" },
                    0.96m,
                    new[] { "KIT-VAZ-CG160-RET", "BAT-HELIAR-HTZ6L" },
                    5,
                    "Loja tradicional em Campo do Brito na rodovia. Fácil acesso e ótimo estoque."
                ),
                (
                    Guid.Parse("a1111111-1111-4111-8111-111111111117"),
                    Guid.Parse("b1111111-1111-4111-8111-111111111117"),
                    "Victor Santos (Lojista)",
                    "victor@victorsantosmotos.com.br",
                    "Oficina & Peças Victor Santos",
                    "35.120.932/0001-22",
                    "Rua Pedro Francisco de Jesus, 372 - Centro, Campo do Brito - SE",
                    -10.73800000m,
                    -37.49250000m,
                    "(79) 99999-0053",
                    "victor@victorsantosmotos.com.br",
                    "{\"seg_sex\": \"08:00 - 18:00\", \"sab\": \"08:00 - 13:00\"}",
                    "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600",
                    new[] { "https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=600" },
                    0.95m,
                    new[] { "VELA-NGK-CPR8EA9", "CABO-EMB-MOTOBOR-CG160" },
                    4,
                    "Mecânico de muita confiança e peças de qualidade."
                ),
                (
                    Guid.Parse("a1111111-1111-4111-8111-111111111118"),
                    Guid.Parse("b1111111-1111-4111-8111-111111111118"),
                    "Geraldo Andrade (Lojista)",
                    "geraldo@geralmotopecas.com.br",
                    "Geral Moto Peças",
                    "04.912.834/0001-65",
                    "Rua Quintino Bocaiúva, 34 - Centro, Lagarto - SE",
                    -10.91815000m,
                    -37.67019000m,
                    "(79) 3631-2943",
                    "contato@geralmotopecas.com.br",
                    "{\"seg_sex\": \"07:30 - 18:00\", \"sab\": \"08:00 - 12:00\"}",
                    "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600",
                    new[] { "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600" },
                    0.96m,
                    new[] { "PAST-COBREQ-N917", "PNEU-PIRELLI-CITY-9090" },
                    5,
                    "Uma das maiores de Lagarto. Peças originais e paralelas com ótimo custo-benefício."
                ),
                (
                    Guid.Parse("a1111111-1111-4111-8111-111111111119"),
                    Guid.Parse("b1111111-1111-4111-8111-111111111119"),
                    "José Neto (Lojista)",
                    "neto@netomotos.com.br",
                    "Neto Motos",
                    "18.239.012/0001-56",
                    "Avenida Contorno, 3111 - Novo Horizonte, Lagarto - SE",
                    -10.91403000m,
                    -37.67514000m,
                    "(79) 99961-1077",
                    "neto@netomotos.com.br",
                    "{\"seg_sex\": \"07:30 - 18:00\", \"sab\": \"07:30 - 12:30\"}",
                    "https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=600",
                    new[] { "https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=600" },
                    0.97m,
                    new[] { "KIT-VAZ-CG160-RET", "OLEO-MOBIL-10W30-4T" },
                    5,
                    "Excelente atendimento na Av. Contorno, preço honesto e rapidez."
                ),
                (
                    Guid.Parse("a1111111-1111-4111-8111-111111111120"),
                    Guid.Parse("b1111111-1111-4111-8111-111111111120"),
                    "Márcio Pimentinha (Lojista)",
                    "marcio@pimentinhamotopecas.com.br",
                    "Pimentinha Moto Peças",
                    "21.670.432/0001-83",
                    "Rua Filadelfo Dórea, 278 - Centro, Lagarto - SE",
                    -10.91451000m,
                    -37.66375000m,
                    "(79) 99869-6786",
                    "pimentinha@pimentinhamotopecas.com.br",
                    "{\"seg_sex\": \"08:00 - 18:00\", \"sab\": \"08:00 - 13:00\"}",
                    "https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=600",
                    new[] { "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600" },
                    0.94m,
                    new[] { "VELA-NGK-CPR8EA9", "BAT-HELIAR-HTZ6L" },
                    4,
                    "Pimentinha sempre acha a peça certa pra você, muito gente boa."
                )
            };

            foreach (var def in listaLojasDef)
            {
                var usuarioExistente = await context.Usuarios.FirstOrDefaultAsync(u => u.Email == def.LojistaEmail);
                if (usuarioExistente == null)
                {
                    usuarioExistente = new Usuario
                    {
                        Id = def.UsuarioId,
                        Nome = def.LojistaNome,
                        Email = def.LojistaEmail,
                        SenhaHash = senhaPadraoLojista,
                        TipoUsuario = TipoUsuario.LOJISTA,
                        DataCadastro = DateTime.UtcNow
                    };
                    await context.Usuarios.AddAsync(usuarioExistente);
                    await context.SaveChangesAsync();
                }

                var lojaExistente = await context.Lojas.FirstOrDefaultAsync(l => l.Cnpj == def.Cnpj);
                if (lojaExistente == null)
                {
                    lojaExistente = new Loja
                    {
                        Id = def.LojaId,
                        UsuarioId = usuarioExistente.Id,
                        NomeFantasia = def.NomeFantasia,
                        Cnpj = def.Cnpj,
                        EnderecoCompleto = def.Endereco,
                        Latitude = def.Lat,
                        Longitude = def.Lon,
                        TelefoneContato = def.Telefone,
                        EmailContato = def.Email,
                        HorariosFuncionamento = def.Horarios,
                        FotoPerfilUrl = def.FotoPerfil,
                        GaleriaFotosUrls = def.Galeria,
                        Ativa = true
                    };
                    await context.Lojas.AddAsync(lojaExistente);
                    await context.SaveChangesAsync();

                    // Seed de Estoque e Ofertas para a Loja
                    var estoquesLoja = new List<EstoqueLoja>();
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
                            "Cabos & Comandos" => 32.00m,
                            _ => 50.00m
                        };

                        decimal precoVenda = Math.Round(precoBase * def.Multiplicador, 2);
                        bool emPromocao = def.PromoPecas.Contains(peca.Sku);
                        decimal? precoPromo = emPromocao ? Math.Round(precoVenda * 0.86m, 2) : null;

                        estoquesLoja.Add(new EstoqueLoja
                        {
                            LojaId = lojaExistente.Id,
                            PecaId = peca.Id,
                            QuantidadeEstoque = 10 + (peca.Id % 7) * 2,
                            AlertaEstoqueMinimo = 3,
                            PrecoVenda = precoVenda,
                            EmPromocao = emPromocao,
                            PrecoPromocional = precoPromo,
                            DataInicioPromocao = emPromocao ? hoje.AddDays(-3) : null,
                            DataFimPromocao = emPromocao ? hoje.AddDays(15) : null,
                            DataAtualizacao = DateTime.UtcNow
                        });
                    }

                    await context.EstoqueLojas.AddRangeAsync(estoquesLoja);
                    await context.SaveChangesAsync();

                    // Métricas para itens em promoção
                    var stats = new List<EstatisticaOferta>();
                    foreach (var est in estoquesLoja.Where(e => e.EmPromocao))
                    {
                        stats.Add(new EstatisticaOferta
                        {
                            EstoqueLojaId = est.Id,
                            Visualizacoes = new Random().Next(40, 150),
                            Cliques = new Random().Next(8, 35),
                            DataRegistro = hoje
                        });
                    }
                    if (stats.Any())
                    {
                        await context.EstatisticasOferta.AddRangeAsync(stats);
                        await context.SaveChangesAsync();
                    }

                    // Avaliação da loja
                    if (motociclista != null)
                    {
                        await context.AvaliacoesLoja.AddAsync(new AvaliacaoLoja
                        {
                            LojaId = lojaExistente.Id,
                            UsuarioId = motociclista.Id,
                            Nota = def.Nota,
                            Comentario = def.Comentario,
                            Recomenda = def.Nota >= 4,
                            DataAvaliacao = DateTime.UtcNow.AddDays(-2)
                        });
                        await context.SaveChangesAsync();
                    }
                }
                else
                {
                    // Atualiza coordenadas caso já existisse
                    lojaExistente.Latitude = def.Lat;
                    lojaExistente.Longitude = def.Lon;
                    lojaExistente.EnderecoCompleto = def.Endereco;
                    await context.SaveChangesAsync();
                }
            }

            logger.LogInformation("Seed de dados concluído com sucesso: 20 lojas de Sergipe ativas (Itabaiana prioritária, Aracaju, Lagarto, Campo do Brito, Ribeirópolis, Moita Bonita e Malhador)!");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erro ao executar o seed do banco de dados.");
        }
    }
}
