import mysql from 'mysql2/promise'

const conexao = mysql.createPool({
    host: process.env.DBHOST,
    port: process.env.DBPORT,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    database: process.env.DATABASENAME
})

export default conexao