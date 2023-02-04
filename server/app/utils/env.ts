// Database constants file
const DB_CONST = {
    DB_DB: 'LOG2990',
    DB_COLLECTION_GAMES: 'games',
    // TODO mettre Admin & password
    DB_URL: 'mongodb+srv://Admin:admin@cluster0.z0ouwix.mongodb.net/?retryWrites=true&w=majority',
};

const R_ONLY = {
    persistentDataFolderPath: './stored data/',
    lastGameIdFileName: 'lastGameId.txt',
    defaultImagesPath: './stored data/default-img.json',
    gamesLimit: 4,
};
export { DB_CONST };
export { R_ONLY };
