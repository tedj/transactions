import { Router } from 'express';
import { transferController } from '../controllers/transfer';
import { insertBalanaceController, getAllBalancesController } from '../controllers/balance';

const router = Router();

router.route('/balances/transfer').post(transferController);
router.route('/balances').post(insertBalanaceController);
router.route('/balances').get(getAllBalancesController);

export default router;
