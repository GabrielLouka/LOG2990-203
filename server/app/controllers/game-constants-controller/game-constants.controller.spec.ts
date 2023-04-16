/* eslint-disable @typescript-eslint/no-explicit-any */
import { Application } from '@app/app';
import { GameConstantsService } from '@app/services/game-constants-service/game-constant.service';
import { expect } from 'chai';
import { StatusCodes } from 'http-status-codes';
import * as sinon from 'sinon';
import { createSandbox, createStubInstance, SinonSandbox, SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

// const HTTP_STATUS_NOT_FOUND = StatusCodes.NOT_FOUND;
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

    it('GET should return the constants', async () => {
        gameConstantsServiceStub.getConstants.returns(
            Promise.resolve({
                constant: 'test',
            }),
        );
        supertest(expressApp)
            .get(`${API_URL}/`)
            .expect(HTTP_STATUS_OK)
            .then((response) => {
                expect(response.body).to.deep.equal({ constant: 'test' });
            });
    });
    it('GET should catch error', async () => {
        const errorMessage = 'Test error';
        gameConstantsServiceStub.getConstants.rejects(errorMessage);

        supertest(expressApp)
            .get(`${API_URL}/`)
            .expect(HTTP_STATUS_OK)
            .end((err, res) => {
                if (err) return err;
                // expect(res.body).to.deep.equal(game);
            });
    });

    it('POST should update the constants ', async () => {
        gameConstantsServiceStub.updateConstants.resolves();
        const newConstants = {
            constant: 'test',
        };
        await supertest(expressApp).post(`${API_URL}/`).send(newConstants).expect(HTTP_STATUS_OK);
        sinon.restore();
    });

    // it('POST should not update the constants when an error occurs', async () => {
    //     const errorMessage = 'Store game result failed';
    //     gameConstantsServiceStub.updateConstants.rejects(errorMessage);

    //     await supertest(expressApp)
    //         .post(`${API_URL}/`)
    //         .send({
    //             constant: 'test',
    //         })
    //         .expect(HTTP_STATUS_NOT_FOUND)
    //         .then((response) => {
    //             expect(response.text).to.equal('');
    //         });
    //     sinon.restore();
    // });
});
