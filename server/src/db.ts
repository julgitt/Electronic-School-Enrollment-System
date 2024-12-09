import pgPromise, {ITask} from 'pg-promise';
import dotenv from 'dotenv';

dotenv.config();

const pgp = pgPromise({
    receive(e) {
        camelizeColumns(e.data);
    }
});

function camelizeColumns(data: any[]) {
    const tmp = data[0];
    for (const prop in tmp) {
        const camel = pgp.utils.camelize(prop);
        if (!(camel in tmp)) {
            for (let i = 0; i < data.length; i++) {
                const d = data[i];
                d[camel] = d[prop];
                delete d[prop];
            }
        }
    }
}


const db = pgp({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

type transactionFunction = (callback: (t: ITask<any>) => Promise<void>) => Promise<void>;

const tx: transactionFunction = async (callback) => {
    return db.tx(callback);
};

export {db, tx, transactionFunction, ITask};