-- ============================================================================
-- RADARPEÇAS - SNAPSHOT DE DADOS E SCHEMA DO BANCO (DUMP POSTGRESQL)
-- ============================================================================
-- Papel deste arquivo:
-- 1. O schema oficial da aplicação é definido em "AnaliseProjeto/DB_radarPecas.sql"
--    e é aplicado automaticamente pelo DatabaseInitializer do ASP.NET Core ao
--    iniciar a API se o banco estiver vazio.
-- 2. Este arquivo ("dump_radarPecas.sql") é um backup/snapshot completo gerado
--    via pg_dump contendo o DDL e dados populados de teste. Serve para restauração
--    manual direta (psql / pgAdmin) ou consulta de referência do estado do banco.
-- ============================================================================
--
-- PostgreSQL database dump
--

\restrict CtPRcWKUAdxeQ1R2dYxnhidZCkZ6Wbz6Y9tASnyiytjLO3OCTCkckUdruKd67Ky

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.lojas DROP CONSTRAINT IF EXISTS lojas_usuario_id_fkey;
ALTER TABLE IF EXISTS ONLY public.garagem_virtual DROP CONSTRAINT IF EXISTS garagem_virtual_usuario_id_fkey;
ALTER TABLE IF EXISTS ONLY public.garagem_virtual DROP CONSTRAINT IF EXISTS garagem_virtual_modelo_moto_id_fkey;
ALTER TABLE IF EXISTS ONLY public.estoque_loja DROP CONSTRAINT IF EXISTS estoque_loja_peca_id_fkey;
ALTER TABLE IF EXISTS ONLY public.estoque_loja DROP CONSTRAINT IF EXISTS estoque_loja_loja_id_fkey;
ALTER TABLE IF EXISTS ONLY public.estatisticas_oferta DROP CONSTRAINT IF EXISTS estatisticas_oferta_estoque_loja_id_fkey;
ALTER TABLE IF EXISTS ONLY public.compatibilidade_peca_moto DROP CONSTRAINT IF EXISTS compatibilidade_peca_moto_peca_id_fkey;
ALTER TABLE IF EXISTS ONLY public.compatibilidade_peca_moto DROP CONSTRAINT IF EXISTS compatibilidade_peca_moto_modelo_moto_id_fkey;
ALTER TABLE IF EXISTS ONLY public.avaliacoes_loja DROP CONSTRAINT IF EXISTS avaliacoes_loja_usuario_id_fkey;
ALTER TABLE IF EXISTS ONLY public.avaliacoes_loja DROP CONSTRAINT IF EXISTS avaliacoes_loja_loja_id_fkey;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_pkey;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_email_key;
ALTER TABLE IF EXISTS ONLY public.pecas DROP CONSTRAINT IF EXISTS pecas_sku_key;
ALTER TABLE IF EXISTS ONLY public.pecas DROP CONSTRAINT IF EXISTS pecas_pkey;
ALTER TABLE IF EXISTS ONLY public.pecas DROP CONSTRAINT IF EXISTS pecas_codigo_ean_key;
ALTER TABLE IF EXISTS ONLY public.modelos_moto DROP CONSTRAINT IF EXISTS modelos_moto_pkey;
ALTER TABLE IF EXISTS ONLY public.lojas DROP CONSTRAINT IF EXISTS lojas_pkey;
ALTER TABLE IF EXISTS ONLY public.lojas DROP CONSTRAINT IF EXISTS lojas_cnpj_key;
ALTER TABLE IF EXISTS ONLY public.garagem_virtual DROP CONSTRAINT IF EXISTS garagem_virtual_pkey;
ALTER TABLE IF EXISTS ONLY public.estoque_loja DROP CONSTRAINT IF EXISTS estoque_loja_pkey;
ALTER TABLE IF EXISTS ONLY public.estatisticas_oferta DROP CONSTRAINT IF EXISTS estatisticas_oferta_pkey;
ALTER TABLE IF EXISTS ONLY public.estatisticas_oferta DROP CONSTRAINT IF EXISTS estatisticas_oferta_estoque_loja_id_data_registro_key;
ALTER TABLE IF EXISTS ONLY public.compatibilidade_peca_moto DROP CONSTRAINT IF EXISTS compatibilidade_peca_moto_pkey;
ALTER TABLE IF EXISTS ONLY public.avaliacoes_loja DROP CONSTRAINT IF EXISTS avaliacoes_loja_pkey;
ALTER TABLE IF EXISTS public.pecas ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.modelos_moto ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public.usuarios;
DROP SEQUENCE IF EXISTS public.pecas_id_seq;
DROP TABLE IF EXISTS public.pecas;
DROP SEQUENCE IF EXISTS public.modelos_moto_id_seq;
DROP TABLE IF EXISTS public.modelos_moto;
DROP TABLE IF EXISTS public.lojas;
DROP TABLE IF EXISTS public.garagem_virtual;
DROP TABLE IF EXISTS public.estoque_loja;
DROP TABLE IF EXISTS public.estatisticas_oferta;
DROP TABLE IF EXISTS public.compatibilidade_peca_moto;
DROP TABLE IF EXISTS public.avaliacoes_loja;
DROP EXTENSION IF EXISTS pgcrypto;
--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: avaliacoes_loja; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.avaliacoes_loja (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    loja_id uuid,
    usuario_id uuid,
    nota integer NOT NULL,
    comentario text,
    recomenda boolean NOT NULL,
    data_avaliacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT avaliacoes_loja_nota_check CHECK (((nota >= 1) AND (nota <= 5)))
);


ALTER TABLE public.avaliacoes_loja OWNER TO postgres;

--
-- Name: compatibilidade_peca_moto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.compatibilidade_peca_moto (
    peca_id integer NOT NULL,
    modelo_moto_id integer NOT NULL
);


ALTER TABLE public.compatibilidade_peca_moto OWNER TO postgres;

--
-- Name: estatisticas_oferta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estatisticas_oferta (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    estoque_loja_id uuid,
    visualizacoes integer DEFAULT 0,
    cliques integer DEFAULT 0,
    data_registro date DEFAULT CURRENT_DATE
);


ALTER TABLE public.estatisticas_oferta OWNER TO postgres;

--
-- Name: estoque_loja; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estoque_loja (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    loja_id uuid,
    peca_id integer,
    quantidade_estoque integer DEFAULT 0,
    alerta_estoque_minimo integer DEFAULT 5,
    preco_venda numeric(10,2) NOT NULL,
    em_promocao boolean DEFAULT false,
    preco_promocional numeric(10,2),
    data_inicio_promocao date,
    data_fim_promocao date,
    data_atualizacao timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.estoque_loja OWNER TO postgres;

--
-- Name: garagem_virtual; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.garagem_virtual (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid,
    modelo_moto_id integer,
    ano_fabricacao integer NOT NULL,
    apelido character varying(50),
    foto_moto_url text
);


ALTER TABLE public.garagem_virtual OWNER TO postgres;

--
-- Name: lojas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lojas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    usuario_id uuid,
    nome_fantasia character varying(150) NOT NULL,
    cnpj character varying(18),
    endereco_completo text NOT NULL,
    latitude numeric(10,8) NOT NULL,
    longitude numeric(11,8) NOT NULL,
    telefone_contato character varying(20),
    email_contato character varying(150),
    horarios_funcionamento jsonb,
    foto_perfil_url text,
    galeria_fotos_urls text[],
    ativa boolean DEFAULT true
);


ALTER TABLE public.lojas OWNER TO postgres;

--
-- Name: modelos_moto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modelos_moto (
    id integer NOT NULL,
    marca character varying(50) NOT NULL,
    modelo character varying(100) NOT NULL,
    ano_inicio integer,
    ano_fim integer
);


ALTER TABLE public.modelos_moto OWNER TO postgres;

--
-- Name: modelos_moto_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.modelos_moto_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.modelos_moto_id_seq OWNER TO postgres;

--
-- Name: modelos_moto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.modelos_moto_id_seq OWNED BY public.modelos_moto.id;


--
-- Name: pecas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pecas (
    id integer NOT NULL,
    sku character varying(50),
    codigo_ean character varying(13),
    nome character varying(150) NOT NULL,
    descricao text,
    categoria character varying(50) NOT NULL,
    foto_peca_url text,
    especificacoes jsonb
);


ALTER TABLE public.pecas OWNER TO postgres;

--
-- Name: pecas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pecas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pecas_id_seq OWNER TO postgres;

--
-- Name: pecas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pecas_id_seq OWNED BY public.pecas.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    senha_hash character varying(255) NOT NULL,
    tipo_usuario character varying(20),
    data_cadastro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT usuarios_tipo_usuario_check CHECK (((tipo_usuario)::text = ANY ((ARRAY['MOTOCICLISTA'::character varying, 'LOJISTA'::character varying])::text[])))
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: modelos_moto id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modelos_moto ALTER COLUMN id SET DEFAULT nextval('public.modelos_moto_id_seq'::regclass);


--
-- Name: pecas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pecas ALTER COLUMN id SET DEFAULT nextval('public.pecas_id_seq'::regclass);


--
-- Data for Name: avaliacoes_loja; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.avaliacoes_loja VALUES ('7fa65513-f333-4da9-9ed5-e533e414a0ec', '803b36f8-a433-4f85-ba75-0cfc13534110', 'cf8828f2-1aa1-4534-844b-1899e5803a8c', 4, 'Ótimos preços e mecânicos capacitados. Recomendo.', true, '2026-09-17 16:47:45.306104');
INSERT INTO public.avaliacoes_loja VALUES ('d4e7c6eb-ebb8-41e7-8622-012386f16543', '3c262f1f-fc16-4f8c-b78c-dc8b2e414327', 'cf8828f2-1aa1-4534-844b-1899e5803a8c', 5, 'Excelente loja! Atendimento rápido e grande estoque de peças originais.', true, '2026-09-16 16:47:45.306092');


--
-- Data for Name: compatibilidade_peca_moto; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.compatibilidade_peca_moto VALUES (1, 1);
INSERT INTO public.compatibilidade_peca_moto VALUES (1, 2);
INSERT INTO public.compatibilidade_peca_moto VALUES (1, 3);
INSERT INTO public.compatibilidade_peca_moto VALUES (1, 13);
INSERT INTO public.compatibilidade_peca_moto VALUES (2, 1);
INSERT INTO public.compatibilidade_peca_moto VALUES (2, 2);
INSERT INTO public.compatibilidade_peca_moto VALUES (2, 4);
INSERT INTO public.compatibilidade_peca_moto VALUES (2, 11);
INSERT INTO public.compatibilidade_peca_moto VALUES (3, 4);
INSERT INTO public.compatibilidade_peca_moto VALUES (3, 11);
INSERT INTO public.compatibilidade_peca_moto VALUES (4, 1);
INSERT INTO public.compatibilidade_peca_moto VALUES (4, 2);
INSERT INTO public.compatibilidade_peca_moto VALUES (5, 1);
INSERT INTO public.compatibilidade_peca_moto VALUES (5, 2);
INSERT INTO public.compatibilidade_peca_moto VALUES (5, 13);
INSERT INTO public.compatibilidade_peca_moto VALUES (6, 1);
INSERT INTO public.compatibilidade_peca_moto VALUES (6, 2);
INSERT INTO public.compatibilidade_peca_moto VALUES (6, 3);
INSERT INTO public.compatibilidade_peca_moto VALUES (6, 13);
INSERT INTO public.compatibilidade_peca_moto VALUES (7, 1);
INSERT INTO public.compatibilidade_peca_moto VALUES (7, 2);
INSERT INTO public.compatibilidade_peca_moto VALUES (7, 3);
INSERT INTO public.compatibilidade_peca_moto VALUES (7, 4);
INSERT INTO public.compatibilidade_peca_moto VALUES (8, 1);
INSERT INTO public.compatibilidade_peca_moto VALUES (8, 2);
INSERT INTO public.compatibilidade_peca_moto VALUES (8, 11);
INSERT INTO public.compatibilidade_peca_moto VALUES (8, 13);
INSERT INTO public.compatibilidade_peca_moto VALUES (9, 1);
INSERT INTO public.compatibilidade_peca_moto VALUES (9, 2);
INSERT INTO public.compatibilidade_peca_moto VALUES (10, 16);


--
-- Data for Name: estatisticas_oferta; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.estatisticas_oferta VALUES ('0e7aa611-91d9-441d-8fa3-4c27ee9f3b4b', 'e96c701f-c8fa-49e4-a77b-002980e734a9', 105, 26, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('247c7bec-8ac6-486f-973a-2dabbee08421', 'b38443e1-29a7-4fa9-a238-cc775ab2ed91', 28, 27, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('2cd90672-1fb5-4bd5-aad3-d6fa74e516a4', 'd7480928-d0ac-44fa-9b3c-49c4f4ab88d0', 113, 11, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('45c4c8d8-5b8a-47a2-a18b-be37d1ab8538', '1339630b-640d-41c4-b336-b8438d254242', 118, 20, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('7b03779d-76fa-4216-b166-d3ba22b997f0', '39b1b5e0-9aab-44dd-b7d8-e446df00e707', 28, 6, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('a99c13c3-c6ca-4e89-89ec-f894d474c444', '2089f127-5bbd-4569-ab3e-b91f11a374a2', 65, 29, '2026-09-18');


--
-- Data for Name: estoque_loja; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.estoque_loja VALUES ('1339630b-640d-41c4-b336-b8438d254242', '803b36f8-a433-4f85-ba75-0cfc13534110', 2, 10, 2, 46.08, true, 40.55, '2026-09-13', '2026-09-28', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('1a1739e0-37c3-4b31-b99d-14f9b1fa52bf', '803b36f8-a433-4f85-ba75-0cfc13534110', 9, 10, 2, 30.40, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247399');
INSERT INTO public.estoque_loja VALUES ('2089f127-5bbd-4569-ab3e-b91f11a374a2', '3c262f1f-fc16-4f8c-b78c-dc8b2e414327', 1, 15, 3, 35.00, true, 29.75, '2026-09-16', '2026-10-03', '2026-09-18 16:47:45.247337');
INSERT INTO public.estoque_loja VALUES ('20ea1f9d-6cf3-40de-b7b0-0608f5326144', '803b36f8-a433-4f85-ba75-0cfc13534110', 6, 10, 2, 171.00, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247396');
INSERT INTO public.estoque_loja VALUES ('270a6347-8cc2-4238-967d-29c3305ea8f9', '3c262f1f-fc16-4f8c-b78c-dc8b2e414327', 10, 15, 3, 165.00, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247399');
INSERT INTO public.estoque_loja VALUES ('2e8a52c5-9e14-410b-8cfc-3fa7885c3e6e', '803b36f8-a433-4f85-ba75-0cfc13534110', 10, 10, 2, 156.75, false, NULL, NULL, NULL, '2026-09-18 16:47:45.2474');
INSERT INTO public.estoque_loja VALUES ('39b1b5e0-9aab-44dd-b7d8-e446df00e707', '803b36f8-a433-4f85-ba75-0cfc13534110', 3, 10, 2, 26.60, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247393');
INSERT INTO public.estoque_loja VALUES ('59c463d6-2913-40a8-b056-9dc23f5e93f9', '803b36f8-a433-4f85-ba75-0cfc13534110', 5, 10, 2, 199.50, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247395');
INSERT INTO public.estoque_loja VALUES ('7bab08fe-f990-4a80-bb27-49bf87489d90', '803b36f8-a433-4f85-ba75-0cfc13534110', 4, 10, 2, 156.75, true, 137.94, '2026-09-13', '2026-09-28', '2026-09-18 16:47:45.247394');
INSERT INTO public.estoque_loja VALUES ('99ebb4ff-196f-490c-b3ec-e99fd00f7371', '803b36f8-a433-4f85-ba75-0cfc13534110', 7, 10, 2, 36.10, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247397');
INSERT INTO public.estoque_loja VALUES ('a14fa569-12df-4dec-afc0-5cd9170679db', '3c262f1f-fc16-4f8c-b78c-dc8b2e414327', 8, 15, 3, 85.00, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247398');
INSERT INTO public.estoque_loja VALUES ('a5617cb8-c990-4136-9c7d-0de6d4d392a0', '3c262f1f-fc16-4f8c-b78c-dc8b2e414327', 7, 15, 3, 38.00, true, 32.30, '2026-09-16', '2026-10-03', '2026-09-18 16:47:45.247397');
INSERT INTO public.estoque_loja VALUES ('a82261fe-7cbb-4481-9107-9afee4f49b66', '3c262f1f-fc16-4f8c-b78c-dc8b2e414327', 9, 15, 3, 32.00, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247399');
INSERT INTO public.estoque_loja VALUES ('ac938bcf-1517-4b1b-8fb4-c5eddd7d5e8c', '3c262f1f-fc16-4f8c-b78c-dc8b2e414327', 5, 15, 3, 210.00, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247394');
INSERT INTO public.estoque_loja VALUES ('b38443e1-29a7-4fa9-a238-cc775ab2ed91', '3c262f1f-fc16-4f8c-b78c-dc8b2e414327', 3, 15, 3, 28.00, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247392');
INSERT INTO public.estoque_loja VALUES ('c58a2316-2d95-416b-a127-3659987c7ca9', '3c262f1f-fc16-4f8c-b78c-dc8b2e414327', 6, 15, 3, 180.00, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247396');
INSERT INTO public.estoque_loja VALUES ('d7480928-d0ac-44fa-9b3c-49c4f4ab88d0', '3c262f1f-fc16-4f8c-b78c-dc8b2e414327', 2, 15, 3, 48.50, false, NULL, NULL, NULL, '2026-09-18 16:47:45.24739');
INSERT INTO public.estoque_loja VALUES ('dd10dbf6-54b3-46df-93fb-f65fe18b5885', '803b36f8-a433-4f85-ba75-0cfc13534110', 8, 10, 2, 80.75, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247398');
INSERT INTO public.estoque_loja VALUES ('e96c701f-c8fa-49e4-a77b-002980e734a9', '803b36f8-a433-4f85-ba75-0cfc13534110', 1, 10, 2, 33.25, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247388');
INSERT INTO public.estoque_loja VALUES ('ef80d6c2-93c5-4323-9629-7ceb2c191e1e', '3c262f1f-fc16-4f8c-b78c-dc8b2e414327', 4, 15, 3, 165.00, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247393');


--
-- Data for Name: garagem_virtual; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.garagem_virtual VALUES ('58646842-6376-4903-878f-323973d90766', 'cf8828f2-1aa1-4534-844b-1899e5803a8c', 11, 2023, 'Fazer 250 de Viagem', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=500');
INSERT INTO public.garagem_virtual VALUES ('e611f1da-cd4a-4c9c-80ea-5cdac07887a8', 'cf8828f2-1aa1-4534-844b-1899e5803a8c', 1, 2022, 'Titan 160 do Dia a Dia', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=500');


--
-- Data for Name: lojas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.lojas VALUES ('3c262f1f-fc16-4f8c-b78c-dc8b2e414327', '334e7d2b-26a3-4d29-b048-807ac9e0b646', 'Radar Motos & Peças Central', '12.345.678/0001-90', 'Av. Barão de Maruim, 500 - Centro, Aracaju - SE', -10.91670000, -37.05000000, '(79) 99988-7766', 'contato@radarmotosaracaju.com.br', '{"sab": "08:00 - 13:00", "seg_sex": "08:00 - 18:00"}', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500', '{https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800}', true);
INSERT INTO public.lojas VALUES ('803b36f8-a433-4f85-ba75-0cfc13534110', '5dfadb41-6ebd-41c2-86f0-803991b5379a', 'MotoPower Peças & Oficina', '98.765.432/0001-10', 'Rua Mariano Salmeron, 250 - Siqueira Campos, Aracaju - SE', -10.92340000, -37.07210000, '(79) 98877-6655', 'vendas@motopower.com.br', '{"sab": "08:00 - 12:00", "seg_sex": "07:30 - 18:00"}', 'https://images.unsplash.com/photo-1613214149922-f1809c99b414?w=500', '{https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800}', true);


--
-- Data for Name: modelos_moto; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.modelos_moto VALUES (1, 'Honda', 'CG 160 Titan', 2016, 2026);
INSERT INTO public.modelos_moto VALUES (2, 'Honda', 'CG 160 Fan', 2016, 2026);
INSERT INTO public.modelos_moto VALUES (3, 'Honda', 'NXR 160 Bros', 2015, 2026);
INSERT INTO public.modelos_moto VALUES (4, 'Honda', 'CB 300F Twister', 2023, 2026);
INSERT INTO public.modelos_moto VALUES (5, 'Honda', 'CB 250F Twister', 2016, 2022);
INSERT INTO public.modelos_moto VALUES (6, 'Honda', 'XRE 300', 2010, 2023);
INSERT INTO public.modelos_moto VALUES (7, 'Honda', 'XRE 190', 2016, 2026);
INSERT INTO public.modelos_moto VALUES (8, 'Honda', 'Biz 125', 2011, 2026);
INSERT INTO public.modelos_moto VALUES (9, 'Honda', 'Pop 110i', 2016, 2026);
INSERT INTO public.modelos_moto VALUES (10, 'Honda', 'PCX 160', 2022, 2026);
INSERT INTO public.modelos_moto VALUES (11, 'Yamaha', 'Fazer FZ25', 2018, 2026);
INSERT INTO public.modelos_moto VALUES (12, 'Yamaha', 'Factor 125i', 2017, 2026);
INSERT INTO public.modelos_moto VALUES (13, 'Yamaha', 'Factor 150', 2016, 2026);
INSERT INTO public.modelos_moto VALUES (14, 'Yamaha', 'Crosser 150', 2015, 2026);
INSERT INTO public.modelos_moto VALUES (15, 'Yamaha', 'Lander 250', 2019, 2026);
INSERT INTO public.modelos_moto VALUES (16, 'Yamaha', 'NMAX 160', 2016, 2026);
INSERT INTO public.modelos_moto VALUES (17, 'Yamaha', 'MT-03', 2016, 2026);
INSERT INTO public.modelos_moto VALUES (18, 'Yamaha', 'Fluo 125', 2022, 2026);


--
-- Data for Name: pecas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.pecas VALUES (1, 'VELA-NGK-CPR8EA9', '7897707504268', 'Vela de Ignição NGK CPR8EA-9', 'Vela de ignição padrão resistiva NGK para motores monocilíndricos.', 'Ignição', 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500', '{"rosca": "10mm", "eletrodo": "Níquel", "grau_termico": "8"}');
INSERT INTO public.pecas VALUES (2, 'PAST-COBREQ-N917', '7892679091702', 'Pastilha de Freio Dianteira Cobreq Street N-917', 'Pastilha orgânica para disco dianteiro, alta durabilidade e frenagem precisa.', 'Freios', 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=500', '{"linha": "Street", "posicao": "Dianteira", "material": "Orgânica"}');
INSERT INTO public.pecas VALUES (3, 'FILT-OLEO-FRAM-CH6015', '7896489311024', 'Filtro de Óleo Fram CH6015', 'Filtro de óleo de alta retenção de impurezas para proteção do motor.', 'Filtros', 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=500', '{"tipo": "Refil interno", "meio_filtrante": "Celulose microfibra"}');
INSERT INTO public.pecas VALUES (4, 'KIT-VAZ-CG160-RET', '7891234567890', 'Kit Relação Transmissão Vaz com Retentor Aço 1045', 'Kit completo de transmissão (coroa, pinhão e corrente com o-ring retentor).', 'Transmissão', 'https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=500', '{"aco": "1045", "coroa": "44D", "pinhao": "15D", "corrente": "428HO-118L com retentor"}');
INSERT INTO public.pecas VALUES (5, 'PNEU-PIRELLI-CITY-9090', '7898523697412', 'Pneu Traseiro Pirelli City Dragon 90/90-18 57P TT', 'Pneu para uso urbano com excelente rendimento quilométrico e aderência no molhado.', 'Pneus', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500', '{"medida": "90/90-18", "posicao": "Traseiro", "indice_vel": "P (150 km/h)", "indice_carga": "57 (230 kg)"}');
INSERT INTO public.pecas VALUES (6, 'BAT-HELIAR-HTZ6L', '7891472583690', 'Bateria Selada Heliar 12V 5Ah HTZ6L AGM', 'Bateria livre de manutenção com tecnologia AGM e alta corrente de partida.', 'Elétrica', 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=500', '{"cca": "50A", "tensao": "12V", "capacidade": "5Ah", "tecnologia": "AGM / VRLA"}');
INSERT INTO public.pecas VALUES (7, 'OLEO-MOBIL-10W30-4T', '7896541230987', 'Óleo de Motor Mobil Super Moto 4T 10W-30 Semissintético 1L', 'Lubrificante semissintético de alta performance atendendo API SL e JASO MA2.', 'Lubrificantes', 'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?w=500', '{"base": "Semissintético", "normas": "API SL / JASO MA2", "volume": "1 Litro", "viscosidade": "10W-30"}');
INSERT INTO public.pecas VALUES (8, 'LAMP-LED-PHILIPS-H4', '7894561237895', 'Lâmpada de Farol H4 LED Philips Ultinon Moto 6000K', 'Lâmpada LED automotiva de feixe concentrado sem ofuscamento e luz branca pura.', 'Iluminação', 'https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?w=500', '{"encaixe": "H4", "potencia": "12W", "durabilidade": "1500h", "temperatura_cor": "6000K"}');
INSERT INTO public.pecas VALUES (9, 'CABO-EMB-MOTOBOR-CG160', '7893214569871', 'Cabo de Embreagem Reforçado Motobor CG 160', 'Cabo de embreagem com teflon interno de acionamento ultra macio e resistente.', 'Cabos & Comandos', 'https://images.unsplash.com/photo-1609873814058-a8928924184a?w=500', '{"garantia": "6 meses", "comprimento": "105cm", "revestimento": "Teflon"}');
INSERT INTO public.pecas VALUES (10, 'CORREIA-GATES-NMAX', '7896547893215', 'Correia de Transmissão CVT Gates Powerlink NMAX 160', 'Correia dentada de alta durabilidade e dissipação térmica para scooter.', 'Transmissão', 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=500', '{"perfil": "CVT", "scooter": "NMAX 160", "material": "EPDM com cordonéis de aramida"}');


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.usuarios VALUES ('334e7d2b-26a3-4d29-b048-807ac9e0b646', 'Carlos Alberto (Lojista)', 'lojista@radarpecas.com.br', '$2a$11$RgiWZdyVoPRNbaAr/1oCROuHOeGlE523H/Pi7p3hd9f2HitZYvCqO', 'LOJISTA', '2026-09-18 16:47:44.716343');
INSERT INTO public.usuarios VALUES ('5dfadb41-6ebd-41c2-86f0-803991b5379a', 'Mariana Costa (Lojista)', 'mariana@motopower.com.br', '$2a$11$rH6CnBeph9YOKpxU0V7GoukWIfs9mF5/oQhbkYTJQOFf5YmL7EBMy', 'LOJISTA', '2026-09-18 16:47:44.919179');
INSERT INTO public.usuarios VALUES ('cf8828f2-1aa1-4534-844b-1899e5803a8c', 'Lucas Oliveira (Motociclista)', 'motociclista@radarpecas.com.br', '$2a$11$VMHMFi5h2oR7r/CDc2YIWuie2HJ367Mw5MEnpFA6O3vpywEqeswS2', 'MOTOCICLISTA', '2026-09-18 16:47:45.109604');


--
-- Name: modelos_moto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.modelos_moto_id_seq', 18, true);


--
-- Name: pecas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pecas_id_seq', 10, true);


--
-- Name: avaliacoes_loja avaliacoes_loja_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avaliacoes_loja
    ADD CONSTRAINT avaliacoes_loja_pkey PRIMARY KEY (id);


--
-- Name: compatibilidade_peca_moto compatibilidade_peca_moto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compatibilidade_peca_moto
    ADD CONSTRAINT compatibilidade_peca_moto_pkey PRIMARY KEY (peca_id, modelo_moto_id);


--
-- Name: estatisticas_oferta estatisticas_oferta_estoque_loja_id_data_registro_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estatisticas_oferta
    ADD CONSTRAINT estatisticas_oferta_estoque_loja_id_data_registro_key UNIQUE (estoque_loja_id, data_registro);


--
-- Name: estatisticas_oferta estatisticas_oferta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estatisticas_oferta
    ADD CONSTRAINT estatisticas_oferta_pkey PRIMARY KEY (id);


--
-- Name: estoque_loja estoque_loja_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estoque_loja
    ADD CONSTRAINT estoque_loja_pkey PRIMARY KEY (id);


--
-- Name: garagem_virtual garagem_virtual_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.garagem_virtual
    ADD CONSTRAINT garagem_virtual_pkey PRIMARY KEY (id);


--
-- Name: lojas lojas_cnpj_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lojas
    ADD CONSTRAINT lojas_cnpj_key UNIQUE (cnpj);


--
-- Name: lojas lojas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lojas
    ADD CONSTRAINT lojas_pkey PRIMARY KEY (id);


--
-- Name: modelos_moto modelos_moto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modelos_moto
    ADD CONSTRAINT modelos_moto_pkey PRIMARY KEY (id);


--
-- Name: pecas pecas_codigo_ean_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pecas
    ADD CONSTRAINT pecas_codigo_ean_key UNIQUE (codigo_ean);


--
-- Name: pecas pecas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pecas
    ADD CONSTRAINT pecas_pkey PRIMARY KEY (id);


--
-- Name: pecas pecas_sku_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pecas
    ADD CONSTRAINT pecas_sku_key UNIQUE (sku);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: avaliacoes_loja avaliacoes_loja_loja_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avaliacoes_loja
    ADD CONSTRAINT avaliacoes_loja_loja_id_fkey FOREIGN KEY (loja_id) REFERENCES public.lojas(id) ON DELETE CASCADE;


--
-- Name: avaliacoes_loja avaliacoes_loja_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avaliacoes_loja
    ADD CONSTRAINT avaliacoes_loja_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: compatibilidade_peca_moto compatibilidade_peca_moto_modelo_moto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compatibilidade_peca_moto
    ADD CONSTRAINT compatibilidade_peca_moto_modelo_moto_id_fkey FOREIGN KEY (modelo_moto_id) REFERENCES public.modelos_moto(id) ON DELETE CASCADE;


--
-- Name: compatibilidade_peca_moto compatibilidade_peca_moto_peca_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compatibilidade_peca_moto
    ADD CONSTRAINT compatibilidade_peca_moto_peca_id_fkey FOREIGN KEY (peca_id) REFERENCES public.pecas(id) ON DELETE CASCADE;


--
-- Name: estatisticas_oferta estatisticas_oferta_estoque_loja_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estatisticas_oferta
    ADD CONSTRAINT estatisticas_oferta_estoque_loja_id_fkey FOREIGN KEY (estoque_loja_id) REFERENCES public.estoque_loja(id) ON DELETE CASCADE;


--
-- Name: estoque_loja estoque_loja_loja_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estoque_loja
    ADD CONSTRAINT estoque_loja_loja_id_fkey FOREIGN KEY (loja_id) REFERENCES public.lojas(id) ON DELETE CASCADE;


--
-- Name: estoque_loja estoque_loja_peca_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estoque_loja
    ADD CONSTRAINT estoque_loja_peca_id_fkey FOREIGN KEY (peca_id) REFERENCES public.pecas(id) ON DELETE RESTRICT;


--
-- Name: garagem_virtual garagem_virtual_modelo_moto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.garagem_virtual
    ADD CONSTRAINT garagem_virtual_modelo_moto_id_fkey FOREIGN KEY (modelo_moto_id) REFERENCES public.modelos_moto(id) ON DELETE RESTRICT;


--
-- Name: garagem_virtual garagem_virtual_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.garagem_virtual
    ADD CONSTRAINT garagem_virtual_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: lojas lojas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lojas
    ADD CONSTRAINT lojas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict CtPRcWKUAdxeQ1R2dYxnhidZCkZ6Wbz6Y9tASnyiytjLO3OCTCkckUdruKd67Ky

