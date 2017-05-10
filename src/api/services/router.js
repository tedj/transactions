import { Router } from 'express';
import { transferController } from '../controllers/transfer';
import {
  createBalanaceController,
  getAllBalancesController,
  getBalanceByAccountController,
  resetBalancesController,
} from '../controllers/balance';

const router = Router();

router.route('/balances/transfer').post(transferController);
router.route('/balances').post(createBalanaceController);
router.route('/balances').get(getAllBalancesController);
router.route('/balances/:account').get(getBalanceByAccountController);
router.route('/balances/reset').post(resetBalancesController);

export default router;
