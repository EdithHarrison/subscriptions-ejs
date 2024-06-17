import chai from 'chai';
import chaiHttp from 'chai-http';
import { app, server } from '../app.js'; 
const { expect } = chai;

chai.use(chaiHttp);

describe("test getting a page", function () {
  after(() => {
    server.close();
  });

  it("should get the index page", (done) => {
    chai
      .request(app)
      .get("/")
      .send()
      .end((err, res) => {
        expect(err).to.equal(null);
        expect(res).to.have.status(200);
        expect(res).to.have.property("text");
        expect(res.text).to.include("Click this link"); // Adjust this line based on actual content
        done();
      });
  });
});

