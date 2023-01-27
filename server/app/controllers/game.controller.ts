import { GameService } from '@app/services/game.service';
import { HTTP_STATUS } from '@app/utils/http';
import { Request, Response, Router } from 'express';
import { Service } from 'typedi';
@Service()
export class GameController {
    router: Router;

    constructor(readonly gameService: GameService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        /**
         * @swagger
         *
         * definitions:
         *   Message:
         *     type: object
         *     properties:
         *       title:
         *         type: string
         *       body:
         *         type: string
         */

        /**
         * @swagger
         * tags:
         *   - name: Time
         *     description: Time endpoints
         */

        /**
         * @swagger
         *
         * /api/date:
         *   get:
         *     description: Return current time
         *     tags:
         *       - Time
         *     produces:
         *       - application/json
         *     responses:
         *       200:
         *         schema:
         *           $ref: '#/definitions/Message'
         */
        this.router.get('/', async (req: Request, res: Response) => {
            // Send the request to the service and send the response
            try {
                const songs = await this.gameService.getAllGames();
                res.status(HTTP_STATUS.SUCCESS).json(songs);
            } catch (error) {
                res.status(HTTP_STATUS.SERVER_ERROR).json(error);
            }
        });
    }
}
