// Erros de aplicação com status HTTP explícito.
export class ErroHttp extends Error {
    constructor(status, codigo, mensagem) {
        super(mensagem);
        this.name = 'ErroHttp';
        this.status = status;
        this.codigo = codigo;
    }
}

// Erros de regra de negócio lançados pela camada de dados.
// O mapeamento para HTTP fica em um único lugar (DOMINIO_PARA_HTTP).
export class ErroDominio extends Error {
    constructor(codigo) {
        super(codigo);
        this.name = 'ErroDominio';
        this.codigo = codigo;
    }
}

export const DOMINIO_PARA_HTTP = {
    CONTA_NAO_ENCONTRADA: {
        status: 404,
        mensagem: 'Conta não encontrada'
    },
    SALDO_INSUFICIENTE: {
        status: 400,
        mensagem: 'Saldo insuficiente'
    },
    TRANSFERENCIA_PARA_SI_MESMO: {
        status: 400,
        mensagem: 'Não é possível transferir para si mesmo'
    }
};
