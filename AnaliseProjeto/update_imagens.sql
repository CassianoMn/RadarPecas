-- =====================================================
-- Script para atualizar as URLs de imagens no banco
-- Executar no PostgreSQL (radarPecas)
-- =====================================================

-- 1. Peças - Atualizar FotoPecaUrl
UPDATE public.pecas SET foto_peca_url = 'https://http2.mlstatic.com/D_NQ_NP_876209-MLB108040626802_032026-O.webp' WHERE sku = 'VELA-NGK-CPR8EA9';
UPDATE public.pecas SET foto_peca_url = 'https://karhub-images.karhub.com.br/234957-pastilha-de-freio-dianteira-1726498351871.jpeg' WHERE sku = 'PAST-COBREQ-N917';
UPDATE public.pecas SET foto_peca_url = 'https://fortnine.ca/media/catalog/product/cache/dd4850ad4231b6306bceadf38a0bbeed/catalogimages/fram/extra-guard-oil-filter-cartridge-ch6015.jpg' WHERE sku = 'FILT-OLEO-FRAM-CH6015';
UPDATE public.pecas SET foto_peca_url = 'https://http2.mlstatic.com/D_NQ_NP_2X_881930-MLU75562498498_042024-F.webp' WHERE sku = 'KIT-VAZ-CG160-RET';
UPDATE public.pecas SET foto_peca_url = 'https://tyre-images.pirelli.com/MKTData/MOTO/files/2094/mototopimage/pirelli_moto_city_dragon_base_1_992x992.png' WHERE sku = 'PNEU-PIRELLI-CITY-9090';
UPDATE public.pecas SET foto_peca_url = 'https://http2.mlstatic.com/D_NQ_NP_2X_871209-MLU72521367498_102023-F.webp' WHERE sku = 'BAT-HELIAR-HTZ6L';
UPDATE public.pecas SET foto_peca_url = 'https://cdn.awsli.com.br/600x450/877/877231/produto/221477213/mobil-4t-10w30-3egdm9prtu.png' WHERE sku = 'OLEO-MOBIL-10W30-4T';
UPDATE public.pecas SET foto_peca_url = 'https://fortbras.vteximg.com.br/arquivos/ids/318302/lampada-philips-ultinon-led-moto-luz-branca-hs1-h4-12v-9w-6000k-farol-11458umx1-hipervarejo-1.jpg' WHERE sku = 'LAMP-LED-PHILIPS-H4';
UPDATE public.pecas SET foto_peca_url = 'https://www.motokart.com.br/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/c/a/cabo_embreagem_titan_fan_start_160_1_2.jpg' WHERE sku = 'CABO-EMB-MOTOBOR-CG160';
UPDATE public.pecas SET foto_peca_url = 'https://http2.mlstatic.com/D_NQ_NP_2X_938589-MLU74021834718_012024-F.webp' WHERE sku = 'CORREIA-GATES-NMAX';

-- 2. Lojas - Atualizar FotoPerfilUrl e GaleriaFotosUrls
UPDATE public.lojas SET foto_perfil_url = 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600', galeria_fotos_urls = '{https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=600}' WHERE nome_fantasia = 'Radar Motos & Peças Central';
UPDATE public.lojas SET foto_perfil_url = 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600', galeria_fotos_urls = '{https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=600}' WHERE nome_fantasia = 'MotoPower Peças & Oficina';

-- 3. Garagem Virtual - Atualizar FotoMotoUrl
UPDATE public.garagem_virtual SET foto_moto_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Honda_CG_150_Titan.jpg/800px-Honda_CG_150_Titan.jpg' WHERE apelido = 'Titan 160 do Dia a Dia';
UPDATE public.garagem_virtual SET foto_moto_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/YAMAHA_FZ-S.jpg/800px-YAMAHA_FZ-S.jpg' WHERE apelido = 'Fazer 250 de Viagem';
