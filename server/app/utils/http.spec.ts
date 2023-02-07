import { expect } from 'chai';
import { describe } from 'mocha';
import { HTTP_STATUS } from './http';

describe('Http status', () => {

    it('HTTP_STATUS should be object', () => {        
        const status = HTTP_STATUS;

        expect(status).to.equals(HTTP_STATUS);
    });
});