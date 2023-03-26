/* eslint-disable no-console */
import { HistoryStorageService } from '@app/services/history-storage-service/history-storage.service';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class HistoryController {
    router: Router;
    constructor(public historicStorageService: HistoryStorageService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/fetchHistory/', async (req: Request, res: Response) => {
            try {
                const history = await this.historicStorageService.getAllHistory();
                res.send(JSON.stringify(history));
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });

        // this.router.post('/saveGame', async (req: Request, res: Response) => {
        //     const receivedNameForm: EntireGameUploadForm = req.body;
        //     const buffer1 = Buffer.from(receivedNameForm.firstImage.background);
        //     const buffer2 = Buffer.from(receivedNameForm.secondImage.background);

        //     this.gameStorageService.storeGameImages(receivedNameForm.gameId, buffer1, buffer2);
        //     const newGameToAdd: GameData = {
        //         id: receivedNameForm.gameId,
        //         nbrDifferences: receivedNameForm.differences.length,
        //         differences: receivedNameForm.differences,
        //         name: receivedNameForm.gameName,
        //         isEasy: receivedNameForm.isEasy,
        //         ranking: defaultRankings,
        //     };
        //     this.gameStorageService
        //         .storeGameResult(newGameToAdd)
        //         .then(() => {
        //             res.status(StatusCodes.CREATED).send({ body: receivedNameForm.gameName });
        //         })
        //         .catch((error: Error) => {
        //             res.status(StatusCodes.NOT_FOUND).send(error.message);
        //         });
        // });

        // this.router.delete('/allGames', async (req: Request, res: Response) => {
        //     this.gameStorageService
        //         .allGames()
        //         .then(() => {
        //             res.status(StatusCodes.OK).send({ body: this.gameStorageService.getGamesLength() });
        //         })
        //         .catch((error: Error) => {
        //             res.status(StatusCodes.NOT_FOUND).send(error.message);
        //         });
        // });
    }
}
