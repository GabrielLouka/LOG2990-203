/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable prettier/prettier */
import { Vector2 } from '@common/vector2';
import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import { ImageProcessingService } from './image-processing.service';
describe('Image-Processing Service', () => {
    let imageProcessingService: ImageProcessingService;

    beforeEach(() => {
        imageProcessingService=new ImageProcessingService();
    });
    
    it('should returns the correct image dimensions for a positive image height', ()=> {
        const imageBuffer = sinon.createStubInstance(Buffer);
        imageBuffer.readInt32LE.withArgs(18).returns(12);
        imageBuffer.readInt32LE.withArgs(22).returns(10);
        const expected = new Vector2(12, 10);
        const result = imageProcessingService['getImageDimensions'](imageBuffer);

        assert.deepEqual(result, expected);
    });

    it('should returns the correct image dimensions for a negative image height', ()=> {
        const imageBuffer = sinon.createStubInstance(Buffer);
        imageBuffer.readInt32LE.withArgs(18).returns(12);
        imageBuffer.readInt32LE.withArgs(22).returns(-10);
        const expected = new Vector2(12, 10);
        const result = imageProcessingService['getImageDimensions'](imageBuffer);

        assert.deepEqual(result, expected);
    });
    it('should returns true if the image is in the format 24 bit Bmp', ()=>{
        const imageBuffer=sinon.createStubInstance(Buffer);
        imageBuffer.readUInt16LE.withArgs(28).returns(24);
        const result=imageProcessingService['is24BitDepthBMP'](imageBuffer);
        expect(result).to.be.true;

    });
    it('should returns true if the image is in the format 24 bit Bmp', ()=>{
        const imageBuffer=sinon.createStubInstance(Buffer);
        imageBuffer.readUInt16LE.withArgs(28).returns(22);
        const result=imageProcessingService['is24BitDepthBMP'](imageBuffer);
        expect(result).to.be.false;

    });
    it('calculates the correct starting position of a pixel in the buffer', () => {
        const position = new Vector2(1, 2);
        const imageBuffer=sinon.createStubInstance(Buffer);
        sinon.stub(imageProcessingService, <any>'getImageDimensions').returns(new Vector2(12,10));
        const pixelBufferPos = imageProcessingService['getPixelBufferPosAtPixelPos'](position, imageBuffer);

        expect(pixelBufferPos).to.equal(129);
    });
    
});
