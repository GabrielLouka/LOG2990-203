import { GameStorageService } from '@app/services/game-storage.service';
import { EntireGameUploadForm } from '@common/entire.game.upload.form';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class GamesController {
    router: Router;
    constructor(public gameStorageService: GameStorageService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/:id', async (req: Request, res: Response) => {
            try {
                const games = await this.gameStorageService.getNextGames(parseInt(req.params.id, 10));
                // res.json(games);
                res.send(JSON.stringify(games));
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });

        this.router.post('/updateName', async (req: Request, res: Response) => {
            const receivedArguments: [number, string] = req.body;
            // eslint-disable-next-line no-console
            console.log('updating name, id= ' + receivedArguments[0] + ' name=' + receivedArguments[1]);
            this.gameStorageService
                .updateGameName(receivedArguments[0], receivedArguments[1])
                .then(() => {
                    res.status(StatusCodes.OK).send();
                })
                .catch((error: Error) => {
                    res.status(StatusCodes.NOT_FOUND).send(error.message);
                });
        });

        this.router.post('/saveGame', async (req: Request, res: Response) => {
            const receivedNameForm: EntireGameUploadForm = req.body;

            // eslint-disable-next-line no-console
            console.log(
                'saving game, id= ' +
                    receivedNameForm.gameId +
                    ' name=' +
                    receivedNameForm.gameName +
                    ' num differences=' +
                    receivedNameForm.differences.length,
            );

            const buffer1 = Buffer.from(receivedNameForm.firstImage.background);
            const buffer2 = Buffer.from(receivedNameForm.secondImage.background);

            this.gameStorageService.storeGameImages(receivedNameForm.gameId, buffer1, buffer2);
            await this.gameStorageService.storeGameResult(receivedNameForm.gameId, receivedNameForm.differences, receivedNameForm.isEasy);
            this.gameStorageService
                .updateGameName(receivedNameForm.gameId, receivedNameForm.gameName)
                .then(() => {
                    res.status(StatusCodes.CREATED).send();
                })
                .catch((error: Error) => {
                    res.status(StatusCodes.NOT_FOUND).send(error.message);
                });
        });

        this.router.post('/deleteAllGames', async (req: Request, res: Response) => {
            this.gameStorageService
                .deleteAllGames()
                .then(() => {
                    res.status(StatusCodes.OK).send();
                })
                .catch((error: Error) => {
                    res.status(StatusCodes.NOT_FOUND).send(error.message);
                });
        });
    }
}
