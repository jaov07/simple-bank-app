import { prepararBanco } from '../database/preparar.js';

const argumentos = new Set(process.argv.slice(2));

const principal = async () => {
    const recriar = argumentos.has('--recriar');
    const baseline = argumentos.has('--baseline');

    if (recriar) {
        console.log('Recriando o banco (todos os dados serão apagados)...');
    }

    const resultado = await prepararBanco({ recriar, baseline });

    if (resultado.modo === 'criado') {
        console.log(`Banco "${resultado.banco}" criado a partir de database/schema.sql.`);
        console.log('Migrations existentes marcadas como aplicadas (o schema já as reflete).');
    } else if (resultado.modo === 'baseline') {
        console.log(`Baseline registrado no banco "${resultado.banco}". Nenhuma migration foi executada.`);
    } else if (resultado.aplicadas.length === 0) {
        console.log(`Banco "${resultado.banco}" já está atualizado.`);
    } else {
        console.log(`Banco "${resultado.banco}" atualizado. Migrations aplicadas:`);
        resultado.aplicadas.forEach((nome) => console.log(`- ${nome}`));
    }
};

principal().catch((erro) => {
    console.error(erro.message);
    process.exitCode = 1;
});
