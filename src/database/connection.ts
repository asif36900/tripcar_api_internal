import { Sequelize } from "sequelize-typescript";
import dotenv from 'dotenv';

dotenv.config();

const environment = process.env.ENVIRONMENT
let sequelize: any;

if (environment === 'dev') {
    console.log("Starting Localhost");
    
    sequelize = new Sequelize({
        database: process.env.DB_NAME,
        dialect: 'postgres',
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
        logging: false,
        models: [__dirname + '/models']
    });
} else {
    sequelize = new Sequelize({
        database: process.env.POSTGRES_DATABASE,
        dialect: 'postgres',
        dialectModule: require('pg'),
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        host: process.env.POSTGRES_HOST,
        port: 41036,
        logging: false,
        models: [__dirname + '/models'],
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
                // rejectUnauthorized: 'production',
            },
        },
        define: {
            schema: 'public',
        },
        pool: {
            max: 5,
            idle: 10000,
            acquire: 30000,
        },
    });
}

const dbSync = async () => {
    try {
        await sequelize.sync();
        return { success: true };
    } catch (error) {
        throw error;
    }
};
dbSync()
    .then(res => {
        console.log(`DB sync with status: ${res.success}`);
    })
    .catch(err => {
        console.log("Failed to sync DB: ", err);
    });

export { dbSync };

export default sequelize;