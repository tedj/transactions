import chai from 'chai';
import chaiHttp from 'chai-http';
import retryPromise from 'retry-promise';

const should = chai.should();
const expect = chai.expect;
chai.use(chaiHttp);

const HOST = 'balances';
const PORT = '8080';

const BASE_URL = `http://${HOST}:${PORT}`;
const TRANSFER_API_ENDPOINT = '/api/v1/balances/transfer';
const ALL_BALANCES_ENDPOINT = '/api/v1/balances';
const RESET_BALANCES = '/api/v1/balances/reset';

const getBalanceByAccount = async (account) => {
  const url = `${ALL_BALANCES_ENDPOINT}/${account}`;
  const accountBalance = await chai.request(BASE_URL)
      .get(url);
  return accountBalance.body.balance;
};

const transferBalance = async (from, to, amount) => {
  const params = {
    from,
    to,
    amount,
  };
  return chai.request(BASE_URL)
    .post(TRANSFER_API_ENDPOINT)
    .send(params);
};

const retryUntilAvailable = async () => {
  const resetBalances = (attempt) => {
    if (attempt > 1) {
      console.log('Health Check and reset balances failed, retrying...');
    }
    return chai.request(BASE_URL)
      .post(RESET_BALANCES)
      .send({});
  };
  return retryPromise({ max: 5, backoff: 10000 }, resetBalances);
};

describe('Integration::transfer API', () => {
  describe('/POST /api/v1/balances/transfer', () => {
    beforeEach(async () => {
      await retryUntilAvailable();
    });
    it('it should have 3 balances', (done) => {
      chai.request(BASE_URL)
        .get(ALL_BALANCES_ENDPOINT)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.length).to.equal(3);
          done();
        });
    });
    it('it should not send a not valid amount', (done) => {
      const params = {
        from: 1,
        to: 2,
        amount: 'invalid',
      };
      chai.request(BASE_URL)
        .post(TRANSFER_API_ENDPOINT)
        .send(params)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
    it('it should transfer money from account 1 to to account 2', () => {
      const from = 1;
      const to = 2;
      const amount = 100;
      const params = {
        from,
        to,
        amount,
      };
      chai.request(BASE_URL)
        .post(TRANSFER_API_ENDPOINT)
        .send(params)
        .end(async (err, res) => {
          res.should.have.status(200);
          const balanceFrom = await getBalanceByAccount(from);
          const balanceTo = await getBalanceByAccount(to);
          expect(balanceFrom).to.equal(900);
          expect(balanceTo).to.equal(1100);
        });
    });
    it('(A, B) transfer money to user C at the same time', async () => {
      await Promise.all([
        transferBalance(1, 3, 100),
        transferBalance(2, 3, 100),
      ]);
      const balance3 = await getBalanceByAccount(3);
      expect(balance3).to.equal(1200);
    });
    it('it should not accept transfer from or to accounts that does not exist', (done) => {
      const params = {
        from: 5,
        to: 2,
        amount: 100,
      };
      chai.request(BASE_URL)
        .post(TRANSFER_API_ENDPOINT)
        .send(params)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
    it('should not transfer money if the amount is bigger than the current balance', (done) => {
      const params = {
        from: 1,
        to: 2,
        amount: 5000,
      };
      chai.request(BASE_URL)
        .post(TRANSFER_API_ENDPOINT)
        .send(params)
        .end((err, res) => {
          res.should.have.status(422);
          done();
        });
    });
    it('A has a balance of 1000 and tries to transfer 1000 to user B and C simultaneously', async () => {
      try {
        await Promise.all([
          transferBalance(1, 2, 1000),
          transferBalance(1, 3, 1000),
        ]);
        const balance1 = await getBalanceByAccount(1);
        expect(balance1).to.equal(0);
      } catch (err) {
        const balance1 = await getBalanceByAccount(1);
        expect(balance1).to.equal(0);
      }
    });
  });
});
