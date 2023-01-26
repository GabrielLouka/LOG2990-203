import { ImageProcessingService } from '@app/services/image-processing.service';
import { ImageUploadForm } from '@common/image.upload.form';
import { Request, Response, Router } from 'express';
import { writeFile } from 'fs';
import { Service } from 'typedi';

const HTTP_STATUS_CREATED = 201;

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
            // const firstPixel = this.imageProcessingService.getRGB(639, 479, buffer);
            const outputBuffer: Buffer = this.imageProcessingService.getDifferencesBlackAndWhiteImage(
                buffer1,
                buffer2,
                receivedDifferenceImages.radius,
            );
            const byteArray: number[] = Array.from(new Uint8Array(outputBuffer));
            res.status(HTTP_STATUS_CREATED).send(JSON.stringify(byteArray));
        });
    }
}
