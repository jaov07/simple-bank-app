-- Migration para bancos criados antes do saque:
--   - adiciona 'saque' ao ENUM de transacoes.tipo
--
-- Execute uma única vez:
--   mysql -u <usuario> -p simplebank < database/migrations/002_add_saque.sql

ALTER TABLE transacoes
    MODIFY tipo ENUM('deposito', 'transferencia_enviada', 'transferencia_recebida', 'saque') NOT NULL;
