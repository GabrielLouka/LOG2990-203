import { GameStorageService } from '@app/services/game-storage-service/game-storage.service';
import { ImageProcessingService } from '@app/services/image-processing-service/image-processing.service';
import { ImageUploadForm } from '@common/image.upload.form';
import { ImageUploadResult } from '@common/image.upload.result';
import { HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_CREATED, NOT_FOUND } from '@common/utils/env';
import { Request, Response, Router } from 'express';
import { Service } from 'typedi';

@Service()
export class ImageProcessingController {
    router: Router;

    constructor(private readonly imageProcessingService: ImageProcessingService, private readonly gameStorageService: GameStorageService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/send-image', (req: Request, res: Response) => {
            const receivedDifferenceImages: ImageUploadForm = req.body;
            const buffer1 = Buffer.from(receivedDifferenceImages.firstImage.background);
            const buffer2 = Buffer.from(receivedDifferenceImages.secondImage.background);

            let status = HTTP_STATUS_CREATED;
            let outputResultToSendToClient: ImageUploadResult = {
                resultImageByteArray: Array.from(new Uint8Array(buffer1)),
                numberOfDifferences: 0,
                message: '',
                generatedGameId: NOT_FOUND,
                differences: [],
                isEasy: true,
            };
            try {
                const out = this.imageProcessingService.getDifferencesBlackAndWhiteImage(buffer1, buffer2, receivedDifferenceImages.radius);
                outputResultToSendToClient = out;
                outputResultToSendToClient.generatedGameId = this.gameStorageService.getNextAvailableGameId();
            } catch (e) {
                status = HTTP_STATUS_BAD_REQUEST;
                outputResultToSendToClient.message = '' + e;
            }

            res.status(status).send(JSON.stringify(outputResultToSendToClient));
        });
    }
}
