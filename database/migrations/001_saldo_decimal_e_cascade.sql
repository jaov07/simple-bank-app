-- Migration para bancos criados com o schema antigo:
--   - saldo/valor passam de BIGINT para DECIMAL(15,2), permitindo centavos
--   - FKs de contas/transacoes passam a usar ON DELETE CASCADE / SET NULL
--
-- Execute uma única vez:
--   mysql -u <usuario> -p simplebank < database/migrations/001_saldo_decimal_e_cascade.sql

ALTER TABLE contas
    MODIFY saldo DECIMAL(15,2) NOT NULL DEFAULT 0.00;

ALTER TABLE transacoes
    MODIFY valor DECIMAL(15,2) NOT NULL;

ALTER TABLE contas
    DROP FOREIGN KEY contas_ibfk_1,
    ADD CONSTRAINT fk_contas_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        ON DELETE CASCADE;

ALTER TABLE transacoes
    DROP FOREIGN KEY transacoes_ibfk_1,
    DROP FOREIGN KEY transacoes_ibfk_2,
    ADD CONSTRAINT fk_transacoes_conta
        FOREIGN KEY (conta_id) REFERENCES contas (id)
        ON DELETE CASCADE,
    ADD CONSTRAINT fk_transacoes_conta_relacionada
        FOREIGN KEY (conta_relacionada_id) REFERENCES contas (id)
        ON DELETE SET NULL;
