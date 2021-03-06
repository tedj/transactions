import models from '../models';

async function createBalanaceController(req, res, next) {
  const { account, balance } = req.body;
  try {
    const resp = await models.Balance.create({
      account,
      balance,
    });
    return res.json(resp);
  } catch (err) {
    return next(err);
  }
}

async function getAllBalancesController(req, res, next) {
  try {
    const balances = await models.Balance.findAll();
    return res.json(balances);
  } catch (err) {
    return next(err);
  }
}

async function getBalanceByAccountController(req, res, next) {
  const account = req.params.account;
  try {
    const balance = await models.Balance.getByAccount(account);
    return res.json(balance);
  } catch (err) {
    return next(err);
  }
}

async function resetBalancesController(req, res, next) {
  try {
    await models.Balance.destroy({ where: {} });
    await Promise.all([
      models.Balance.create({ account: 1, balance: 1000 }),
      models.Balance.create({ account: 2, balance: 1000 }),
      models.Balance.create({ account: 3, balance: 1000 }),
    ]);
    return res.json({});
  } catch (err) {
    return next(err);
  }
}


export {
  createBalanaceController,
  getAllBalancesController,
  getBalanceByAccountController,
  resetBalancesController,
};
