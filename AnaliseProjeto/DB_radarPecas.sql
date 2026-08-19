
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