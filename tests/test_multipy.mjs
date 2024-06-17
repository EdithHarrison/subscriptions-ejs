import { expect } from 'chai';
import multiply from '../util/multiply.js';

describe('testing multiply', () => {
  it('should give 7*6 is 42', (done) => {
    expect(multiply(7, 6)).to.equal(42);
    done();
  });

  it('should give 3*5 is 15', () => {
    expect(multiply(3, 5)).to.equal(15);
  });

  it('should give 0*10 is 0', () => {
    expect(multiply(0, 10)).to.equal(0);
  });

  it('should give -4*8 is -32', () => {
    expect(multiply(-4, 8)).to.equal(-32);
  });
});
