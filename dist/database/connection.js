"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbSync = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const environment = process.env.ENVIRONMENT;
let sequelize;
if (environment === 'dev') {
    console.log("Starting Localhost");
    sequelize = new sequelize_typescript_1.Sequelize({
        database: process.env.DB_NAME,
        dialect: 'postgres',
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
        logging: false,
        models: [__dirname + '/models']
    });
}
else {
    sequelize = new sequelize_typescript_1.Sequelize({
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
const dbSync = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield sequelize.sync();
        return { success: true };
    }
    catch (error) {
        throw error;
    }
});
exports.dbSync = dbSync;
dbSync()
    .then(res => {
    console.log(`DB sync with status: ${res.success}`);
})
    .catch(err => {
    console.log("Failed to sync DB: ", err);
});
exports.default = sequelize;
