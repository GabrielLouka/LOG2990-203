/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
import { expect } from 'chai';
const fs = require('fs');

import { FileSystemManager } from './file-system-manager';
describe('FileSysteManager', ()=>{
    it('should read the file and return the correct content',async ()=>{
        const fileSystemManager = new FileSystemManager();
    const path = 'C:\Users\ibrah\OneDrive\Bureau\LOG2990-203\server\app\services\file-system/test-file.txt';
    const expectedContents = 'This is a test file.';

    fs.writeFileSync(path, expectedContents);

    const contents = await fileSystemManager.readFile(path);

    expect(contents.toString()).to.equal(expectedContents);

    fs.unlinkSync(path);


    });


});


