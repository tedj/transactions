import chai from 'chai';
import chaiHttp from 'chai-http';
import models from '../api/models';

chai.use(chaiHttp);
const should = chai.should();
const expect = chai.expect;

describe('balance model', () => {
  beforeEach((done) => {
    models.sequelize.sync({ force: true }) // drops table and re-creates it
      .then(async () => {
        const balance1 = await models.Balance.create({ account: 1, balance: 1000 });
        const balance2 = await models.Balance.create({ account: 2, balance: 1000 });
        const balance3 = await models.Balance.create({ account: 3, balance: 1000 });
        done();
      })
      .catch((error) => {
        done(error);
      });
  });
  it('should have all balances', async () => {
    const balances = await models.Balance.findAll();
    expect(balances.length).to.equal(3);
  });
  it('should transfer money from account a to account b', async () => {
    await models.Balance.transfer(1, 2, 100);
    const balance1 = await models.Balance.getByAccount(1);
    const balance2 = await models.Balance.getByAccount(2);
    expect(balance1.balance).to.equal(900);
    expect(balance2.balance).to.equal(1100);
  });
  it('(A, B) transfer money to user C at the same time', async () => {
    await Promise.all([
      models.Balance.transfer(1, 3, 100),
      models.Balance.transfer(2, 3, 100),
    ]);
    const balance3 = await models.Balance.getByAccount(3);
    expect(balance3.balance).to.equal(1200);
  });
  it('should throw an error if the sender or the receiver does not exist', async () => {
    try {
      await models.Balance.transfer(5, 2, 100);
    } catch (err) {
      expect(err).to.eql(new Error('account does not exist'));
    }
  });
  it('should throw an error if the amount is bigger than the current balance', async () => {
    try {
      await models.Balance.transfer(1, 2, 2000);
    } catch (err) {
      expect(err).to.eql(new Error('amount is bigger than the current balance'));
    }
  });
});
