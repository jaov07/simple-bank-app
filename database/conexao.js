import 'dotenv/config';
import mysql from 'mysql2/promise'

const conexao = mysql.createPool({
    host: process.env.DBHOST,
    port: Number(process.env.DBPORT),
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    database: process.env.DATABASENAME,
    decimalNumbers: true,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

export default conexao;
