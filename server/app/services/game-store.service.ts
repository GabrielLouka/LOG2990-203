import { mkdir, readFileSync, writeFile, writeFileSync } from 'fs';
import { Service } from 'typedi';

@Service()
export class GameStoreService {
    private readonly persistentDataFolderPath = './stored data/';
    private readonly lastGameIdFileName = 'lastGameId.txt';

    getNextAvailableGameId(): number {
        let output = -1;
        // read the next id from the file lastGameId.txt if it exists or create it with 0
        try {
            let lastGameId = 0;
            const data = readFileSync(this.persistentDataFolderPath + this.lastGameIdFileName);
            lastGameId = parseInt(data.toString(), 10);
            const nextGameId = lastGameId + 1;
            writeFileSync(this.persistentDataFolderPath + this.lastGameIdFileName, nextGameId.toString());
            output = nextGameId;
        } catch (err) {
            writeFileSync(this.persistentDataFolderPath + this.lastGameIdFileName, '0');
            output = 0;
        }

        return output;
    }

    storeGameImages(gameId: number, firstImage: Buffer, secondImage: Buffer): void {
        const folderPath = this.persistentDataFolderPath + gameId + '/';
        // first, create the subfolder for the game if it does not exist
        mkdir(folderPath, { recursive: true }, (err) => {
            if (err) {
                // eslint-disable-next-line no-console
                console.error(err);
            } else {
                // eslint-disable-next-line no-console
                console.log('Folder successfully created.');
            }
        });

        writeFile(folderPath + '1.bmp', firstImage, (err) => {
            if (err) {
                // eslint-disable-next-line no-console
                console.error(err);
            } else {
                // eslint-disable-next-line no-console
                console.log('File successfully written.');
            }
        });

        writeFile(folderPath + '2.bmp', secondImage, (err) => {
            if (err) {
                // eslint-disable-next-line no-console
                console.error(err);
            } else {
                // eslint-disable-next-line no-console
                console.log('File successfully written.');
            }
        });
    }
}
