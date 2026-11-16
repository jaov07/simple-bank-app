
const formatar = (nivel, mensagem, contexto) =>
    JSON.stringify({
        nivel,
        momento: new Date().toISOString(),
        mensagem,
        ...contexto
    });

export const logger = {
    info: (mensagem, contexto) => console.log(formatar('info', mensagem, contexto)),
    aviso: (mensagem, contexto) => console.warn(formatar('aviso', mensagem, contexto)),
    erro: (mensagem, contexto) => console.error(formatar('erro', mensagem, contexto))
};
