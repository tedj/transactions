import uuid from 'uuid';
import models from '../models';

async function transferController(req, res, next) {
  const { from, to, amount } = req.body;
  const validationErrors = await models.Transaction.build({
    amount,
    reference: uuid.v4(),
    account: from,
  }).validate();
  if (validationErrors) {
    return res.status(400).json(validationErrors);
  }
  try {
    await models.Balance.transfer(from, to, amount);
    return res.json({});
  } catch (err) {
    return next(err);
  }
}

export { transferController };
