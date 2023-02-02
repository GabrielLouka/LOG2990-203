/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */
import { ImageProcessingService } from '@app/services/image-processing.service';
import { expect } from 'chai';
describe('ImageProcessingService', () => {
    let imageProcessingService: ImageProcessingService;

    beforeEach(() => {
        imageProcessingService = new ImageProcessingService();
    });

    it('should return error if the images dimensions are not 640x480', () => {
        const imageBuffer1 = Buffer.alloc(100, 1);
        const imageBuffer2 = Buffer.alloc(100, 2);

        try {
            imageProcessingService.getDifferencesBlackAndWhiteImage(imageBuffer1, imageBuffer2, 0);
        } catch (error) {
            expect(error.message).to.be('Images must be 640x480! (img 1 undefinedxundefined) (img 2 undefinedxundefined)');
        }
    });

    it('should return error if the images are not 24 bit depth BMPs', () => {
        const imageBuffer1 = Buffer.alloc(100, 1);
        const imageBuffer2 = Buffer.alloc(100, 2);

        try {
            imageProcessingService.getDifferencesBlackAndWhiteImage(imageBuffer1, imageBuffer2, 0);
        } catch (error) {
            expect(error.message).to.be('Images must be 24 bit depth BMPs!');
        }
    });

    it('should return image with black pixels for each different pixel positions', () => {
        // Setup sample images
        const imageBuffer1 = Buffer.alloc(100, 1);
        const imageBuffer2 = Buffer.alloc(100, 2);

        const [result, differences] = imageProcessingService.getDifferencesBlackAndWhiteImage(imageBuffer1, imageBuffer2, 0);

        expect(result.resultImageByteArray).to.equal(Array.from(new Uint8Array(imageBuffer1)));
        expect(result.numberOfDifferences).to.equal(differences.length);
        expect(result.message).to.be('Success!');
        expect(result.generatedGameId).to.be('-1');
        expect(differences).to.equal([]);
    });
});

