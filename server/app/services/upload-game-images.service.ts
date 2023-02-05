import { GameStorageService } from '@app/services/game-storage.service';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

// I don't know what this is, but it's not used
@Service()
export class UploadGameImagesService {
    router: Router;
    constructor(public gameStorageService: GameStorageService) {
        this.configureRouter();
    }
    private configureRouter(): void {
        this.router = Router();

        this.router.get('/:id', async (req: Request, res: Response) => {
            try {
                const game = await this.gameStorageService.getGameById(req.params.id);
                res.send(JSON.stringify(game));
            } catch (error) {
                res.status(StatusCodes.NOT_FOUND).send(error.message);
            }
        });
    }

    // async getGameImages(game: GameData) {}
}
