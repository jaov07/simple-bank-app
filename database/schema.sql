-- Schema do SimpleBank (MySQL 8+)
--
-- 1. Crie o banco (ajuste o nome se necessário):
--      CREATE DATABASE simplebank CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- 2. Selecione o banco:
--      USE simplebank;
-- 3. Execute este arquivo:
--      mysql -u <usuario> -p simplebank < database/schema.sql

CREATE TABLE IF NOT EXISTS usuarios (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contas (
    id INT NOT NULL AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    saldo DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    criada_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY usuario_id (usuario_id),
    CONSTRAINT fk_contas_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        ON DELETE CASCADE,
    CONSTRAINT chk_contas_saldo CHECK (saldo >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS transacoes (
    id INT NOT NULL AUTO_INCREMENT,
    conta_id INT NOT NULL,
    tipo ENUM('deposito', 'transferencia_enviada', 'transferencia_recebida', 'saque') NOT NULL,
    valor DECIMAL(15,2) NOT NULL,
    conta_relacionada_id INT DEFAULT NULL,
    criada_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY conta_id (conta_id),
    KEY conta_relacionada_id (conta_relacionada_id),
    CONSTRAINT fk_transacoes_conta
        FOREIGN KEY (conta_id) REFERENCES contas (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_transacoes_conta_relacionada
        FOREIGN KEY (conta_relacionada_id) REFERENCES contas (id)
        ON DELETE SET NULL,
    CONSTRAINT chk_transacoes_valor CHECK (valor > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
