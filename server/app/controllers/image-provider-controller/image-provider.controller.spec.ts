/* eslint-disable @typescript-eslint/no-explicit-any */
import { Application } from '@app/app';
import { GameStorageService } from '@app/services/game-storage-service/game-storage.service';
import { Vector2 } from '@common/classes/vector2';
import { GameData } from '@common/interfaces/game-data';
import { expect } from 'chai';
import * as fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import * as sinon from 'sinon';
import { SinonSandbox, SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';
import { ImageProviderController } from './image-provider.controller';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import assert = require('assert');

const API_URL = '/api/images';

const game: GameData = {
    id: 1,
    name: 'Glutton',
    isEasy: true,
    nbrDifferences: 7,
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    differences: [[new Vector2(1, 2), new Vector2(5, 6)], [new Vector2(4, 3)]], // array of all the pixels in a difference
    oneVersusOneRanking: [],
    soloRanking: [],
};
const images = { originalImage: Buffer.from(''), modifiedImage: Buffer.from('') };
const gameInfo = {
    gameData: game as any,
    originalImage: images.originalImage as any,
    matchToJoinIfAvailable: 'abcde' as any,
};

describe('ImageProviderController', () => {
    let gameStorageServiceStub: SinonStubbedInstance<GameStorageService>;
    let sandbox: SinonSandbox;
    let expressApp: Express.Application;
    let imageProviderController: ImageProviderController;

    beforeEach(async () => {
        sandbox = sinon.createSandbox();
        gameStorageServiceStub = sinon.createStubInstance(GameStorageService);
        gameStorageServiceStub.getGameById.returns(
            Promise.resolve({
                gameData: game,
                originalImage: images.originalImage,
                modifiedImage: images.modifiedImage,
                matchToJoinIfAvailable: gameInfo.matchToJoinIfAvailable,
            }),
        );
        imageProviderController = new ImageProviderController();
        const app = Container.get(Application);
        expressApp = app.app;
    });

    afterEach(() => {
        sinon.restore();
        sandbox.restore();
    });

    it('GET should detect when error reading the file and send a 500 error', async () => {
        assert(imageProviderController.router);
        const accessStub = sandbox.stub(fs, 'access');
        const readFileStub = sandbox.stub(fs, 'readFile');
        accessStub.resolves(Buffer.from(''));
        readFileStub.throws(Error);
        supertest(expressApp)
            .get(`${API_URL}/${game.id}/0`)
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
            .then((res) => {
                expect(res.body).to.deep.equal('Internal server error');
            })
            .catch((err) => {
                console.log('erreur : ' + err);
            });
    });

    it('GET should send a 404 error when game is non existent', async () => {
        const wrongGamePath = 'unExistentGame';
        supertest(expressApp)
            .get(`${API_URL}/${wrongGamePath}/2`)
            .then((res) => {
                expect(res.status).to.deep.equal(StatusCodes.NOT_FOUND);
            });
    });
});
