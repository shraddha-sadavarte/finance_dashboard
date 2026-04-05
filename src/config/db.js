//creates mysql connection pool and exports it.
//instead of opening and closing a new connection for each query, we can reuse connections from the pool which improves performance and resource management.
import mysql from 'mysql2/promise';
import env from './env.js'

const pool = mysql.createPool({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.name,
    waitForConnections: true,
    connectionLimit: 10, //maximum number of connections in the pool
    queueLimit: 0, //unlimited queueing for connection requests
    timezone: 'Z', //store dates in UTC
})
//test connection
const testConnection = async () => {
    try{
        const connection = await pool.getConnection();
        console.log('Database connection successful');
        connection.release(); //release connection back to the pool
    } catch (error) {
        console.error('Error connecting to database:', error);
        process.exit(1); //exit the application if connection fails
    }
};

export { pool, testConnection };