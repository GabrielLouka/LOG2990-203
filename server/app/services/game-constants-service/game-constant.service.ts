/* eslint-disable no-console */
import { R_ONLY } from '@app/utils/env';
import { readFileSync, writeFileSync } from 'fs';
import { Service } from 'typedi';

@Service()
export class GameConstantsService {
    getConstants() {
        try {
            const response = readFileSync(R_ONLY.persistentDataFolderPath + R_ONLY.gameConstantsFileName);
            const data = JSON.parse(response.toString());
            return data;
        } catch (error) {
            console.error(error);
        }
    }

    updateConstants(constants: unknown) {
        try {
            const filePath = R_ONLY.persistentDataFolderPath + R_ONLY.gameConstantsFileName;
            const data = JSON.stringify(constants);
            writeFileSync(filePath, data);
        } catch (error) {
            console.error(error);
        }
    }
}
