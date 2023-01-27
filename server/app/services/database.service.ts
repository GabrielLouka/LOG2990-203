import { Db, MongoClient, OptionalId } from 'mongodb';
// eslint-disable-next-line no-restricted-imports
import { DB_DB } from '../utils/env';

class DatabaseService {
    client: MongoClient;
    db: Db;
    /**
     * TODO : Remplir une collection de données seulement si la collection est vide
     *
     * @param collectionName nom de la collection sur MongoDB
     * @param data tableau contenant les documents à mettre dans la collection
     */
    async populateDb(collectionName: string, data: OptionalId<Document>[]) {
        if ((await this.client.db(DB_DB).collection(collectionName).find({}).toArray()).length === 0) {
            await this.client.db(DB_DB).collection(collectionName).insertMany(data);
        }
    }

    // Méthode pour établir la connection entre le serveur Express et la base de données MongoDB
    async connectToServer(uri: string) {
        try {
            // const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
            // const clientOptions: MongoClientOptions = {
            //     useNewUrlParser: true,
            //     useUnifiedTopology: true,
            // };
            const client = new MongoClient(uri);
            // const client = new MongoClient(uri, clientOptions);
            this.client = client;

            await this.client.connect();
            this.db = this.client.db(DB_DB);
            // eslint-disable-next-line no-console
            console.log('Successfully connected to MongoDB.');
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);
        }
    }
}

const dbService = new DatabaseService();
export { dbService, DatabaseService };

