import { ImageProcessingService } from '@app/services/image-processing.service';
import { ImageUploadForm } from '@common/image.upload.form';
import { ImageUploadResult } from '@common/image.upload.result';
import { Request, Response, Router } from 'express';
import { writeFile } from 'fs';
import { Service } from 'typedi';

const HTTP_STATUS_CREATED = 201;
const HTTP_BAD_REQUEST = 400;

@Service()
export class ImageProcessingController {
    router: Router;

    constructor(private readonly imageProcessingService: ImageProcessingService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.post('/send-image', (req: Request, res: Response) => {
            const receivedDifferenceImages: ImageUploadForm = req.body;
            const buffer1 = Buffer.from(receivedDifferenceImages.firstImage.background);
            const buffer2 = Buffer.from(receivedDifferenceImages.secondImage.background);

            writeFile('./assets/file.bmp', buffer1, (err) => {
                if (err) {
                    // eslint-disable-next-line no-console
                    console.error(err);
                } else {
                    // eslint-disable-next-line no-console
                    console.log('File successfully written.');
                }
            });

            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            // let outputBuffer: Buffer = Buffer.from(buffer1);
            let status = HTTP_STATUS_CREATED;
            let outputResult: ImageUploadResult = { resultImageByteArray: Array.from(new Uint8Array(buffer1)), numberOfDifferences: 0, message: '' };
            try {
                outputResult = this.imageProcessingService.getDifferencesBlackAndWhiteImage(buffer1, buffer2, receivedDifferenceImages.radius);
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error(e);
                status = HTTP_BAD_REQUEST;
                outputResult.message = '' + e;
            }

            // const byteArray: number[] = Array.from(new Uint8Array(outputBuffer));
            // res.status(status).send(JSON.stringify(byteArray));
            res.status(status).send(JSON.stringify(outputResult));
        });
    }
}
