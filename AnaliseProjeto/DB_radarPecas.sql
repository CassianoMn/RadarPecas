
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(20) CHECK (tipo_usuario IN ('MOTOCICLISTA', 'LOJISTA')),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lojas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    nome_fantasia VARCHAR(150) NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    endereco_completo TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    telefone_contato VARCHAR(20), 
    email_contato VARCHAR(150), 
    horarios_funcionamento JSONB, 
    foto_perfil_url TEXT, 
    galeria_fotos_urls TEXT[], 
    ativa BOOLEAN DEFAULT TRUE
);


CREATE TABLE modelos_moto (
    id SERIAL PRIMARY KEY,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    ano_inicio INTEGER,
    ano_fim INTEGER
);

CREATE TABLE garagem_virtual (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    modelo_moto_id INTEGER REFERENCES modelos_moto(id) ON DELETE RESTRICT,
    ano_fabricacao INTEGER NOT NULL,
    apelido VARCHAR(50),
    foto_moto_url TEXT 
);


CREATE TABLE pecas (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE, 
    codigo_ean VARCHAR(13) UNIQUE,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT, 
    categoria VARCHAR(50) NOT NULL,
    foto_peca_url TEXT, -- Novo campo
    especificacoes JSONB 
);


CREATE TABLE compatibilidade_peca_moto (
    peca_id INTEGER REFERENCES pecas(id) ON DELETE CASCADE,
    modelo_moto_id INTEGER REFERENCES modelos_moto(id) ON DELETE CASCADE,
    PRIMARY KEY (peca_id, modelo_moto_id)
);

CREATE TABLE estoque_loja (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loja_id UUID REFERENCES lojas(id) ON DELETE CASCADE,
    peca_id INTEGER REFERENCES pecas(id) ON DELETE RESTRICT,
    quantidade_estoque INTEGER DEFAULT 0, 
    alerta_estoque_minimo INTEGER DEFAULT 5, 
    preco_venda DECIMAL(10, 2) NOT NULL,
    em_promocao BOOLEAN DEFAULT FALSE,
    preco_promocional DECIMAL(10, 2),
    data_inicio_promocao DATE, 
    data_fim_promocao DATE, 
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE avaliacoes_loja (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loja_id UUID REFERENCES lojas(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE, 
    nota INTEGER CHECK (nota >= 1 AND nota <= 5) NOT NULL,
    comentario TEXT,
    recomenda BOOLEAN NOT NULL,
    data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE estatisticas_oferta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estoque_loja_id UUID REFERENCES estoque_loja(id) ON DELETE CASCADE,
    visualizacoes INTEGER DEFAULT 0,
    cliques INTEGER DEFAULT 0,
    data_registro DATE DEFAULT CURRENT_DATE,
    UNIQUE(estoque_loja_id, data_registro) 
);

-- Índices para performance de busca, filtros e agregações
CREATE INDEX IF NOT EXISTS idx_lojas_ativa_coords ON lojas (ativa, latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_estoque_loja_loja_qtd ON estoque_loja (loja_id, quantidade_estoque);
CREATE INDEX IF NOT EXISTS idx_estoque_loja_peca ON estoque_loja (peca_id);
CREATE INDEX IF NOT EXISTS idx_estoque_loja_promo ON estoque_loja (em_promocao, data_inicio_promocao, data_fim_promocao);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_loja_id ON avaliacoes_loja (loja_id);
CREATE INDEX IF NOT EXISTS idx_estatisticas_oferta_lookup ON estatisticas_oferta (estoque_loja_id, data_registro);
CREATE INDEX IF NOT EXISTS idx_pecas_categoria_lower ON pecas (lower(categoria));
CREATE INDEX IF NOT EXISTS idx_garagem_usuario ON garagem_virtual (usuario_id);

-- Índices trigram (GIN) para acelerar buscas textuais via ILIKE
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_pecas_nome_trgm ON pecas USING gin (nome gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_pecas_descricao_trgm ON pecas USING gin (descricao gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_pecas_sku_trgm ON pecas USING gin (sku gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_pecas_categoria_trgm ON pecas USING gin (categoria gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_lojas_nome_trgm ON lojas USING gin (nome_fantasia gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_modelos_moto_marca_trgm ON modelos_moto USING gin (marca gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_modelos_moto_modelo_trgm ON modelos_moto USING gin (modelo gin_trgm_ops);