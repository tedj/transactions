import uuid from 'uuid';
import models from '../models';

function transferController(req, res, next) {
  const { from, to, amount } = req.body;
  models.Transaction.build({ amount, reference: uuid.v4(), account: from })
    .validate().then((errors) => {
      if (errors) {
        return res.status(400).json(errors);
      }
      models.Balance.transfer(from, to, amount)
        .then(() => res.json({}))
        .catch(err => next(err));
    });
}

export { transferController };
