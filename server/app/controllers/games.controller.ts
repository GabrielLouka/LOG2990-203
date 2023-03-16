import { GameStorageService } from '@app/services/game-storage-service/game-storage.service';
import { MatchManagerService } from '@app/services/match-manager-service/match-manager.service';
import { EntireGameUploadForm } from '@common/entire.game.upload.form';
import { GameData } from '@common/game-data';
import { defaultRankings } from '@common/ranking';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class GamesController {
    router: Router;
    constructor(public gameStorageService: GameStorageService, public matchManagerService: MatchManagerService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        // retrieve a single game whose id is :id
        this.router.get('/fetchGame/:id', async (req: Request, res: Response) => {
            try {
                const game = await this.gameStorageService.getGameById(req.params.id);
                res.send(JSON.stringify(game));
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });

        // retrieve the 4 games in page :id. If you want the first 4 games, :id = 0
        this.router.get('/:id', async (req: Request, res: Response) => {
            try {
                const games = await this.gameStorageService.getGamesInPage(parseInt(req.params.id, 10));
                for (const game of games) {
                    game.matchToJoinIfAvailable = this.matchManagerService.getMatchAvailableForGame(game.gameData.id);
                }
                const gameLength = await this.gameStorageService.getGamesLength();
                const gameInformation = { gameContent: games, nbrOfGame: gameLength };
                res.send(JSON.stringify(gameInformation));
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });

        this.router.post('/saveGame', async (req: Request, res: Response) => {
            const receivedNameForm: EntireGameUploadForm = req.body;
            const buffer1 = Buffer.from(receivedNameForm.firstImage.background);
            const buffer2 = Buffer.from(receivedNameForm.secondImage.background);

            this.gameStorageService.storeGameImages(receivedNameForm.gameId, buffer1, buffer2);
            const newGameToAdd: GameData = {
                id: receivedNameForm.gameId,
                nbrDifferences: receivedNameForm.differences.length,
                differences: receivedNameForm.differences,
                name: receivedNameForm.gameName,
                isEasy: receivedNameForm.isEasy,
                ranking: defaultRankings,
            };
            this.gameStorageService
                .storeGameResult(newGameToAdd)
                .then(() => {
                    res.status(StatusCodes.CREATED).send({ body: receivedNameForm.gameName });
                })
                .catch((error: Error) => {
                    res.status(StatusCodes.NOT_FOUND).send(error.message);
                });
        });

        this.router.delete('/deleteAllGames', async (req: Request, res: Response) => {
            this.gameStorageService
                .deleteAllGames()
                .then(() => {
                    res.status(StatusCodes.OK).send({ body: this.gameStorageService.getGamesLength() });
                })
                .catch((error: Error) => {
                    res.status(StatusCodes.NOT_FOUND).send(error.message);
                });
        });
        this.router.delete('/:id', async (req: Request, res: Response) => {
            this.gameStorageService
                .deleteGame(req.params.id)
                .then(() => {
                    res.status(StatusCodes.OK).send({ body: this.gameStorageService.getGamesLength() });
                })
                .catch((error: Error) => {
                    res.status(StatusCodes.NOT_FOUND).send(error.message);
                });
        });
    }
}
