import chai from 'chai';
import chaiHttp from 'chai-http';
import { app, server } from '../app.js';
import { seed_db, testUserPassword } from '../util/seed_db.js';
import { fakerEN_US as faker } from '@faker-js/faker';
import User from '../models/User.js';

const { expect } = chai;

chai.use(chaiHttp);

describe("tests for registration and logon", function () {
  after(() => {
    server.close();
  });

  it("should get the registration page", function (done) {
    chai
      .request(app)
      .get("/sessions/register")
      .send()
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res).to.have.status(200);
        expect(res).to.have.property("text");
        expect(res.text).to.include("Enter your name");
        const textNoLineEnd = res.text.replace(/\n/g, "");
        const csrfToken = /_csrf" value="(.*?)"/.exec(textNoLineEnd);
        expect(csrfToken).to.not.be.null;
        this.csrfToken = csrfToken[1];
        expect(res).to.have.property("headers");
        expect(res.headers).to.have.property("set-cookie");
        const cookies = res.headers["set-cookie"];
        const csrfCookie = cookies.find((element) =>
          element.includes(this.csrfToken)
        );
        expect(csrfCookie).to.not.be.undefined;
        this.csrfCookie = csrfCookie.split(';')[0];
        done();
      });
  });

  it("should register the user", async function () {
    this.password = faker.internet.password();
    this.user = await User.create({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: this.password,
    });

    const dataToPost = {
      name: this.user.name,
      email: this.user.email,
      password: this.password,
      password1: this.password,
      _csrf: this.csrfToken,
    };

    try {
      const request = chai
        .request(app)
        .post("/sessions/register")
        .set("Cookie", this.csrfCookie) // Use the correct CSRF cookie
        .set("content-type", "application/x-www-form-urlencoded")
        .send(dataToPost);
      const res = await request;
      expect(res).to.have.status(200);
      expect(res).to.have.property("text");
      expect(res.text).to.include("Jobs List");
      const newUser = await User.findOne({ email: this.user.email });
      expect(newUser).to.not.be.null;
    } catch (err) {
      expect.fail("Register request failed");
    }
  });
});
