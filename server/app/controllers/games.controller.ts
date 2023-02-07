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

        this.router.get('/fetchGame/:id', async (req: Request, res: Response) => {
            try {
                console.log('in fetchGames with id = ' + req.params.id);
                const game = await this.gameStorageService.getGameById(req.params.id);
                // res.json(games);
                res.send(JSON.stringify(game));
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });

        this.router.get('/:id', async (req: Request, res: Response) => {
            try {
                const games = await this.gameStorageService.getGamesInPage(parseInt(req.params.id, 10));
                const gameLength = await this.gameStorageService.getGamesLength();
                const gameInformation = { gameContent: games, nbrOfGame: gameLength };
                res.send(JSON.stringify(gameInformation));
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });
        this.router.post('/updateName', async (req: Request, res: Response) => {
            const receivedArguments: [number, string] = req.body;
            const idIndex = 0;
            const nameIndex = 1;
            // eslint-disable-next-line no-console
            console.log('updating name, id= ' + receivedArguments[idIndex] + ' name=' + receivedArguments[nameIndex]);
            this.gameStorageService
                .updateGameName(receivedArguments[idIndex], receivedArguments[nameIndex])
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

        this.router.delete('/deleteAllGames', async (req: Request, res: Response) => {
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
