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

INSERT INTO public.avaliacoes_loja VALUES ('e0000000-0000-4000-8000-000000000001', '3c262f1f-fc16-4f8c-b78c-dc8b2e414327', 'cf8828f2-1aa1-4534-844b-1899e5803a8c', 5, 'Excelente loja! Atendimento rápido e grande estoque de peças originais.', true, '2026-09-18 16:47:45.306104');
INSERT INTO public.avaliacoes_loja VALUES ('e0000000-0000-4000-8000-000000000002', '803b36f8-a433-4f85-ba75-0cfc13534110', 'cf8828f2-1aa1-4534-844b-1899e5803a8c', 4, 'Ótimos preços e mecânicos capacitados. Recomendo.', true, '2026-09-18 16:47:45.306104');
INSERT INTO public.avaliacoes_loja VALUES ('e0000000-0000-4000-8000-000000000003', 'a1111111-1111-4111-8111-111111111103', 'cf8828f2-1aa1-4534-844b-1899e5803a8c', 5, 'Grande variedade de peças no Siqueira Campos, encontrei tudo de primeira.', true, '2026-09-18 16:47:45.306104');
INSERT INTO public.avaliacoes_loja VALUES ('e0000000-0000-4000-8000-000000000004', 'a1111111-1111-4111-8111-111111111104', 'cf8828f2-1aa1-4534-844b-1899e5803a8c', 4, 'Atendimento muito atencioso e preço justo em motopeças.', true, '2026-09-18 16:47:45.306104');
INSERT INTO public.avaliacoes_loja VALUES ('e0000000-0000-4000-8000-000000000005', 'a1111111-1111-4111-8111-111111111105', 'cf8828f2-1aa1-4534-844b-1899e5803a8c', 5, 'Concessionária nota 10! Peças genuínas Honda e oficina impecável.', true, '2026-09-18 16:47:45.306104');
INSERT INTO public.avaliacoes_loja VALUES ('e0000000-0000-4000-8000-000000000006', 'a1111111-1111-4111-8111-111111111106', 'cf8828f2-1aa1-4534-844b-1899e5803a8c', 5, 'Tradição em Itabaiana! Grande estoque, preço excelente e serviço de retífica confiável.', true, '2026-09-18 16:47:45.306104');
INSERT INTO public.avaliacoes_loja VALUES ('e0000000-0000-4000-8000-000000000007', 'a1111111-1111-4111-8111-111111111107', 'cf8828f2-1aa1-4534-844b-1899e5803a8c', 5, 'Melhor preço de baterias e lubrificantes da cidade, recomendo demais.', true, '2026-09-18 16:47:45.306104');
INSERT INTO public.avaliacoes_loja VALUES ('e0000000-0000-4000-8000-000000000008', 'a1111111-1111-4111-8111-111111111108', 'cf8828f2-1aa1-4534-844b-1899e5803a8c', 4, 'Distribuição forte com ótimo preço tanto no atacado quanto no varejo.', true, '2026-09-18 16:47:45.306104');
INSERT INTO public.avaliacoes_loja VALUES ('e0000000-0000-4000-8000-000000000009', 'a1111111-1111-4111-8111-111111111109', 'cf8828f2-1aa1-4534-844b-1899e5803a8c', 5, 'Atendimento prestativo e honesto. Troca de peças rápida no centro de Itabaiana.', true, '2026-09-18 16:47:45.306104');
INSERT INTO public.avaliacoes_loja VALUES ('e0000000-0000-4000-8000-00000000000a', 'a1111111-1111-4111-8111-111111111110', 'cf8828f2-1aa1-4534-844b-1899e5803a8c', 4, 'Sempre tem peças de reposição rápida para CG e Fan com preço justo.', true, '2026-09-18 16:47:45.306104');
INSERT INTO public.avaliacoes_loja VALUES ('e0000000-0000-4000-8000-00000000000b', 'a1111111-1111-4111-8111-111111111111', 'cf8828f2-1aa1-4534-844b-1899e5803a8c', 5, 'Referência em motopeças em Malhador! Salvou meu dia com uma relação pronta entrega.', true, '2026-09-18 16:47:45.306104');
INSERT INTO public.avaliacoes_loja VALUES ('e0000000-0000-4000-8000-00000000000c', 'a1111111-1111-4111-8111-111111111112', 'cf8828f2-1aa1-4534-844b-1899e5803a8c', 5, 'Tadeu é muito gente boa, atendimento prestativo e ótimo estoque em Ribeirópolis.', true, '2026-09-18 16:47:45.306104');
INSERT INTO public.avaliacoes_loja VALUES ('e0000000-0000-4000-8000-00000000000d', 'a1111111-1111-4111-8111-111111111113', 'cf8828f2-1aa1-4534-844b-1899e5803a8c', 4, 'Boa oficina mecânica e motopeças variadas.', true, '2026-09-18 16:47:45.306104');
INSERT INTO public.avaliacoes_loja VALUES ('e0000000-0000-4000-8000-00000000000e', 'a1111111-1111-4111-8111-111111111114', 'cf8828f2-1aa1-4534-844b-1899e5803a8c', 5, 'Excelente loja em Moita Bonita! Peças novas com garantia.', true, '2026-09-18 16:47:45.306104');
INSERT INTO public.avaliacoes_loja VALUES ('e0000000-0000-4000-8000-00000000000f', 'a1111111-1111-4111-8111-111111111115', 'cf8828f2-1aa1-4534-844b-1899e5803a8c', 4, 'Atendimento cordial e serviços rápidos em motos na Moita.', true, '2026-09-18 16:47:45.306104');
INSERT INTO public.avaliacoes_loja VALUES ('e0000000-0000-4000-8000-000000000010', 'a1111111-1111-4111-8111-111111111116', 'cf8828f2-1aa1-4534-844b-1899e5803a8c', 5, 'Loja tradicional em Campo do Brito na rodovia. Fácil acesso e ótimo estoque.', true, '2026-09-18 16:47:45.306104');
INSERT INTO public.avaliacoes_loja VALUES ('e0000000-0000-4000-8000-000000000011', 'a1111111-1111-4111-8111-111111111117', 'cf8828f2-1aa1-4534-844b-1899e5803a8c', 4, 'Mecânico de muita confiança e peças de qualidade.', true, '2026-09-18 16:47:45.306104');
INSERT INTO public.avaliacoes_loja VALUES ('e0000000-0000-4000-8000-000000000012', 'a1111111-1111-4111-8111-111111111118', 'cf8828f2-1aa1-4534-844b-1899e5803a8c', 5, 'Uma das maiores de Lagarto. Peças originais e paralelas com ótimo custo-benefício.', true, '2026-09-18 16:47:45.306104');
INSERT INTO public.avaliacoes_loja VALUES ('e0000000-0000-4000-8000-000000000013', 'a1111111-1111-4111-8111-111111111119', 'cf8828f2-1aa1-4534-844b-1899e5803a8c', 5, 'Excelente atendimento na Av. Contorno, preço honesto e rapidez.', true, '2026-09-18 16:47:45.306104');
INSERT INTO public.avaliacoes_loja VALUES ('e0000000-0000-4000-8000-000000000014', 'a1111111-1111-4111-8111-111111111120', 'cf8828f2-1aa1-4534-844b-1899e5803a8c', 4, 'Pimentinha sempre acha a peça certa pra você, muito gente boa.', true, '2026-09-18 16:47:45.306104');





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

INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-010000000001', 'c0000000-0000-4000-8000-010000000001', 50, 12, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-010000000007', 'c0000000-0000-4000-8000-010000000007', 80, 24, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-020000000002', 'c0000000-0000-4000-8000-020000000002', 62, 17, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-020000000004', 'c0000000-0000-4000-8000-020000000004', 72, 21, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-030000000005', 'c0000000-0000-4000-8000-030000000005', 84, 26, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-030000000006', 'c0000000-0000-4000-8000-030000000006', 89, 28, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-040000000003', 'c0000000-0000-4000-8000-040000000003', 81, 25, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-040000000008', 'c0000000-0000-4000-8000-040000000008', 106, 10, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-050000000001', 'c0000000-0000-4000-8000-050000000001', 78, 24, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-050000000002', 'c0000000-0000-4000-8000-050000000002', 83, 26, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-060000000004', 'c0000000-0000-4000-8000-060000000004', 100, 33, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-060000000005', 'c0000000-0000-4000-8000-060000000005', 105, 10, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-070000000006', 'c0000000-0000-4000-8000-070000000006', 117, 15, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-070000000007', 'c0000000-0000-4000-8000-070000000007', 122, 17, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-080000000003', 'c0000000-0000-4000-8000-080000000003', 109, 12, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-080000000009', 'c0000000-0000-4000-8000-080000000009', 59, 24, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-090000000008', 'c0000000-0000-4000-8000-090000000008', 61, 25, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-09000000000a', 'c0000000-0000-4000-8000-09000000000a', 71, 29, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-0a0000000001', 'c0000000-0000-4000-8000-0a0000000001', 113, 14, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-0a0000000004', 'c0000000-0000-4000-8000-0a0000000004', 48, 20, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-0b0000000002', 'c0000000-0000-4000-8000-0b0000000002', 45, 19, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-0b0000000007', 'c0000000-0000-4000-8000-0b0000000007', 70, 29, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-0c0000000001', 'c0000000-0000-4000-8000-0c0000000001', 47, 20, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-0c0000000006', 'c0000000-0000-4000-8000-0c0000000006', 72, 30, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-0d0000000004', 'c0000000-0000-4000-8000-0d0000000004', 69, 29, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-0d0000000007', 'c0000000-0000-4000-8000-0d0000000007', 84, 10, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-0e0000000003', 'c0000000-0000-4000-8000-0e0000000003', 71, 30, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-0e0000000005', 'c0000000-0000-4000-8000-0e0000000005', 81, 34, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-0f0000000002', 'c0000000-0000-4000-8000-0f0000000002', 73, 31, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-0f0000000008', 'c0000000-0000-4000-8000-0f0000000008', 103, 18, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-100000000004', 'c0000000-0000-4000-8000-100000000004', 90, 13, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-100000000006', 'c0000000-0000-4000-8000-100000000006', 100, 17, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-110000000001', 'c0000000-0000-4000-8000-110000000001', 82, 10, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-110000000009', 'c0000000-0000-4000-8000-110000000009', 122, 26, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-120000000002', 'c0000000-0000-4000-8000-120000000002', 94, 15, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-120000000005', 'c0000000-0000-4000-8000-120000000005', 109, 21, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-130000000004', 'c0000000-0000-4000-8000-130000000004', 111, 22, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-130000000007', 'c0000000-0000-4000-8000-130000000007', 46, 28, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-140000000001', 'c0000000-0000-4000-8000-140000000001', 103, 19, '2026-09-18');
INSERT INTO public.estatisticas_oferta VALUES ('d0000000-0000-4000-8000-140000000006', 'c0000000-0000-4000-8000-140000000006', 48, 29, '2026-09-18');





--
-- Data for Name: estoque_loja; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-010000000001', '3c262f1f-fc16-4f8c-b78c-dc8b2e414327', 1, 12, 3, 35.00, true, 30.10, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-010000000002', '3c262f1f-fc16-4f8c-b78c-dc8b2e414327', 2, 14, 3, 48.50, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-010000000003', '3c262f1f-fc16-4f8c-b78c-dc8b2e414327', 3, 16, 3, 28.00, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-010000000004', '3c262f1f-fc16-4f8c-b78c-dc8b2e414327', 4, 18, 3, 165.00, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-010000000005', '3c262f1f-fc16-4f8c-b78c-dc8b2e414327', 5, 20, 3, 210.00, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-010000000006', '3c262f1f-fc16-4f8c-b78c-dc8b2e414327', 6, 22, 3, 180.00, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-010000000007', '3c262f1f-fc16-4f8c-b78c-dc8b2e414327', 7, 10, 3, 38.00, true, 32.68, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-010000000008', '3c262f1f-fc16-4f8c-b78c-dc8b2e414327', 8, 12, 3, 85.00, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-010000000009', '3c262f1f-fc16-4f8c-b78c-dc8b2e414327', 9, 14, 3, 32.00, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-01000000000a', '3c262f1f-fc16-4f8c-b78c-dc8b2e414327', 10, 16, 3, 165.00, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-020000000001', '803b36f8-a433-4f85-ba75-0cfc13534110', 1, 14, 3, 33.25, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-020000000002', '803b36f8-a433-4f85-ba75-0cfc13534110', 2, 16, 3, 46.07, true, 39.62, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-020000000003', '803b36f8-a433-4f85-ba75-0cfc13534110', 3, 18, 3, 26.60, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-020000000004', '803b36f8-a433-4f85-ba75-0cfc13534110', 4, 20, 3, 156.75, true, 134.81, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-020000000005', '803b36f8-a433-4f85-ba75-0cfc13534110', 5, 22, 3, 199.50, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-020000000006', '803b36f8-a433-4f85-ba75-0cfc13534110', 6, 10, 3, 171.00, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-020000000007', '803b36f8-a433-4f85-ba75-0cfc13534110', 7, 12, 3, 36.10, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-020000000008', '803b36f8-a433-4f85-ba75-0cfc13534110', 8, 14, 3, 80.75, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-020000000009', '803b36f8-a433-4f85-ba75-0cfc13534110', 9, 16, 3, 30.40, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-02000000000a', '803b36f8-a433-4f85-ba75-0cfc13534110', 10, 18, 3, 156.75, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-030000000001', 'a1111111-1111-4111-8111-111111111103', 1, 16, 3, 34.30, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-030000000002', 'a1111111-1111-4111-8111-111111111103', 2, 18, 3, 47.53, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-030000000003', 'a1111111-1111-4111-8111-111111111103', 3, 20, 3, 27.44, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-030000000004', 'a1111111-1111-4111-8111-111111111103', 4, 22, 3, 161.70, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-030000000005', 'a1111111-1111-4111-8111-111111111103', 5, 10, 3, 205.80, true, 176.99, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-030000000006', 'a1111111-1111-4111-8111-111111111103', 6, 12, 3, 176.40, true, 151.70, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-030000000007', 'a1111111-1111-4111-8111-111111111103', 7, 14, 3, 37.24, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-030000000008', 'a1111111-1111-4111-8111-111111111103', 8, 16, 3, 83.30, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-030000000009', 'a1111111-1111-4111-8111-111111111103', 9, 18, 3, 31.36, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-03000000000a', 'a1111111-1111-4111-8111-111111111103', 10, 20, 3, 161.70, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-040000000001', 'a1111111-1111-4111-8111-111111111104', 1, 18, 3, 33.60, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-040000000002', 'a1111111-1111-4111-8111-111111111104', 2, 20, 3, 46.56, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-040000000003', 'a1111111-1111-4111-8111-111111111104', 3, 22, 3, 26.88, true, 23.12, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-040000000004', 'a1111111-1111-4111-8111-111111111104', 4, 10, 3, 158.40, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-040000000005', 'a1111111-1111-4111-8111-111111111104', 5, 12, 3, 201.60, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-040000000006', 'a1111111-1111-4111-8111-111111111104', 6, 14, 3, 172.80, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-040000000007', 'a1111111-1111-4111-8111-111111111104', 7, 16, 3, 36.48, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-040000000008', 'a1111111-1111-4111-8111-111111111104', 8, 18, 3, 81.60, true, 70.18, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-040000000009', 'a1111111-1111-4111-8111-111111111104', 9, 20, 3, 30.72, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-04000000000a', 'a1111111-1111-4111-8111-111111111104', 10, 22, 3, 158.40, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-050000000001', 'a1111111-1111-4111-8111-111111111105', 1, 20, 3, 36.75, true, 31.61, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-050000000002', 'a1111111-1111-4111-8111-111111111105', 2, 22, 3, 50.93, true, 43.80, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-050000000003', 'a1111111-1111-4111-8111-111111111105', 3, 10, 3, 29.40, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-050000000004', 'a1111111-1111-4111-8111-111111111105', 4, 12, 3, 173.25, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-050000000005', 'a1111111-1111-4111-8111-111111111105', 5, 14, 3, 220.50, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-050000000006', 'a1111111-1111-4111-8111-111111111105', 6, 16, 3, 189.00, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-050000000007', 'a1111111-1111-4111-8111-111111111105', 7, 18, 3, 39.90, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-050000000008', 'a1111111-1111-4111-8111-111111111105', 8, 20, 3, 89.25, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-050000000009', 'a1111111-1111-4111-8111-111111111105', 9, 22, 3, 33.60, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-05000000000a', 'a1111111-1111-4111-8111-111111111105', 10, 10, 3, 173.25, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-060000000001', 'a1111111-1111-4111-8111-111111111106', 1, 22, 3, 32.90, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-060000000002', 'a1111111-1111-4111-8111-111111111106', 2, 10, 3, 45.59, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-060000000003', 'a1111111-1111-4111-8111-111111111106', 3, 12, 3, 26.32, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-060000000004', 'a1111111-1111-4111-8111-111111111106', 4, 14, 3, 155.10, true, 133.39, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-060000000005', 'a1111111-1111-4111-8111-111111111106', 5, 16, 3, 197.40, true, 169.76, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-060000000006', 'a1111111-1111-4111-8111-111111111106', 6, 18, 3, 169.20, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-060000000007', 'a1111111-1111-4111-8111-111111111106', 7, 20, 3, 35.72, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-060000000008', 'a1111111-1111-4111-8111-111111111106', 8, 22, 3, 79.90, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-060000000009', 'a1111111-1111-4111-8111-111111111106', 9, 10, 3, 30.08, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-06000000000a', 'a1111111-1111-4111-8111-111111111106', 10, 12, 3, 155.10, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-070000000001', 'a1111111-1111-4111-8111-111111111107', 1, 10, 3, 32.55, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-070000000002', 'a1111111-1111-4111-8111-111111111107', 2, 12, 3, 45.11, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-070000000003', 'a1111111-1111-4111-8111-111111111107', 3, 14, 3, 26.04, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-070000000004', 'a1111111-1111-4111-8111-111111111107', 4, 16, 3, 153.45, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-070000000005', 'a1111111-1111-4111-8111-111111111107', 5, 18, 3, 195.30, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-070000000006', 'a1111111-1111-4111-8111-111111111107', 6, 20, 3, 167.40, true, 143.96, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-070000000007', 'a1111111-1111-4111-8111-111111111107', 7, 22, 3, 35.34, true, 30.39, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-070000000008', 'a1111111-1111-4111-8111-111111111107', 8, 10, 3, 79.05, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-070000000009', 'a1111111-1111-4111-8111-111111111107', 9, 12, 3, 29.76, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-07000000000a', 'a1111111-1111-4111-8111-111111111107', 10, 14, 3, 153.45, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-080000000001', 'a1111111-1111-4111-8111-111111111108', 1, 12, 3, 32.20, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-080000000002', 'a1111111-1111-4111-8111-111111111108', 2, 14, 3, 44.62, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-080000000003', 'a1111111-1111-4111-8111-111111111108', 3, 16, 3, 25.76, true, 22.15, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-080000000004', 'a1111111-1111-4111-8111-111111111108', 4, 18, 3, 151.80, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-080000000005', 'a1111111-1111-4111-8111-111111111108', 5, 20, 3, 193.20, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-080000000006', 'a1111111-1111-4111-8111-111111111108', 6, 22, 3, 165.60, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-080000000007', 'a1111111-1111-4111-8111-111111111108', 7, 10, 3, 34.96, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-080000000008', 'a1111111-1111-4111-8111-111111111108', 8, 12, 3, 78.20, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-080000000009', 'a1111111-1111-4111-8111-111111111108', 9, 14, 3, 29.44, true, 25.32, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-08000000000a', 'a1111111-1111-4111-8111-111111111108', 10, 16, 3, 151.80, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-090000000001', 'a1111111-1111-4111-8111-111111111109', 1, 14, 3, 33.25, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-090000000002', 'a1111111-1111-4111-8111-111111111109', 2, 16, 3, 46.07, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-090000000003', 'a1111111-1111-4111-8111-111111111109', 3, 18, 3, 26.60, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-090000000004', 'a1111111-1111-4111-8111-111111111109', 4, 20, 3, 156.75, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-090000000005', 'a1111111-1111-4111-8111-111111111109', 5, 22, 3, 199.50, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-090000000006', 'a1111111-1111-4111-8111-111111111109', 6, 10, 3, 171.00, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-090000000007', 'a1111111-1111-4111-8111-111111111109', 7, 12, 3, 36.10, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-090000000008', 'a1111111-1111-4111-8111-111111111109', 8, 14, 3, 80.75, true, 69.44, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-090000000009', 'a1111111-1111-4111-8111-111111111109', 9, 16, 3, 30.40, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-09000000000a', 'a1111111-1111-4111-8111-111111111109', 10, 18, 3, 156.75, true, 134.81, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0a0000000001', 'a1111111-1111-4111-8111-111111111110', 1, 16, 3, 33.25, true, 28.59, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0a0000000002', 'a1111111-1111-4111-8111-111111111110', 2, 18, 3, 46.07, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0a0000000003', 'a1111111-1111-4111-8111-111111111110', 3, 20, 3, 26.60, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0a0000000004', 'a1111111-1111-4111-8111-111111111110', 4, 22, 3, 156.75, true, 134.81, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0a0000000005', 'a1111111-1111-4111-8111-111111111110', 5, 10, 3, 199.50, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0a0000000006', 'a1111111-1111-4111-8111-111111111110', 6, 12, 3, 171.00, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0a0000000007', 'a1111111-1111-4111-8111-111111111110', 7, 14, 3, 36.10, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0a0000000008', 'a1111111-1111-4111-8111-111111111110', 8, 16, 3, 80.75, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0a0000000009', 'a1111111-1111-4111-8111-111111111110', 9, 18, 3, 30.40, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0a000000000a', 'a1111111-1111-4111-8111-111111111110', 10, 20, 3, 156.75, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0b0000000001', 'a1111111-1111-4111-8111-111111111111', 1, 18, 3, 34.30, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0b0000000002', 'a1111111-1111-4111-8111-111111111111', 2, 20, 3, 47.53, true, 40.88, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0b0000000003', 'a1111111-1111-4111-8111-111111111111', 3, 22, 3, 27.44, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0b0000000004', 'a1111111-1111-4111-8111-111111111111', 4, 10, 3, 161.70, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0b0000000005', 'a1111111-1111-4111-8111-111111111111', 5, 12, 3, 205.80, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0b0000000006', 'a1111111-1111-4111-8111-111111111111', 6, 14, 3, 176.40, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0b0000000007', 'a1111111-1111-4111-8111-111111111111', 7, 16, 3, 37.24, true, 32.03, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0b0000000008', 'a1111111-1111-4111-8111-111111111111', 8, 18, 3, 83.30, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0b0000000009', 'a1111111-1111-4111-8111-111111111111', 9, 20, 3, 31.36, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0b000000000a', 'a1111111-1111-4111-8111-111111111111', 10, 22, 3, 161.70, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0c0000000001', 'a1111111-1111-4111-8111-111111111112', 1, 20, 3, 33.95, true, 29.20, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0c0000000002', 'a1111111-1111-4111-8111-111111111112', 2, 22, 3, 47.05, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0c0000000003', 'a1111111-1111-4111-8111-111111111112', 3, 10, 3, 27.16, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0c0000000004', 'a1111111-1111-4111-8111-111111111112', 4, 12, 3, 160.05, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0c0000000005', 'a1111111-1111-4111-8111-111111111112', 5, 14, 3, 203.70, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0c0000000006', 'a1111111-1111-4111-8111-111111111112', 6, 16, 3, 174.60, true, 150.16, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0c0000000007', 'a1111111-1111-4111-8111-111111111112', 7, 18, 3, 36.86, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0c0000000008', 'a1111111-1111-4111-8111-111111111112', 8, 20, 3, 82.45, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0c0000000009', 'a1111111-1111-4111-8111-111111111112', 9, 22, 3, 31.04, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0c000000000a', 'a1111111-1111-4111-8111-111111111112', 10, 10, 3, 160.05, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0d0000000001', 'a1111111-1111-4111-8111-111111111113', 1, 22, 3, 33.60, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0d0000000002', 'a1111111-1111-4111-8111-111111111113', 2, 10, 3, 46.56, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0d0000000003', 'a1111111-1111-4111-8111-111111111113', 3, 12, 3, 26.88, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0d0000000004', 'a1111111-1111-4111-8111-111111111113', 4, 14, 3, 158.40, true, 136.22, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0d0000000005', 'a1111111-1111-4111-8111-111111111113', 5, 16, 3, 201.60, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0d0000000006', 'a1111111-1111-4111-8111-111111111113', 6, 18, 3, 172.80, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0d0000000007', 'a1111111-1111-4111-8111-111111111113', 7, 20, 3, 36.48, true, 31.37, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0d0000000008', 'a1111111-1111-4111-8111-111111111113', 8, 22, 3, 81.60, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0d0000000009', 'a1111111-1111-4111-8111-111111111113', 9, 10, 3, 30.72, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0d000000000a', 'a1111111-1111-4111-8111-111111111113', 10, 12, 3, 158.40, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0e0000000001', 'a1111111-1111-4111-8111-111111111114', 1, 10, 3, 34.30, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0e0000000002', 'a1111111-1111-4111-8111-111111111114', 2, 12, 3, 47.53, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0e0000000003', 'a1111111-1111-4111-8111-111111111114', 3, 14, 3, 27.44, true, 23.60, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0e0000000004', 'a1111111-1111-4111-8111-111111111114', 4, 16, 3, 161.70, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0e0000000005', 'a1111111-1111-4111-8111-111111111114', 5, 18, 3, 205.80, true, 176.99, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0e0000000006', 'a1111111-1111-4111-8111-111111111114', 6, 20, 3, 176.40, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0e0000000007', 'a1111111-1111-4111-8111-111111111114', 7, 22, 3, 37.24, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0e0000000008', 'a1111111-1111-4111-8111-111111111114', 8, 10, 3, 83.30, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0e0000000009', 'a1111111-1111-4111-8111-111111111114', 9, 12, 3, 31.36, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0e000000000a', 'a1111111-1111-4111-8111-111111111114', 10, 14, 3, 161.70, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0f0000000001', 'a1111111-1111-4111-8111-111111111115', 1, 12, 3, 33.95, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0f0000000002', 'a1111111-1111-4111-8111-111111111115', 2, 14, 3, 47.05, true, 40.46, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0f0000000003', 'a1111111-1111-4111-8111-111111111115', 3, 16, 3, 27.16, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0f0000000004', 'a1111111-1111-4111-8111-111111111115', 4, 18, 3, 160.05, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0f0000000005', 'a1111111-1111-4111-8111-111111111115', 5, 20, 3, 203.70, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0f0000000006', 'a1111111-1111-4111-8111-111111111115', 6, 22, 3, 174.60, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0f0000000007', 'a1111111-1111-4111-8111-111111111115', 7, 10, 3, 36.86, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0f0000000008', 'a1111111-1111-4111-8111-111111111115', 8, 12, 3, 82.45, true, 70.91, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0f0000000009', 'a1111111-1111-4111-8111-111111111115', 9, 14, 3, 31.04, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-0f000000000a', 'a1111111-1111-4111-8111-111111111115', 10, 16, 3, 160.05, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-100000000001', 'a1111111-1111-4111-8111-111111111116', 1, 14, 3, 33.60, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-100000000002', 'a1111111-1111-4111-8111-111111111116', 2, 16, 3, 46.56, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-100000000003', 'a1111111-1111-4111-8111-111111111116', 3, 18, 3, 26.88, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-100000000004', 'a1111111-1111-4111-8111-111111111116', 4, 20, 3, 158.40, true, 136.22, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-100000000005', 'a1111111-1111-4111-8111-111111111116', 5, 22, 3, 201.60, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-100000000006', 'a1111111-1111-4111-8111-111111111116', 6, 10, 3, 172.80, true, 148.61, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-100000000007', 'a1111111-1111-4111-8111-111111111116', 7, 12, 3, 36.48, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-100000000008', 'a1111111-1111-4111-8111-111111111116', 8, 14, 3, 81.60, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-100000000009', 'a1111111-1111-4111-8111-111111111116', 9, 16, 3, 30.72, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-10000000000a', 'a1111111-1111-4111-8111-111111111116', 10, 18, 3, 158.40, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-110000000001', 'a1111111-1111-4111-8111-111111111117', 1, 16, 3, 33.25, true, 28.59, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-110000000002', 'a1111111-1111-4111-8111-111111111117', 2, 18, 3, 46.07, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-110000000003', 'a1111111-1111-4111-8111-111111111117', 3, 20, 3, 26.60, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-110000000004', 'a1111111-1111-4111-8111-111111111117', 4, 22, 3, 156.75, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-110000000005', 'a1111111-1111-4111-8111-111111111117', 5, 10, 3, 199.50, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-110000000006', 'a1111111-1111-4111-8111-111111111117', 6, 12, 3, 171.00, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-110000000007', 'a1111111-1111-4111-8111-111111111117', 7, 14, 3, 36.10, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-110000000008', 'a1111111-1111-4111-8111-111111111117', 8, 16, 3, 80.75, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-110000000009', 'a1111111-1111-4111-8111-111111111117', 9, 18, 3, 30.40, true, 26.14, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-11000000000a', 'a1111111-1111-4111-8111-111111111117', 10, 20, 3, 156.75, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-120000000001', 'a1111111-1111-4111-8111-111111111118', 1, 18, 3, 33.60, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-120000000002', 'a1111111-1111-4111-8111-111111111118', 2, 20, 3, 46.56, true, 40.04, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-120000000003', 'a1111111-1111-4111-8111-111111111118', 3, 22, 3, 26.88, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-120000000004', 'a1111111-1111-4111-8111-111111111118', 4, 10, 3, 158.40, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-120000000005', 'a1111111-1111-4111-8111-111111111118', 5, 12, 3, 201.60, true, 173.38, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-120000000006', 'a1111111-1111-4111-8111-111111111118', 6, 14, 3, 172.80, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-120000000007', 'a1111111-1111-4111-8111-111111111118', 7, 16, 3, 36.48, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-120000000008', 'a1111111-1111-4111-8111-111111111118', 8, 18, 3, 81.60, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-120000000009', 'a1111111-1111-4111-8111-111111111118', 9, 20, 3, 30.72, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-12000000000a', 'a1111111-1111-4111-8111-111111111118', 10, 22, 3, 158.40, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-130000000001', 'a1111111-1111-4111-8111-111111111119', 1, 20, 3, 33.95, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-130000000002', 'a1111111-1111-4111-8111-111111111119', 2, 22, 3, 47.05, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-130000000003', 'a1111111-1111-4111-8111-111111111119', 3, 10, 3, 27.16, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-130000000004', 'a1111111-1111-4111-8111-111111111119', 4, 12, 3, 160.05, true, 137.64, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-130000000005', 'a1111111-1111-4111-8111-111111111119', 5, 14, 3, 203.70, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-130000000006', 'a1111111-1111-4111-8111-111111111119', 6, 16, 3, 174.60, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-130000000007', 'a1111111-1111-4111-8111-111111111119', 7, 18, 3, 36.86, true, 31.70, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-130000000008', 'a1111111-1111-4111-8111-111111111119', 8, 20, 3, 82.45, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-130000000009', 'a1111111-1111-4111-8111-111111111119', 9, 22, 3, 31.04, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-13000000000a', 'a1111111-1111-4111-8111-111111111119', 10, 10, 3, 160.05, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-140000000001', 'a1111111-1111-4111-8111-111111111120', 1, 22, 3, 32.90, true, 28.29, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-140000000002', 'a1111111-1111-4111-8111-111111111120', 2, 10, 3, 45.59, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-140000000003', 'a1111111-1111-4111-8111-111111111120', 3, 12, 3, 26.32, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-140000000004', 'a1111111-1111-4111-8111-111111111120', 4, 14, 3, 155.10, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-140000000005', 'a1111111-1111-4111-8111-111111111120', 5, 16, 3, 197.40, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-140000000006', 'a1111111-1111-4111-8111-111111111120', 6, 18, 3, 169.20, true, 145.51, '2026-09-15', '2026-10-15', '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-140000000007', 'a1111111-1111-4111-8111-111111111120', 7, 20, 3, 35.72, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-140000000008', 'a1111111-1111-4111-8111-111111111120', 8, 22, 3, 79.90, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-140000000009', 'a1111111-1111-4111-8111-111111111120', 9, 10, 3, 30.08, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');
INSERT INTO public.estoque_loja VALUES ('c0000000-0000-4000-8000-14000000000a', 'a1111111-1111-4111-8111-111111111120', 10, 12, 3, 155.10, false, NULL, NULL, NULL, '2026-09-18 16:47:45.247391');





--
-- Data for Name: garagem_virtual; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.garagem_virtual VALUES ('58646842-6376-4903-878f-323973d90766', 'cf8828f2-1aa1-4534-844b-1899e5803a8c', 11, 2023, 'Fazer 250 de Viagem', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/YAMAHA_FZ-S.jpg/800px-YAMAHA_FZ-S.jpg');
INSERT INTO public.garagem_virtual VALUES ('e611f1da-cd4a-4c9c-80ea-5cdac07887a8', 'cf8828f2-1aa1-4534-844b-1899e5803a8c', 1, 2022, 'Titan 160 do Dia a Dia', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Honda_CG_150_Titan.jpg/800px-Honda_CG_150_Titan.jpg');





--
-- Data for Name: lojas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.lojas VALUES ('3c262f1f-fc16-4f8c-b78c-dc8b2e414327', '334e7d2b-26a3-4d29-b048-807ac9e0b646', 'Radar Motos & Peças Central', '12.345.678/0001-90', 'Av. Barão de Maruim, 500 - Centro, Aracaju - SE', -10.91670000, -37.05000000, '(79) 99988-7766', 'contato@radarmotosaracaju.com.br', '{"seg_sex": "08:00 - 18:00", "sab": "08:00 - 13:00"}', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600', '{https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=600}', true);
INSERT INTO public.lojas VALUES ('803b36f8-a433-4f85-ba75-0cfc13534110', '5dfadb41-6ebd-41c2-86f0-803991b5379a', 'MotoPower Peças & Oficina', '98.765.432/0001-10', 'Rua Mariano Salmeron, 250 - Siqueira Campos, Aracaju - SE', -10.92340000, -37.07210000, '(79) 98877-6655', 'vendas@motopower.com.br', '{"seg_sex": "07:30 - 18:00", "sab": "08:00 - 12:00"}', 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600', '{https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=600}', true);
INSERT INTO public.lojas VALUES ('a1111111-1111-4111-8111-111111111103', 'b1111111-1111-4111-8111-111111111103', 'J&C Motos e Peças', '09.345.120/0001-38', 'Rua Mariano Salmeron, 535 - Siqueira Campos, Aracaju - SE', -10.92480000, -37.07450000, '(79) 3241-8383', 'jcmotos@jcmotos.com.br', '{"seg_sex": "08:00 - 18:00", "sab": "08:00 - 12:30"}', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600', '{https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600}', true);
INSERT INTO public.lojas VALUES ('a1111111-1111-4111-8111-111111111104', 'b1111111-1111-4111-8111-111111111104', 'Ciclo Motos Peças', '16.789.231/0001-99', 'Rua Mariano Salmeron, 483 - Siqueira Campos, Aracaju - SE', -10.92420000, -37.07380000, '(79) 3241-7243', 'contato@ciclomotosaju.com.br', '{"seg_sex": "07:30 - 18:00", "sab": "08:00 - 13:00"}', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600', '{https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600}', true);
INSERT INTO public.lojas VALUES ('a1111111-1111-4111-8111-111111111105', 'b1111111-1111-4111-8111-111111111105', 'Itabaiana Motos Honda', '05.823.114/0001-45', 'Av. Dr. Luiz Magalhães, 1597 - Marianga, Itabaiana - SE', -10.68250000, -37.41900000, '(79) 3421-2000', 'contato@itabaianamotos.com.br', '{"seg_sex": "07:30 - 18:00", "sab": "08:00 - 12:30"}', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600', '{https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=600}', true);
INSERT INTO public.lojas VALUES ('a1111111-1111-4111-8111-111111111106', 'b1111111-1111-4111-8111-111111111106', 'Halley Moto Peças', '14.238.901/0001-82', 'Av. 28 de Agosto, 1724 - Marianga, Itabaiana - SE', -10.68400000, -37.42250000, '(79) 3431-1933', 'halley@halleymotopecas.com.br', '{"seg_sex": "07:30 - 18:00", "sab": "07:30 - 13:00"}', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600', '{https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=600}', true);
INSERT INTO public.lojas VALUES ('a1111111-1111-4111-8111-111111111107', 'b1111111-1111-4111-8111-111111111107', 'Osias Moto Peças', '08.451.239/0001-63', 'Rua Percílio Andrade, 2021 - Bananeiras, Itabaiana - SE', -10.68720000, -37.42700000, '(79) 3431-1852', 'osias@osiasmotopecas.com.br', '{"seg_sex": "08:00 - 18:00", "sab": "08:00 - 13:00"}', 'https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=600', '{https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600}', true);
INSERT INTO public.lojas VALUES ('a1111111-1111-4111-8111-111111111108', 'b1111111-1111-4111-8111-111111111108', 'Joya Moto Peças', '13.912.445/0001-20', 'Rua Marechal Deodoro da Fonseca, 711 - Mamede Paes Mendonça, Itabaiana - SE', -10.68900000, -37.42850000, '(79) 99873-3737', 'vendas@joyamotopecas.com.br', '{"seg_sex": "07:30 - 17:30", "sab": "07:30 - 12:00"}', 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600', '{https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600}', true);
INSERT INTO public.lojas VALUES ('a1111111-1111-4111-8111-111111111109', 'b1111111-1111-4111-8111-111111111109', 'Motopeças Rafael Luz', '22.115.890/0001-33', 'Rua Percílio Andrade, 1898 - Centro, Itabaiana - SE', -10.68650000, -37.42550000, '(79) 99984-4950', 'rafael@rafaelluzmotopecas.com.br', '{"seg_sex": "08:00 - 18:00", "sab": "08:00 - 12:00"}', 'https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=600', '{https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600}', true);
INSERT INTO public.lojas VALUES ('a1111111-1111-4111-8111-111111111110', 'b1111111-1111-4111-8111-111111111110', 'Luís Moto Peças', '19.340.582/0001-77', 'Rua José Paulo Santana, 636 - Centro, Itabaiana - SE', -10.68550000, -37.42400000, '(79) 99912-3489', 'luismotopecas@gmail.com', '{"seg_sex": "07:30 - 18:00", "sab": "07:30 - 13:00"}', 'https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=600', '{https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=600}', true);
INSERT INTO public.lojas VALUES ('a1111111-1111-4111-8111-111111111111', 'b1111111-1111-4111-8111-111111111111', 'Marcelo Moto Peças', '27.810.450/0001-12', 'Rua Nova Brasília, s/n - Centro, Malhador - SE', -10.65720000, -37.30350000, '(79) 99646-8837', 'marcelo@marcelomotopecas.com.br', '{"seg_sex": "07:30 - 17:30", "sab": "07:30 - 12:00"}', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600', '{https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600}', true);
INSERT INTO public.lojas VALUES ('a1111111-1111-4111-8111-111111111112', 'b1111111-1111-4111-8111-111111111112', 'Tadeu Moto Peças', '15.670.392/0001-88', 'Av. Dr. Carlos Firpo, 28 - Centro, Ribeirópolis - SE', -10.54000000, -37.41750000, '(79) 99943-5063', 'tadeu@tadeumotopecas.com.br', '{"seg_sex": "07:30 - 17:30", "sab": "07:30 - 12:00"}', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600', '{https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=600}', true);
INSERT INTO public.lojas VALUES ('a1111111-1111-4111-8111-111111111113', 'b1111111-1111-4111-8111-111111111113', 'Motopeças Marcos Souza', '31.420.781/0001-05', 'Avenida da Paz, 95 - Centro, Ribeirópolis - SE', -10.53850000, -37.41600000, '(79) 99662-8115', 'marcos@marcossouzamotos.com.br', '{"seg_sex": "08:00 - 18:00", "sab": "08:00 - 12:00"}', 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600', '{https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=600}', true);
INSERT INTO public.lojas VALUES ('a1111111-1111-4111-8111-111111111114', 'b1111111-1111-4111-8111-111111111114', 'Yuri Moto Peças', '28.514.890/0001-94', 'Rua Nossa Senhora de Lourdes, s/n - Centro, Moita Bonita - SE', -10.57750000, -37.34280000, '(79) 99890-6318', 'yuri@yurimotopecas.com.br', '{"seg_sex": "07:30 - 17:30", "sab": "07:30 - 12:00"}', 'https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=600', '{https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600}', true);
INSERT INTO public.lojas VALUES ('a1111111-1111-4111-8111-111111111115', 'b1111111-1111-4111-8111-111111111115', 'Nenê Moto Peças', '33.621.198/0001-41', 'Rua Ernesto Geisel, 190 - Centro, Moita Bonita - SE', -10.57600000, -37.34150000, '(79) 99812-7744', 'nene@nenemotopecas.com.br', '{"seg_sex": "08:00 - 18:00", "sab": "08:00 - 12:30"}', 'https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=600', '{https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600}', true);
INSERT INTO public.lojas VALUES ('a1111111-1111-4111-8111-111111111116', 'b1111111-1111-4111-8111-111111111116', 'Moto Peças Britense', '07.214.568/0001-70', 'Rodovia João Paulo II, 117 - Centro, Campo do Brito - SE', -10.73070000, -37.49480000, '(79) 99905-0830', 'britense@britensemotopecas.com.br', '{"seg_sex": "07:30 - 18:00", "sab": "07:30 - 12:30"}', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600', '{https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600}', true);
INSERT INTO public.lojas VALUES ('a1111111-1111-4111-8111-111111111117', 'b1111111-1111-4111-8111-111111111117', 'Oficina & Peças Victor Santos', '35.120.932/0001-22', 'Rua Pedro Francisco de Jesus, 372 - Centro, Campo do Brito - SE', -10.73200000, -37.49600000, '(79) 99999-0053', 'victor@victorsantosmotos.com.br', '{"seg_sex": "08:00 - 18:00", "sab": "08:00 - 13:00"}', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600', '{https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=600}', true);
INSERT INTO public.lojas VALUES ('a1111111-1111-4111-8111-111111111118', 'b1111111-1111-4111-8111-111111111118', 'Geral Moto Peças', '04.912.834/0001-65', 'Rua Quintino Bocaiúva, 34 - Centro, Lagarto - SE', -10.91450000, -37.66390000, '(79) 3631-2943', 'contato@geralmotopecas.com.br', '{"seg_sex": "07:30 - 18:00", "sab": "08:00 - 12:00"}', 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600', '{https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600}', true);
INSERT INTO public.lojas VALUES ('a1111111-1111-4111-8111-111111111119', 'b1111111-1111-4111-8111-111111111119', 'Neto Motos', '18.239.012/0001-56', 'Avenida Contorno, 3111 - Novo Horizonte, Lagarto - SE', -10.91900000, -37.66100000, '(79) 99961-1077', 'neto@netomotos.com.br', '{"seg_sex": "07:30 - 18:00", "sab": "07:30 - 12:30"}', 'https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=600', '{https://images.unsplash.com/photo-1558981359-219d6364c9c8?w=600}', true);
INSERT INTO public.lojas VALUES ('a1111111-1111-4111-8111-111111111120', 'b1111111-1111-4111-8111-111111111120', 'Pimentinha Moto Peças', '21.670.432/0001-83', 'Rua Filadelfo Dórea, 278 - Centro, Lagarto - SE', -10.91300000, -37.66550000, '(79) 99869-6786', 'pimentinha@pimentinhamotopecas.com.br', '{"seg_sex": "08:00 - 18:00", "sab": "08:00 - 13:00"}', 'https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=600', '{https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600}', true);





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

INSERT INTO public.pecas VALUES (1, 'VELA-NGK-CPR8EA9', '7897707504268', 'Vela de Ignição NGK CPR8EA-9', 'Vela de ignição padrão resistiva NGK para motores monocilíndricos.', 'Ignição', 'https://http2.mlstatic.com/D_NQ_NP_876209-MLB108040626802_032026-O.webp', '{"rosca": "10mm", "eletrodo": "Níquel", "grau_termico": "8"}');
INSERT INTO public.pecas VALUES (2, 'PAST-COBREQ-N917', '7892679091702', 'Pastilha de Freio Dianteira Cobreq Street N-917', 'Pastilha orgânica para disco dianteiro, alta durabilidade e frenagem precisa.', 'Freios', 'https://karhub-images.karhub.com.br/234957-pastilha-de-freio-dianteira-1726498351871.jpeg', '{"linha": "Street", "posicao": "Dianteira", "material": "Orgânica"}');
INSERT INTO public.pecas VALUES (3, 'FILT-OLEO-FRAM-CH6015', '7896489311024', 'Filtro de Óleo Fram CH6015', 'Filtro de óleo de alta retenção de impurezas para proteção do motor.', 'Filtros', 'https://fortnine.ca/media/catalog/product/cache/dd4850ad4231b6306bceadf38a0bbeed/catalogimages/fram/extra-guard-oil-filter-cartridge-ch6015.jpg', '{"tipo": "Refil interno", "meio_filtrante": "Celulose microfibra"}');
INSERT INTO public.pecas VALUES (4, 'KIT-VAZ-CG160-RET', '7891234567890', 'Kit Relação Transmissão Vaz com Retentor Aço 1045', 'Kit completo de transmissão (coroa, pinhão e corrente com o-ring retentor).', 'Transmissão', 'https://http2.mlstatic.com/D_NQ_NP_2X_881930-MLU75562498498_042024-F.webp', '{"aco": "1045", "coroa": "44D", "pinhao": "15D", "corrente": "428HO-118L com retentor"}');
INSERT INTO public.pecas VALUES (5, 'PNEU-PIRELLI-CITY-9090', '7898523697412', 'Pneu Traseiro Pirelli City Dragon 90/90-18 57P TT', 'Pneu para uso urbano com excelente rendimento quilométrico e aderência no molhado.', 'Pneus', 'https://tyre-images.pirelli.com/MKTData/MOTO/files/2094/mototopimage/pirelli_moto_city_dragon_base_1_992x992.png', '{"medida": "90/90-18", "posicao": "Traseiro", "indice_vel": "P (150 km/h)", "indice_carga": "57 (230 kg)"}');
INSERT INTO public.pecas VALUES (6, 'BAT-HELIAR-HTZ6L', '7891472583690', 'Bateria Selada Heliar 12V 5Ah HTZ6L AGM', 'Bateria livre de manutenção com tecnologia AGM e alta corrente de partida.', 'Elétrica', 'https://http2.mlstatic.com/D_NQ_NP_2X_871209-MLU72521367498_102023-F.webp', '{"cca": "50A", "tensao": "12V", "capacidade": "5Ah", "tecnologia": "AGM / VRLA"}');
INSERT INTO public.pecas VALUES (7, 'OLEO-MOBIL-10W30-4T', '7896541230987', 'Óleo de Motor Mobil Super Moto 4T 10W-30 Semissintético 1L', 'Lubrificante semissintético de alta performance atendendo API SL e JASO MA2.', 'Lubrificantes', 'https://cdn.awsli.com.br/600x450/877/877231/produto/221477213/mobil-4t-10w30-3egdm9prtu.png', '{"base": "Semissintético", "normas": "API SL / JASO MA2", "volume": "1 Litro", "viscosidade": "10W-30"}');
INSERT INTO public.pecas VALUES (8, 'LAMP-LED-PHILIPS-H4', '7894561237895', 'Lâmpada de Farol H4 LED Philips Ultinon Moto 6000K', 'Lâmpada LED automotiva de feixe concentrado sem ofuscamento e luz branca pura.', 'Iluminação', 'https://fortbras.vteximg.com.br/arquivos/ids/318302/lampada-philips-ultinon-led-moto-luz-branca-hs1-h4-12v-9w-6000k-farol-11458umx1-hipervarejo-1.jpg', '{"encaixe": "H4", "potencia": "12W", "durabilidade": "1500h", "temperatura_cor": "6000K"}');
INSERT INTO public.pecas VALUES (9, 'CABO-EMB-MOTOBOR-CG160', '7893214569871', 'Cabo de Embreagem Reforçado Motobor CG 160', 'Cabo de embreagem com teflon interno de acionamento ultra macio e resistente.', 'Cabos & Comandos', 'https://www.motokart.com.br/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/c/a/cabo_embreagem_titan_fan_start_160_1_2.jpg', '{"garantia": "6 meses", "comprimento": "105cm", "revestimento": "Teflon"}');
INSERT INTO public.pecas VALUES (10, 'CORREIA-GATES-NMAX', '7896547893215', 'Correia de Transmissão CVT Gates Powerlink NMAX 160', 'Correia dentada de alta durabilidade e dissipação térmica para scooter.', 'Transmissão', 'https://http2.mlstatic.com/D_NQ_NP_2X_938589-MLU74021834718_012024-F.webp', '{"perfil": "CVT", "scooter": "NMAX 160", "material": "EPDM com cordonéis de aramida"}');


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.usuarios VALUES ('cf8828f2-1aa1-4534-844b-1899e5803a8c', 'Lucas Oliveira (Motociclista)', 'motociclista@radarpecas.com.br', '$2a$11$VMHMFi5h2oR7r/CDc2YIWuie2HJ367Mw5MEnpFA6O3vpywEqeswS2', 'MOTOCICLISTA', '2026-09-18 16:47:45.109604');
INSERT INTO public.usuarios VALUES ('334e7d2b-26a3-4d29-b048-807ac9e0b646', 'Carlos Alberto (Lojista)', 'lojista@gmail.com', '$2a$11$RgiWZdyVoPRNbaAr/1oCROuHOeGlE523H/Pi7p3hd9f2HitZYvCqO', 'LOJISTA', '2026-09-18 16:47:44.716343');
INSERT INTO public.usuarios VALUES ('5dfadb41-6ebd-41c2-86f0-803991b5379a', 'Mariana Costa (Lojista)', 'mariana@gmail.com', '$2a$11$RgiWZdyVoPRNbaAr/1oCROuHOeGlE523H/Pi7p3hd9f2HitZYvCqO', 'LOJISTA', '2026-09-18 16:47:44.716343');
INSERT INTO public.usuarios VALUES ('b1111111-1111-4111-8111-111111111103', 'Jorge Cavalcante (Lojista)', 'jorge@jcmotos.com.br', '$2a$11$RgiWZdyVoPRNbaAr/1oCROuHOeGlE523H/Pi7p3hd9f2HitZYvCqO', 'LOJISTA', '2026-09-18 16:47:44.716343');
INSERT INTO public.usuarios VALUES ('b1111111-1111-4111-8111-111111111104', 'Gilvan Matos (Lojista)', 'gilvan@ciclomotosaju.com.br', '$2a$11$RgiWZdyVoPRNbaAr/1oCROuHOeGlE523H/Pi7p3hd9f2HitZYvCqO', 'LOJISTA', '2026-09-18 16:47:44.716343');
INSERT INTO public.usuarios VALUES ('b1111111-1111-4111-8111-111111111105', 'Everton Lima (Lojista)', 'everton@itabaianamotos.com.br', '$2a$11$RgiWZdyVoPRNbaAr/1oCROuHOeGlE523H/Pi7p3hd9f2HitZYvCqO', 'LOJISTA', '2026-09-18 16:47:44.716343');
INSERT INTO public.usuarios VALUES ('b1111111-1111-4111-8111-111111111106', 'Halley Santos (Lojista)', 'halley@halleymotopecas.com.br', '$2a$11$RgiWZdyVoPRNbaAr/1oCROuHOeGlE523H/Pi7p3hd9f2HitZYvCqO', 'LOJISTA', '2026-09-18 16:47:44.716343');
INSERT INTO public.usuarios VALUES ('b1111111-1111-4111-8111-111111111107', 'Osias Mendonça (Lojista)', 'osias@osiasmotopecas.com.br', '$2a$11$RgiWZdyVoPRNbaAr/1oCROuHOeGlE523H/Pi7p3hd9f2HitZYvCqO', 'LOJISTA', '2026-09-18 16:47:44.716343');
INSERT INTO public.usuarios VALUES ('b1111111-1111-4111-8111-111111111108', 'Marcos Joya (Lojista)', 'marcos@joyamotopecas.com.br', '$2a$11$RgiWZdyVoPRNbaAr/1oCROuHOeGlE523H/Pi7p3hd9f2HitZYvCqO', 'LOJISTA', '2026-09-18 16:47:44.716343');
INSERT INTO public.usuarios VALUES ('b1111111-1111-4111-8111-111111111109', 'Rafael Luz (Lojista)', 'rafael@rafaelluzmotopecas.com.br', '$2a$11$RgiWZdyVoPRNbaAr/1oCROuHOeGlE523H/Pi7p3hd9f2HitZYvCqO', 'LOJISTA', '2026-09-18 16:47:44.716343');
INSERT INTO public.usuarios VALUES ('b1111111-1111-4111-8111-111111111110', 'Luís Fernando (Lojista)', 'luis@luismotopecas.com.br', '$2a$11$RgiWZdyVoPRNbaAr/1oCROuHOeGlE523H/Pi7p3hd9f2HitZYvCqO', 'LOJISTA', '2026-09-18 16:47:44.716343');
INSERT INTO public.usuarios VALUES ('b1111111-1111-4111-8111-111111111111', 'Marcelo Santos (Lojista)', 'marcelo@marcelomotopecas.com.br', '$2a$11$RgiWZdyVoPRNbaAr/1oCROuHOeGlE523H/Pi7p3hd9f2HitZYvCqO', 'LOJISTA', '2026-09-18 16:47:44.716343');
INSERT INTO public.usuarios VALUES ('b1111111-1111-4111-8111-111111111112', 'Tadeu Teixeira (Lojista)', 'tadeu@tadeumotopecas.com.br', '$2a$11$RgiWZdyVoPRNbaAr/1oCROuHOeGlE523H/Pi7p3hd9f2HitZYvCqO', 'LOJISTA', '2026-09-18 16:47:44.716343');
INSERT INTO public.usuarios VALUES ('b1111111-1111-4111-8111-111111111113', 'Marcos Souza (Lojista)', 'marcos@marcossouzamotos.com.br', '$2a$11$RgiWZdyVoPRNbaAr/1oCROuHOeGlE523H/Pi7p3hd9f2HitZYvCqO', 'LOJISTA', '2026-09-18 16:47:44.716343');
INSERT INTO public.usuarios VALUES ('b1111111-1111-4111-8111-111111111114', 'Yuri Santana (Lojista)', 'yuri@yurimotopecas.com.br', '$2a$11$RgiWZdyVoPRNbaAr/1oCROuHOeGlE523H/Pi7p3hd9f2HitZYvCqO', 'LOJISTA', '2026-09-18 16:47:44.716343');
INSERT INTO public.usuarios VALUES ('b1111111-1111-4111-8111-111111111115', 'José Carlos Nenê (Lojista)', 'nene@nenemotopecas.com.br', '$2a$11$RgiWZdyVoPRNbaAr/1oCROuHOeGlE523H/Pi7p3hd9f2HitZYvCqO', 'LOJISTA', '2026-09-18 16:47:44.716343');
INSERT INTO public.usuarios VALUES ('b1111111-1111-4111-8111-111111111116', 'Claudemir Britense (Lojista)', 'britense@britensemotopecas.com.br', '$2a$11$RgiWZdyVoPRNbaAr/1oCROuHOeGlE523H/Pi7p3hd9f2HitZYvCqO', 'LOJISTA', '2026-09-18 16:47:44.716343');
INSERT INTO public.usuarios VALUES ('b1111111-1111-4111-8111-111111111117', 'Victor Santos (Lojista)', 'victor@victorsantosmotos.com.br', '$2a$11$RgiWZdyVoPRNbaAr/1oCROuHOeGlE523H/Pi7p3hd9f2HitZYvCqO', 'LOJISTA', '2026-09-18 16:47:44.716343');
INSERT INTO public.usuarios VALUES ('b1111111-1111-4111-8111-111111111118', 'Geraldo Andrade (Lojista)', 'geraldo@geralmotopecas.com.br', '$2a$11$RgiWZdyVoPRNbaAr/1oCROuHOeGlE523H/Pi7p3hd9f2HitZYvCqO', 'LOJISTA', '2026-09-18 16:47:44.716343');
INSERT INTO public.usuarios VALUES ('b1111111-1111-4111-8111-111111111119', 'José Neto (Lojista)', 'neto@netomotos.com.br', '$2a$11$RgiWZdyVoPRNbaAr/1oCROuHOeGlE523H/Pi7p3hd9f2HitZYvCqO', 'LOJISTA', '2026-09-18 16:47:44.716343');
INSERT INTO public.usuarios VALUES ('b1111111-1111-4111-8111-111111111120', 'Márcio Pimentinha (Lojista)', 'marcio@pimentinhamotopecas.com.br', '$2a$11$RgiWZdyVoPRNbaAr/1oCROuHOeGlE523H/Pi7p3hd9f2HitZYvCqO', 'LOJISTA', '2026-09-18 16:47:44.716343');





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

