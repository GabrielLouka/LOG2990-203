/* eslint-disable no-console */
import { HistoryStorageService } from '@app/services/history-storage-service/history-storage.service';
import { HistoryData } from '@common/interfaces/history-data';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class HistoryController {
    router: Router;
    constructor(public historyStorageService: HistoryStorageService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/', async (req: Request, res: Response) => {
            try {
                const history = await this.historyStorageService.getAllHistory();
                res.send(JSON.stringify(history));
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });

        this.router.delete('/', async (req: Request, res: Response) => {
            this.historyStorageService
                .wipeHistory()
                .then(() => {
                    res.status(StatusCodes.OK);
                })
                .catch((error: Error) => {
                    res.status(StatusCodes.NOT_FOUND).send(error.message);
                });
        });

        this.router.post('/', async (req: Request, res: Response) => {
            const historyForm: HistoryData = req.body;
            this.historyStorageService
                .storeHistory(historyForm)
                .then(() => {
                    res.status(StatusCodes.CREATED);
                })
                .catch((error: Error) => {
                    res.status(StatusCodes.NOT_FOUND).send(error.message);
                });
        });
    }
}
