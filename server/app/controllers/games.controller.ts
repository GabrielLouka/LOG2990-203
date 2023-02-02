import { GameStorageService } from '@app/services/game-storage.service';
import { Request, Response, Router } from 'express';
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

        // this.router.get('/', async (req: Request, res: Response) => {
        //     // Can also use the async/await syntax
        //     try {
        //         // const games = await this.gamesService.getAllGames();
        //         const games = await this.gamesService.getNextGames();
        //         // res.json(games);
        //         res.send(JSON.stringify(games));
        //     } catch (error) {
        //         res.status(StatusCodes.NOT_FOUND).send(error.message);
        //     }
        // });

        this.router.get('/:id', async (req: Request, res: Response) => {
            try {
                const games = await this.gamesService.getNextGames(parseInt(req.params.id, 10));
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
            this.gamesService
                .updateGameName(receivedArguments[0], receivedArguments[1])
                .then(() => {
                    res.status(StatusCodes.OK).send();
                })
                .catch((error: Error) => {
                    res.status(StatusCodes.NOT_FOUND).send(error.message);
                });
        });
    }
}
