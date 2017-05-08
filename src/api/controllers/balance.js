import models from '../models';

function insertBalanaceController(req, res, next) {
  const { account, balance } = req.body;
  models.Balance.create({
    account,
    balance,
  }).then((resp) => {
    res.json({ resp });
  });
}

function getAllBalancesController(req, res, next) {
  models.Balance.findAll().then(balances => res.json(balances));
}

export { insertBalanaceController, getAllBalancesController };
