import chai from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../app.js'; 

const { expect } = chai;
chai.use(chaiHttp);

describe('Test multiply API', () => {
  it('should multiply two numbers', (done) => {
    chai.request(app)
      .get('/multiply') 
      .query({ first: 3, second: 4 }) 
      .end((err, res) => {
        if (err) done(err);
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body.result).to.equal(12);
        done();
      });
  });
});