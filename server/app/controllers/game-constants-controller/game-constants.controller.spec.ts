import { Application } from '@app/app';
import { GameConstantsService } from '@app/services/game-constants-service/game-constant.service';
import { expect } from 'chai';
import { StatusCodes } from 'http-status-codes';
import * as sinon from 'sinon';
import { createSandbox, createStubInstance, SinonSandbox, SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

const HTTP_STATUS_NOT_FOUND = StatusCodes.NOT_FOUND;
const HTTP_STATUS_OK = StatusCodes.OK;

const API_URL = '/api/game_constants';

describe('GameConstantsController', () => {
    let gameConstantsServiceStub: SinonStubbedInstance<GameConstantsService>;
    let sandbox: SinonSandbox;
    let expressApp: Express.Application;

    beforeEach(async () => {
        sandbox = createSandbox();
        gameConstantsServiceStub = createStubInstance(GameConstantsService);

        const app = Container.get(Application);
        Object.defineProperty(app['gameConstantsController'], 'gameConstantsService', { value: gameConstantsServiceStub });
        expressApp = app.app;
    });

    afterEach(() => {
        sinon.restore();
        sandbox.restore();
    });

    describe('GET /', () => {
        it('should return the constants', async () => {
            gameConstantsServiceStub.getConstants.returns(
                Promise.resolve({
                    constant: { countdownValue: 120, penaltyValue: 5, bonusValue: 5 },
                }),
            );
            const response = await supertest(expressApp).get(`${API_URL}/`);
            expect(response.status).to.equal(HTTP_STATUS_OK);
            expect(response.body).to.deep.equal({});
        });

        it('should return a not found status if an error is thrown', async () => {
            const errorMessage = '';
            gameConstantsServiceStub.getConstants.rejects(errorMessage);
            const response = await supertest(expressApp).get(`${API_URL}/`);
            expect(response.status).to.equal(HTTP_STATUS_NOT_FOUND);
            expect(response.text).to.equal(errorMessage);
        });
    });

    describe('POST /', () => {
        it('should update the constants', async () => {
            const newConstants = {};
            gameConstantsServiceStub.updateConstants.resolves(newConstants);
            const response = await supertest(expressApp).post(`${API_URL}/`).send(newConstants);
            expect(response.status).to.equal(HTTP_STATUS_OK);
            expect(response.body).to.deep.equal(newConstants);
        });
    });
});
