/* eslint-disable @typescript-eslint/naming-convention */
// Database constants file
const DB = {
    NAME: 'LOG2990',
    COLLECTION_GAMES: 'games',
    URL: 'mongodb+srv://Admin:admin@cluster0.z0ouwix.mongodb.net/?retryWrites=true&w=majority',
};

const R_ONLY = {
    persistentDataFolderPath: './stored data/',
    lastGameIdFileName: 'lastGameId.txt',
    defaultImagesPath: './stored data/default-img.json',
    gamesLimit: 4,
    originalImageFileName: '1.bmp',
    modifiedImageFileName: '2.bmp',
    REQUIRED_WIDTH: '640',
    REQUIRED_HEIGHT: '480',
};
export { DB };
export { R_ONLY };
