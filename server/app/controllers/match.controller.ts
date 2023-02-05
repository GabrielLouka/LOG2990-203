import { GameStorageService } from '@app/services/game-storage.service';
import { MatchingDifferencesService } from '@app/services/matching-differences.service';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class MatchController {
    router: Router;

    constructor(private readonly gameStorageService: GameStorageService, private readonly matchingService: MatchingDifferencesService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/getDifferenceIndex', async (req: Request, res: Response) => {
            const game = await this.gameStorageService.getGameById(req.body.gameId);
            if (game.gameData != null)
                res.status(StatusCodes.OK).send(this.matchingService.getDifferenceIndex(game.gameData, req.body.clickPosition).toString());
            else res.status(StatusCodes.NOT_FOUND).send('Game not found');
        });
    }
}
