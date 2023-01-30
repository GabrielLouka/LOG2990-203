import { GameStorageService } from '@app/services/game-storage.service';
import { GameData } from '@common/game-data';
import { NextFunction, Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class GamesController {
    router: Router;
    constructor(public gamesService: GameStorageService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/', async (req: Request, res: Response, next: NextFunction) => {
            // Can also use the async/await syntax
            try {
                const games = await this.gamesService.getAllGames();
                res.json(games);
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });

        this.router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
            this.gamesService
                .getGameById(req.params.id)
                .then((game: GameData) => {
                    res.json(game);
                })
                .catch((error: Error) => {
                    res.status(StatusCodes.NOT_FOUND).send(error.message);
                });
        });

        this.router.post('/', async (req: Request, res: Response, next: NextFunction) => {
            console.log(req.body);
            this.gamesService
                .addGame(req.body)
                .then(() => {
                    res.status(StatusCodes.CREATED).send();
                })
                .catch((error: Error) => {
                    res.status(StatusCodes.NOT_FOUND).send(error.message);
                });
        });
    }
}
