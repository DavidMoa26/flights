/* eslint-env mocha */
process.env.NODE_ENV = 'test';

import chai from 'chai';
import chaiHttp from 'chai-http';
import { app, startTestServer } from './test.js';

const { expect } = chai;
chai.use(chaiHttp);
let server = null;

describe('Backend Tests', () => {
  before(async function () {
    this.timeout(10000);
    server = await startTestServer();
    console.log('tests is running');
  });

  after(async () => {
    server.close();
  });

  it('should return "createFlight"', (done) => {
    chai.request
      .execute(app)
      .post(`/create-flight`, {})
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).equal('createFlight');
        done();
      });
  });
});
