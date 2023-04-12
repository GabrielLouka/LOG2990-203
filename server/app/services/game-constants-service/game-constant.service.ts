/* eslint-disable no-console */
import { GAME_CONSTANTS_FILE, PERSISTENT_DATA_FOLDER_PATH } from '@app/utils/env';
import { readFileSync, writeFileSync } from 'fs';
import { Service } from 'typedi';

@Service()
export class GameConstantsService {
    getConstants() {
        try {
            const response = readFileSync(PERSISTENT_DATA_FOLDER_PATH + GAME_CONSTANTS_FILE);
            const data = JSON.parse(response.toString());
            return data;
        } catch (error) {
            console.error(error);
        }
    }

    updateConstants(constants: unknown) {
        try {
            const filePath = PERSISTENT_DATA_FOLDER_PATH + GAME_CONSTANTS_FILE;
            const data = JSON.stringify(constants);
            writeFileSync(filePath, data);
        } catch (error) {
            console.error(error);
        }
    }
}
