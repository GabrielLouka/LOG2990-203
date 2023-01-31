import { expect } from 'chai';
import { describe } from 'mocha';
import { Queue } from "./queue";

describe('Queue', () => {
    let q: Queue<[]>;
    beforeEach(async () => {
        q = new Queue<[]>();
        
    });

    it('queue should initialize with array uppon construction', () => {
        expect(q['queue']).to.deep.equal([]);
    });

    it("length should return difference between end and start", () => {
        const length = 0;
        const ret = q.length;
        expect(ret).to.deep.equal(length);
    })

    it("isEmpty should return if queue is empty", () => {
        const val = q.isEmpty();
        expect(val).to.equal(true);
    })

    it("dequeue should throw error if queue is already empy", () => {
        expect(q.dequeue()).to.throw(new Error('Queue is empty.'));
    })

    it("dequeue should return element", () => {
        q.enqueue([]);
        const element = q.dequeue();
        expect(element).to.deep.equal(q['queue'][0]);
    })
});