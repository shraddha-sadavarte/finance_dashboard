//loads all environment variables from .env and exports them in one place
import dotenv from 'dotenv';

dotenv.config();

const env = {
    port: process.env.PORT || 3000,
    db: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        name: process.env.DB_NAME,

    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    nodeEnv: process.env.NODE_ENV || 'development',
}

//validate required variables 
const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET']

for(const key of required){
    if(!process.env[key]){
        console.error(`Missing required environment variable: ${key}`)
        process.exit(1)
    }
}

export default env;