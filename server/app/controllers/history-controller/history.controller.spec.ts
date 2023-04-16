/* eslint-disable @typescript-eslint/no-explicit-any */
import { Application } from '@app/app';
import { HistoryStorageService } from '@app/services/history-storage-service/history-storage.service';
import { expect } from 'chai';
import { StatusCodes } from 'http-status-codes';
import * as sinon from 'sinon';
import { createSandbox, createStubInstance, SinonSandbox, SinonStubbedInstance } from 'sinon';
import * as supertest from 'supertest';
import { Container } from 'typedi';

const HTTP_STATUS_OK = StatusCodes.OK;
const API_URL = '/api/history';
const HTTP_STATUS_NOT_FOUND = StatusCodes.NOT_FOUND;
describe('HistoryController', () => {
    let historyStorageService: SinonStubbedInstance<HistoryStorageService>;
    let sandbox: SinonSandbox;
    let expressApp: Express.Application;
    beforeEach(async () => {
        sandbox = createSandbox();
        historyStorageService = createStubInstance(HistoryStorageService);

        const app = Container.get(Application);
        Object.defineProperty(app['historyController'], 'historyStorageService', { value: historyStorageService });
        expressApp = app.app;
    });

    afterEach(() => {
        sinon.restore();
        sandbox.restore();
    });

    it('GET should return the leaderboards', async () => {
        historyStorageService.getAllHistory.returns(
            Promise.resolve([
                {
                    constant: 'test',
                },
            ]),
        );
        supertest(expressApp)
            .get(`${API_URL}/`)
            .expect(HTTP_STATUS_OK)
            .then((response) => {
                expect(response.body).to.deep.equal([{ constant: 'test' }]);
            });
    });
    it('GET should catch error', async () => {
        const errorMessage = 'Test error';
        historyStorageService.getAllHistory.rejects(errorMessage);

        supertest(expressApp)
            .get(`${API_URL}/`)
            .expect(HTTP_STATUS_OK)
            .end((err) => {
                if (err) return err;
            });
    });

    it('DELETE should remove the constants ', async () => {
        historyStorageService.wipeHistory.resolves();
        await supertest(expressApp).delete(`${API_URL}/`).expect(HTTP_STATUS_NOT_FOUND);
        sinon.restore();
    });
});
